import './style.css'
import { router } from './src/router.js'

// Initial Navigation
window.addEventListener('popstate', router)
router()
