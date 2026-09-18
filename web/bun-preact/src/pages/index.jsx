import { signal } from '@preact/signals'
import { Link, useQueryString } from 'lib'

const contador = signal(0)

const qs = useQueryString()

export default function Pages() {
  const incrementar = () => {
    contador.value += 1
  }

  const decrementar = () => {
    contador.value -= 1
  }

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
      <h2>Contador: {contador.value}</h2>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button type="button" onClick={decrementar}>
          Restar -1
        </button>
        <button type="button" onClick={incrementar}>
          Sumar +1
        </button>
      </div>
    </div>
  )
}
