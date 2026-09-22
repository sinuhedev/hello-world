import logo from 'assets/img/logo.svg'
import reactLogo from 'assets/img/react.svg'
import { Button } from 'components'

export default function Pages() {
  return (
    <div className="app">
      <div className="logo-container">
        <img src={logo} alt="Bun Logo" className="logo bun-logo" />
        <img src={reactLogo} alt="React Logo" className="logo react-logo" />
      </div>

      <Button>btn</Button>
      <button type="button">yo</button>

      <h1>Bun + React</h1>
      <p>
        Edit <code>src/pages/index.jsx</code>
      </p>
    </div>
  )
}
