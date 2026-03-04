import { useEffect, useRef } from 'react'

export default function StaticBackground() {
  const canvasRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      const imageData = ctx.createImageData(w, h)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        // Warm dark static — mostly dark, occasional amber flicker
        const noise = Math.random()
        const warm = noise < 0.012 // ~1.2% of pixels light up
        const bright = warm ? Math.random() * 120 + 30 : Math.random() * 6

        data[i]     = warm ? bright * 1.4 : bright * 0.6  // R
        data[i + 1] = warm ? bright * 0.5 : bright * 0.3  // G
        data[i + 2] = warm ? bright * 0.1 : bright * 0.2  // B
        data[i + 3] = warm ? 180 : 28                      // A
      }

      ctx.putImageData(imageData, 0, 0)
      frameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.6,
      }}
    />
  )
}
