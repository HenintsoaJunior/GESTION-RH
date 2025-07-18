"use client"

import { useState, useEffect, useCallback } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import "styles/modal.css";

const Modal = ({ type = "info", message, isOpen, onClose, title }) => {
  const [visible, setVisible] = useState(isOpen)

  // Fonction pour jouer le son de notification
  const playNotificationSound = useCallback(() => {
    const audio = new Audio("/sounds/notification.mp3")
    audio.volume = 0.5
    audio.play().catch((error) => {
      console.warn("Impossible de jouer le son de notification:", error)
    })
  }, [])

  const handleClose = useCallback(() => {
    setVisible(false)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      try {
        playNotificationSound()
      } catch (error) {
        console.warn("Impossible de jouer le son de notification:", error)
      }
    } else {
      setVisible(false)
    }
  }, [isOpen, playNotificationSound])

  if (!visible) return null

  const getIcon = () => {
    const iconProps = { size: 28, strokeWidth: 2 }
    switch (type) {
      case "success":
        return <CheckCircle {...iconProps} className="text-emerald-500" />
      case "error":
        return <AlertCircle {...iconProps} className="text-red-500" />
      case "warning":
        return <AlertTriangle {...iconProps} className="text-amber-500" />
      case "info":
      default:
        return <Info {...iconProps} className="text-blue-500" />
    }
  }

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "border-l-emerald-500 bg-emerald-50"
      case "error":
        return "border-l-red-500 bg-red-50"
      case "warning":
        return "border-l-amber-500 bg-amber-50"
      case "info":
      default:
        return "border-l-blue-500 bg-blue-50"
    }
  }

  // Split the message into lines based on periods and filter out empty strings
  const messageLines = message.split('.').map(line => line.trim()).filter(line => line.length > 0)

  return (
    <div className="modal-backdrop">
      <div className={`modal ${getTypeStyles()}`}>
        <div className="modal-header">
          <div className="modal-icon-container">{getIcon()}</div>
          <div className="modal-text-content">
            {title && <h3 className="modal-title">{title}</h3>}
            <ul className="modal-message-list">
              {messageLines.map((line, index) => (
                <li key={index} className="modal-message">{line}</li>
              ))}
            </ul>
          </div>
          <button onClick={handleClose} className="modal-close-btn" aria-label="Fermer la notification">
            <X size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal