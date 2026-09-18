import { Link, useFx, useQueryString } from 'lib'

const qs = useQueryString()
const { state, fx } = useFx(0)

export default function Pages() {
  return (
    <div
      style={{ fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}
    >
      <br />

      <Link href="/">Go to href=/</Link>

      <br />

      <Link href="#/" value={{ id: 2, user: 'Maceda' }}>
        Link id=2 user=Maceda{' '}
      </Link>

      <br />

      <Link href="#/" value={{ id: 1, user: 'Sinuhe' }}>
        Link id=1 user=Sinuhe
      </Link>

      <br />

      <pre style={{ margin: '0 50px 0 50px' }}>
        {JSON.stringify(qs.value, undefined, 2)}
      </pre>

      <br />

      <h1>¡Hola Mundo!</h1>
      <h2>Contador: {state.value}</h2>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button type="button" onClick={fx.decrementar}>
          Restar -1
        </button>
        <button type="button" onClick={fx.incrementar}>
          Sumar +1
        </button>
      </div>
    </div>
  )
}
