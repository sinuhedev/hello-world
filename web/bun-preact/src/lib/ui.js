import { createElement } from 'preact'

function Link({ children, href, value, ...props }) {
  const base = href ?? window.location.hash.split('?')[0]
  const query =
    value && Object.keys(value).length
      ? `?${new URLSearchParams(value).toString()}`
      : ''

  return createElement('a', { href: base + query, ...props }, children)
}

export { Link }
