"use client"

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
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          willChange: "transform",
          transition: "transform 0.1s ease-out",
        }}
      />
    </div>
  )
}
