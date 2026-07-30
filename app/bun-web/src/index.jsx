import { createRoot } from 'react-dom/client'
import { Pages } from './pages'

const elem = document.getElementById('root')
const root = createRoot(elem)

if (import.meta.hot) {
  import.meta.hot.data.root = root
}

root.render(<Pages />)
