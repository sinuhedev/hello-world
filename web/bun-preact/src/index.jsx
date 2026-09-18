import { render } from 'preact'
import Pages from './pages'

const root = document.getElementById('root')
const renderPages = () => root && render(<Pages />, root)

renderPages()

if (import.meta.hot)
  import.meta.hot.accept(() => {
    renderPages()
  })
