import { signal } from '@preact/signals'

const useQueryString = (() => {
  const getQueryString = () => {
    const [hash, search = ''] = window.location.hash.split('?')
    return {
      hash,
      queryString: Object.fromEntries(new URLSearchParams(search))
    }
  }

  const query = signal(getQueryString())

  window.addEventListener('hashchange', () => {
    query.value = getQueryString()
  })

  return () => query
})()

function useFx(value) {
  const state = signal(value)

  const incrementar = () => {
    state.value += 1
  }

  const decrementar = () => {
    state.value -= 1
  }

  return {
    state,
    fx: { incrementar, decrementar }
  }
}

export { useFx, useQueryString }
