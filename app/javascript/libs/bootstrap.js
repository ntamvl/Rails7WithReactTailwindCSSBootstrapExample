// import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/js/bootstrap.bundle.js"

const bootstrap = require("bootstrap/dist/js/bootstrap.bundle.js")
const popoverElements = document.querySelector('[data-bs-toggle="popover"]')
if (popoverElements) new bootstrap.Popover(popoverElements, { trigger: 'hover' })
