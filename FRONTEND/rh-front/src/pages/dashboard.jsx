"use client"

import { useState, useEffect } from "react"

export default function DashboardHome() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div>
      {isVisible && <p>Bienvenue sur le tableau de dashboar !</p>}
    </div>
  )
}
