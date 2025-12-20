import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * ScrollToTop - Componente para restaurar scroll en navegación SPA
 * 
 * Comportamiento:
 * - PUSH/REPLACE: Scroll to top (navegación normal, links)
 * - POP: No hace nada (back/forward del navegador restaura scroll)
 * - Hash URLs: Scroll al elemento si existe
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()
  const lastPathname = useRef(pathname)

  useEffect(() => {
    // Si hay hash, intentar scroll al elemento
    if (hash) {
      const element = document.getElementById(hash.slice(1))
      if (element) {
        // Pequeño delay para asegurar que el DOM está listo
        requestAnimationFrame(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
      return
    }

    // Solo scroll to top en PUSH o REPLACE (navegación normal)
    // POP = back/forward del navegador, dejar que el browser maneje el scroll
    if (navigationType !== 'POP') {
      // Verificar que realmente cambió la ruta (no solo query params)
      if (pathname !== lastPathname.current) {
        // Scroll instantáneo para evitar parpadeos
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }
    }

    lastPathname.current = pathname
  }, [pathname, hash, navigationType])

  return null
}

export default ScrollToTop
