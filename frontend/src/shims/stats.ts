class DummyStats {
  dom: HTMLDivElement

  constructor() {
    this.dom = document.createElement("div")
    this.dom.style.display = "none"
  }

  begin() {
    // no-op
  }

  end() {
    // no-op
  }

  update() {
    // no-op
  }
}

export default DummyStats

