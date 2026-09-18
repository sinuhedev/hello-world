import { signal } from '@preact/signals'

const contador = signal(0)

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
