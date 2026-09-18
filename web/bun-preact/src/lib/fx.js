import { signal } from '@preact/signals'

function useQueryString() {
  const getQueryString = () => {
    const [hash, search = ''] = window.location.hash.split('?')
    return {
      hash,
      queryString: Object.fromEntries(new URLSearchParams(search))
    }
  }

  const state = signal(getQueryString())

  window.addEventListener('hashchange', () => {
    state.value = getQueryString()
  })

  return state
}

function useFx(value) {
  const state = signal(value)

  return {
    state,
    fx: {
      incrementar: () => {
        state.value += 1
      },
      decrementar: () => {
        state.value -= 1
      }
    }
  }
}

export { useFx, useQueryString }
