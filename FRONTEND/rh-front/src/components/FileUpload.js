"use client"

import { useRef, useState } from "react"
import { Upload, X, FileText, ImageIcon, File } from 'lucide-react'

export default function FileUpload({ onFilesChange, disabled }) {
  const fileInputRef = useRef(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    setSelectedFiles((prev) => [...prev, ...files])
    onFilesChange([...selectedFiles, ...files])
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles((prev) => [...prev, ...files])
    onFilesChange([...selectedFiles, ...files])
  }

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    onFilesChange(selectedFiles.filter((_, i) => i !== index))
  }

  const getFileIconComponent = (file) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    if (file.type.includes("pdf") || file.type.includes("doc")) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div>
      <div
        className={`file-upload-area ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="file-upload-content">
          <Upload className="upload-icon" />
          <div className="upload-text">
            <span className="upload-main">Glissez vos fichiers ici</span>
            <span className="upload-sub">ou</span>
            <button 
              type="button" 
              className="upload-button" 
              onClick={handleFileButtonClick}
              disabled={disabled}
            >
              Parcourir les fichiers
            </button>
          </div>
          <div className="upload-formats">
            Fiche de poste, organigramme, documents RH (PDF, DOC, DOCX, TXT, JPG, PNG - Max 10MB)
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.png,.gif"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h4 className="selected-files-title">Fichiers sélectionnés:</h4>
          <div className="files-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  {getFileIconComponent(file)}
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="remove-file"
                  onClick={() => removeFile(index)}
                  title="Supprimer le fichier"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}