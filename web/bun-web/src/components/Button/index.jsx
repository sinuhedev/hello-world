import './style.css'

export default function Button({ children }) {
  return (
    <button type="button" className="btn">
      {children}
    </button>
  )
}
