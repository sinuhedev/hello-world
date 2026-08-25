import * as CANNON from 'cannon-es'
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
  Vector3,
  WebGLRenderer
} from 'three'

/**
 * Game
 */
class Game {
  static #GRAVITY = new CANNON.Vec3(0, -9.81, 0)
  static #CUBE_SIZE = 1
  static #HALF_CUBE = 0.5
  static #BALL_RADIUS = 0.4
  static #MAX_BALLS = 20
  static #SHOOT_COOLDOWN_MS = 150
  static #SHOOT_IMPULSE = 50
  static #FALL_THRESHOLD_Y = -20
  static #TOWER = { rows: 6, cols: 5, depth: 2 }
  static #CUBE_MASS = 1
  static #BALL_MASS = 2
  static #TIME_STEP = 1 / 60

  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.world = null
    this.physicsObjects = []
    this.raycaster = new Raycaster()
    this.mouse = new Vector2()
    this._dir = new Vector3()
    this.lastShotTime = 0

    this.sharedCubeGeo = new BoxGeometry(
      Game.#CUBE_SIZE,
      Game.#CUBE_SIZE,
      Game.#CUBE_SIZE
    )
    this.sharedCubeMat = new MeshStandardMaterial({
      color: 0xdd8800,
      roughness: 0.4
    })
    this.sharedBallGeo = new SphereGeometry(Game.#BALL_RADIUS, 32, 32)
    this.sharedBallMat = new MeshStandardMaterial({
      color: 0x00ffcc,
      roughness: 0.1
    })

    this.onResize = this.onResize.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.shootBall = this.shootBall.bind(this)
    this.onContextMenu = this.onContextMenu.bind(this)
    this.animate = this.animate.bind(this)
  }

  /**
   * Setup
   */
  setupThree() {
    this.scene = new Scene()
    this.scene.background = new Color(0x1a1a1a)

    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 6, 18)
    this.camera.lookAt(0, 3, 0)

    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    document.body.appendChild(this.renderer.domElement)

    this.scene.add(new AmbientLight(0xffffff, 0.4))

    const dirLight = new DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(15, 30, 15)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.set(2048, 2048)
    dirLight.shadow.camera.left = -15
    dirLight.shadow.camera.right = 15
    dirLight.shadow.camera.top = 15
    dirLight.shadow.camera.bottom = -15
    this.scene.add(dirLight)
  }

  setupPhysics() {
    this.world = new CANNON.World({
      gravity: Game.#GRAVITY
    })

    this.world.defaultContactMaterial.friction = 0.6
    this.world.defaultContactMaterial.restitution = 0.2
  }

  createFloor() {
    const mesh = new Mesh(
      new BoxGeometry(40, 0.5, 40),
      new MeshStandardMaterial({ color: '#5ea3b9', roughness: 0.5 })
    )
    mesh.receiveShadow = true
    this.scene.add(mesh)

    const body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(20, 0.25, 20)),
      position: new CANNON.Vec3(0, 0, 0)
    })
    this.world.addBody(body)
  }

  createCubeTower() {
    const { rows, cols, depth } = Game.#TOWER
    const size = Game.#CUBE_SIZE
    const half = Game.#HALF_CUBE

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        for (let z = 0; z < depth; z++) {
          const posX = (x - (cols - 1) / 2) * size
          const posY = 0.25 + half + y * size
          const posZ = (z - (depth - 1) / 2) * size

          const mesh = new Mesh(this.sharedCubeGeo, this.sharedCubeMat)
          mesh.castShadow = true
          mesh.receiveShadow = true
          mesh.position.set(posX, posY, posZ)
          this.scene.add(mesh)

          const body = new CANNON.Body({
            mass: Game.#CUBE_MASS,
            shape: new CANNON.Box(new CANNON.Vec3(half, half, half)),
            position: new CANNON.Vec3(posX, posY, posZ)
          })
          this.world.addBody(body)

          this.physicsObjects.push({ mesh, body, isCube: true })
        }
      }
    }
  }

  /**
   * Balls
   */
  removeObject(obj) {
    this.scene.remove(obj.mesh)
    this.world.removeBody(obj.body)
    const idx = this.physicsObjects.indexOf(obj)
    if (idx !== -1) this.physicsObjects.splice(idx, 1)
  }

  shootBall(event) {
    if (event.button !== 0) return

    const now = performance.now()
    if (now - this.lastShotTime < Game.#SHOOT_COOLDOWN_MS) return
    this.lastShotTime = now

    const balls = this.physicsObjects.filter((o) => !o.isCube)
    if (balls.length >= Game.#MAX_BALLS) this.removeObject(balls[0])

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    this.raycaster.setFromCamera(this.mouse, this.camera)

    this._dir.copy(this.raycaster.ray.direction).normalize()
    const spawn = this.camera.position.clone().addScaledVector(this._dir, 0.5)

    const mesh = new Mesh(this.sharedBallGeo, this.sharedBallMat)
    mesh.castShadow = true
    this.scene.add(mesh)

    const body = new CANNON.Body({
      mass: Game.#BALL_MASS,
      shape: new CANNON.Sphere(Game.#BALL_RADIUS),
      position: new CANNON.Vec3(spawn.x, spawn.y, spawn.z)
    })
    body.material = new CANNON.Material({ restitution: 0.6, friction: 0.3 })
    this.world.addBody(body)

    const impulse = Game.#SHOOT_IMPULSE
    body.applyImpulse(
      new CANNON.Vec3(
        this._dir.x * impulse,
        this._dir.y * impulse,
        this._dir.z * impulse
      )
    )

    this.physicsObjects.push({ mesh, body, isCube: false })
  }

  /**
   * Reset
   */
  resetScene() {
    for (const obj of this.physicsObjects) {
      this.scene.remove(obj.mesh)
      this.world.removeBody(obj.body)
    }
    this.physicsObjects.length = 0
    this.createCubeTower()
  }

  /**
   * Loop
   */
  animate() {
    requestAnimationFrame(this.animate)
    this.world.step(Game.#TIME_STEP)

    for (let i = this.physicsObjects.length - 1; i >= 0; i--) {
      const { mesh, body } = this.physicsObjects[i]
      const pos = body.position
      const rot = body.quaternion

      mesh.position.set(pos.x, pos.y, pos.z)
      mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w)

      if (pos.y < Game.#FALL_THRESHOLD_Y) {
        this.scene.remove(mesh)
        this.world.removeBody(body)
        this.physicsObjects.splice(i, 1)
      }
    }

    this.renderer.render(this.scene, this.camera)
  }

  /**
   * Events
   */
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  onKeyDown(e) {
    if (e.key === 'r' || e.key === 'R') this.resetScene()
  }

  onContextMenu(e) {
    e.preventDefault()
  }

  bindEvents() {
    window.addEventListener('click', this.shootBall)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('resize', this.onResize)
    window.addEventListener('contextmenu', this.onContextMenu)
  }

  /**
   * Start
   */
  start() {
    this.setupThree()
    this.setupPhysics()
    this.createFloor()
    this.createCubeTower()
    this.bindEvents()
    this.animate()
  }
}

/**
 * Main
 */
const game = new Game()
game.start()
