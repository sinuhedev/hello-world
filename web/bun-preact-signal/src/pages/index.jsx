import { computed, signal } from '@preact/signals'
import { render } from 'preact'

const cuenta = signal(0)
const doble = computed(() => cuenta.value * 2)

function Pages() {
  return (
    <main class="contador">
      <h1>Hola mundo</h1>

      <output class="valor" aria-live="polite">
        {cuenta}
      </output>

      <p class="doble">El doble es {doble}</p>

      <div class="acciones">
        <button type="button" onClick={() => cuenta.value--}>
          Restar
        </button>
        <button
          type="button"
          class="secundario"
          onClick={() => (cuenta.value = 0)}
        >
          Reiniciar
        </button>
        <button type="button" onClick={() => (cuenta.value += 1)}>
          Sumar
        </button>
      </div>
    </main>
  )
}

render(<Pages />, document.getElementById('root'))
