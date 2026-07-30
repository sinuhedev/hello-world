import { ColliderDesc, RigidBodyDesc, World } from '@dimforge/rapier3d'
import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector2,
  WebGLRenderer
} from 'three'

// --- 1. THREE.JS SETUP ---
const scene = new Scene()
scene.background = new Color(0x1a1a1a)

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
const renderer = new WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

const raycaster = new Raycaster()
const mouse = new Vector2()

const ambientLight = new AmbientLight(0xffffff, 0.4)
scene.add(ambientLight)

const dirLight = new DirectionalLight(0xffffff, 0.8)
dirLight.position.set(15, 30, 15)
dirLight.castShadow = true
dirLight.shadow.mapSize.width = 2048
dirLight.shadow.mapSize.height = 2048
dirLight.shadow.camera.left = -15
dirLight.shadow.camera.right = 15
dirLight.shadow.camera.top = 15
dirLight.shadow.camera.bottom = -15
scene.add(dirLight)

camera.position.set(0, 6, 18)
camera.lookAt(0, 3, 0)

// --- 2. RAPIER ---
const gravity = { x: 0.0, y: -9.81, z: 0.0 }
const world = new World(gravity)

const physicsObjects = []

// --- 3. SUELO ---
const floorMesh = new Mesh(
  new BoxGeometry(40, 0.5, 40),
  new MeshStandardMaterial({ color: '#5ea3b9', roughness: 0.5 })
)
floorMesh.receiveShadow = true
scene.add(floorMesh)

const floorBody = world.createRigidBody(RigidBodyDesc.fixed())
world.createCollider(ColliderDesc.cuboid(20, 0.25, 20), floorBody)

// --- 4. TORRE DE CUBOS ---
const CUBE_SIZE = 1.0
const HALF_SIZE = CUBE_SIZE / 2
const sharedCubeGeo = new BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
const sharedCubeMat = new MeshStandardMaterial({
  color: 0xdd8800,
  roughness: 0.4
})

function createCubeTower() {
  const ROWS = 6,
    COLS = 5,
    DEPTH = 2

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      for (let z = 0; z < DEPTH; z++) {
        const posX = (x - (COLS - 1) / 2) * CUBE_SIZE
        const posY = 0.25 + HALF_SIZE + y * CUBE_SIZE
        const posZ = (z - (DEPTH - 1) / 2) * CUBE_SIZE

        const cubeMesh = new Mesh(sharedCubeGeo, sharedCubeMat)
        cubeMesh.castShadow = true
        cubeMesh.receiveShadow = true
        cubeMesh.position.set(posX, posY, posZ)
        scene.add(cubeMesh)

        const cubeBody = world.createRigidBody(
          RigidBodyDesc.dynamic().setTranslation(posX, posY, posZ)
        )
        world.createCollider(
          ColliderDesc.cuboid(HALF_SIZE, HALF_SIZE, HALF_SIZE)
            .setRestitution(0.2)
            .setFriction(0.6),
          cubeBody
        )
        physicsObjects.push({ mesh: cubeMesh, body: cubeBody, isCube: true })
      }
    }
  }
}

createCubeTower()

// --- 5. DISPARAR PELOTAS ---
const BALL_RADIUS = 0.4
const MAX_BALLS = 20
const sharedBallGeo = new SphereGeometry(BALL_RADIUS, 32, 32)
const sharedBallMat = new MeshStandardMaterial({
  color: 0x00ffcc,
  roughness: 0.1
})

let lastShotTime = 0
const SHOOT_COOLDOWN_MS = 150

function shootBall(event) {
  const now = performance.now()
  if (now - lastShotTime < SHOOT_COOLDOWN_MS) return
  lastShotTime = now

  const ballObjects = physicsObjects.filter((o) => !o.isCube)
  if (ballObjects.length >= MAX_BALLS) {
    const oldest = ballObjects[0]
    scene.remove(oldest.mesh)
    world.removeRigidBody(oldest.body)
    const idx = physicsObjects.indexOf(oldest)
    if (idx !== -1) physicsObjects.splice(idx, 1)
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera)

  const direction = raycaster.ray.direction.clone().normalize()

  const ballMesh = new Mesh(sharedBallGeo, sharedBallMat)
  ballMesh.castShadow = true
  scene.add(ballMesh)

  const spawnPos = camera.position
    .clone()
    .add(direction.clone().multiplyScalar(0.5))

  const ballBody = world.createRigidBody(
    RigidBodyDesc.dynamic().setTranslation(spawnPos.x, spawnPos.y, spawnPos.z)
  )
  world.createCollider(
    ColliderDesc.ball(BALL_RADIUS).setRestitution(0.6).setDensity(3.0),
    ballBody
  )

  ballBody.applyImpulse(
    { x: direction.x * 50, y: direction.y * 50, z: direction.z * 50 },
    true
  )

  physicsObjects.push({ mesh: ballMesh, body: ballBody, isCube: false })
}

window.addEventListener('click', shootBall)

// --- 6. RESET CON TECLA R ---
function resetScene() {
  for (const obj of physicsObjects) {
    scene.remove(obj.mesh)
    world.removeRigidBody(obj.body)
  }
  physicsObjects.length = 0
  createCubeTower()
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') resetScene()
})

// --- 7. BUCLE DE ANIMACIÓN ---
function animate() {
  requestAnimationFrame(animate)
  world.step()

  for (let i = physicsObjects.length - 1; i >= 0; i--) {
    const obj = physicsObjects[i]
    const pos = obj.body.translation()
    const rot = obj.body.rotation()

    obj.mesh.position.set(pos.x, pos.y, pos.z)
    obj.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w)

    if (pos.y < -20) {
      scene.remove(obj.mesh)
      world.removeRigidBody(obj.body)
      physicsObjects.splice(i, 1)
    }
  }

  renderer.render(scene, camera)
}

animate()

// --- 8. RESIZE ---
const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', onResize)

// --- 9. CLEANUP ---
export function destroy() {
  window.removeEventListener('click', shootBall)
  window.removeEventListener('resize', onResize)
  renderer.dispose()
}
