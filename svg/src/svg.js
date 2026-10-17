class SvgLoader extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'width', 'height', 'viewBox', 'class']
  }

  constructor() {
    super()
    this._svg = null
  }

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this.render()
    }
  }

  async render() {
    const src = this.getAttribute('src')
    if (!src) return

    // Creamos el <svg> solo la primera vez
    if (!this._svg) {
      this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      this.appendChild(this._svg)
    }

    // Atributos que controlamos nosotros
    const width = this.getAttribute('width')
    const height = this.getAttribute('height')
    const viewBox = this.getAttribute('viewBox')
    const className = this.getAttribute('class')

    if (width) this._svg.setAttribute('width', width)
    if (height) this._svg.setAttribute('height', height ?? width)
    if (viewBox) this._svg.setAttribute('viewBox', viewBox)
    if (className) this._svg.setAttribute('class', className)

    try {
      const response = await fetch(src)
      const text = await response.text()

      const parsed = new DOMParser().parseFromString(text, 'image/svg+xml')
      const svgElement = parsed.documentElement

      // Limpiamos atributos previos (excepto los que controlamos)
      const controlled = ['width', 'height', 'viewBox', 'class']
      ;[...this._svg.attributes].forEach((attr) => {
        if (!controlled.includes(attr.name)) {
          this._svg.removeAttribute(attr.name)
        }
      })

      // Copiamos atributos del SVG original (excepto width, height y viewBox)
      for (const { name, value } of svgElement.attributes) {
        if (!['width', 'height', 'viewBox'].includes(name)) {
          this._svg.setAttribute(name, value)
        }
      }

      // Inyectamos el contenido
      this._svg.replaceChildren(...svgElement.children)
    } catch (err) {
      console.error('Error cargando SVG:', err)
    }
  }
}

customElements.define('svg-loader', SvgLoader)
