"use client"

/**
 * MouseLightLeak Component
 * - Creates a 300px soft indigo radial glow that follows the mouse cursor
 * - Uses requestAnimationFrame-friendly transform updates (0.1s ease-out)
 * - Glow color is set via CSS custom property --glow-color so it can be
 *   overridden in light/dark themes (subtle in both modes)
 * - Rendered as a fixed full-screen layer with pointer-events: none
 */

import { useEffect, useRef } from "react"

export function MouseLightLeak() {
  const containerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        // Center the 300px glow on the cursor
        glowRef.current.style.transform = `translate(${x - 150}px, ${y - 150}px)`
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      return () => container.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto fixed inset-0 z-0 overflow-hidden"
      style={{ pointerEvents: "none" }}
    >
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[300px] w-[300px] rounded-full opacity-40 blur-[120px]"
        style={{
          // Uses CSS custom property for theme-aware glow color
          background:
            "radial-gradient(circle, var(--glow-color, rgba(99,102,241,0.15)) 0%, transparent 70%)",
          willChange: "transform",
          transition: "transform 0.1s ease-out",
        }}
      />
    </div>
  )
}
