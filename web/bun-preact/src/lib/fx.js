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

export { useQueryString }
