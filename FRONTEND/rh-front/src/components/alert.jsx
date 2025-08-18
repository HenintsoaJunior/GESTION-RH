"use client"
import { useState, useEffect, useCallback } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import "styles/alert.css"

const Alert = ({ type = "info", message, isOpen, onClose }) => {
  const [visible, setVisible] = useState(isOpen)
  const [closing, setClosing] = useState(false)

  // Fonction pour jouer le son de notification
  const playNotificationSound = useCallback(() => {
    // Chemins vers les fichiers audio selon le type d'alerte
    const soundPaths = {
      success: '/sounds/success.mp3',
      error: '/sounds/notification.mp3',
      warning: '/sounds/notification.mp3',
      info: '/sounds/notification.mp3'
    }
    
    const soundPath = soundPaths[type] || soundPaths.info
    
    // Création de l'élément audio
    const audio = new Audio(soundPath)
    audio.volume = 0.5 // Volume à 50%
    audio.play().catch(error => {
      console.warn('Impossible de jouer le son de notification:', error)
    })
  }, [type])

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      onClose()
    }, 300) // Délai pour l'animation de fermeture
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      setClosing(false)
      
      // Jouer le son de notification
      try {
        playNotificationSound()
      } catch (error) {
        console.warn('Impossible de jouer le son de notification:', error)
      }
      
      const timer = setTimeout(() => {
        handleClose()
      }, 5000) // Auto-dismiss after 5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, handleClose, playNotificationSound])

  if (!visible) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={16} />
      case "error":
        return <AlertCircle size={16} />
      case "warning":
        return <AlertTriangle size={16} />
      case "info":
      default:
        return <Info size={16} />
    }
  }

  return (
    <div className="alert-container">
      <div className={`alert alert-${type} ${closing ? "closing" : ""}`}>
        <div className="alert-content">
          <div className="alert-icon">{getIcon()}</div>
          <div className="alert-message">{message}</div>
          <button onClick={handleClose} className="alert-close" aria-label="Fermer l'alerte">
            <X size={18} />
          </button>
        </div>
        <div className="alert-progress"></div>
      </div>
    </div>
  )
}

export default Alert