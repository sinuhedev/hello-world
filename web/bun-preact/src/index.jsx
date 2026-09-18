import { render } from 'preact'
import Pages from './pages'

if (document) {
  render(<Pages />, document.getElementById('root'))
}
