import { createRoot } from 'react-dom/client'
import Pages from './pages'

const elem = document.getElementById('root')

let root
if (import.meta.hot) {
  root = import.meta.hot.data.root ??= createRoot(elem)
} else {
  root = createRoot(elem)
}

root.render(<Pages />)

if (import.meta.hot) {
  import.meta.hot.accept()
}