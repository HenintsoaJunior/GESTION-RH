"use client"

import { useEffect, useRef, useState } from "react"
import { Upload, X, FileText, ImageIcon, File, Send } from 'lucide-react'
import { BASE_URL } from "../../../config/apiConfig"
import "../../../styles/generic-form-styles.css"

export default function RecruitmentRequestForm() {
  const fileInputRef = useRef(null)
  const quillRef = useRef(null)
  const [quillLoaded, setQuillLoaded] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && !window.Quill && !quillLoaded) {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"
      script.async = true
      script.onload = () => setQuillLoaded(true)
      script.onerror = () => console.error("Failed to load Quill script")
      document.head.appendChild(script)

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    }
  }, [quillLoaded])

  useEffect(() => {
    if (quillLoaded && typeof window !== "undefined" && window.Quill && !quillRef.current) {
      const Embed = window.Quill.import("blots/embed")

      class AttachmentBlot extends Embed {
        static create(value) {
          const node = super.create()
          node.setAttribute("data-attachment", JSON.stringify(value))
          node.innerHTML = `
            <div class="attachment-preview">
              <span class="attachment-icon">${getFileIcon(value.type)}</span>
              <span class="attachment-name">${value.name}</span>
              <span class="attachment-size">${formatFileSize(value.size)}</span>
            </div>
          `
          return node
        }

        static value(node) {
          return JSON.parse(node.getAttribute("data-attachment"))
        }
      }

      AttachmentBlot.blotName = "attachment"
      AttachmentBlot.tagName = "div"
      AttachmentBlot.className = "ql-attachment"

      window.Quill.register(AttachmentBlot)

      quillRef.current = new window.Quill("#editor", {
        theme: "snow",
        modules: {
          toolbar: {
            container: [
              [{ font: [] }, { size: ["small", false, "large", "huge"] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              ["link", "image", { attachment: true }],
              ["clean"],
            ],
            handlers: {
              attachment: function () {
                const input = document.createElement("input")
                input.setAttribute("type", "file")
                input.setAttribute("accept", ".pdf,.doc,.docx,.txt,.jpg,.png,.gif")
                input.click()

                input.onchange = () => {
                  const file = input.files[0]
                  if (file && quillRef.current) {
                    const range = quillRef.current.getSelection() || { index: 0 }
                    quillRef.current.insertEmbed(range.index, "attachment", {
                      name: file.name,
                      size: file.size,
                      type: file.type,
                    })
                  }
                }
              },
            },
          },
        },
        placeholder: "Décrivez le poste en détail...",
      })
    }
  }, [quillLoaded])

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return "🖼️"
    if (type.includes("pdf")) return "📄"
    if (type.includes("word") || type.includes("doc")) return "📝"
    return "📎"
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    setSelectedFiles((prev) => [...prev, ...files])
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
  }

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIconComponent = (file) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    if (file.type.includes("pdf") || file.type.includes("doc")) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      const form = event.target
      
      // Récupération des données du formulaire
      const jobTitle = form.jobTitle.value
      const description = quillRef.current ? quillRef.current.root.innerHTML : ""

      // Construction du FormData selon l'API attendue
      formData.append('RecruitmentRequestId', '') // Laisser vide pour génération automatique
      formData.append('JobTitle', jobTitle)
      formData.append('Description', description)
      formData.append('Status', 'En Cours')
      formData.append('RequesterId', 'USR001') // À adapter selon votre logique d'authentification
      formData.append('RequestDate', new Date().toISOString())
      formData.append('ApprovalDate', new Date().toISOString())

      // Ajout des fichiers
      selectedFiles.forEach((file) => {
        formData.append('Files', file)
      })

      // Envoi vers l'API
      const response = await fetch(`${BASE_URL}/api/RecruitmentRequest`, {
        method: 'POST',
        body: formData,
        // Ne pas définir Content-Type, le navigateur le fera automatiquement avec la boundary
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Demande créée avec succès:', result)
        
        // Réinitialiser le formulaire
        form.reset()
        setSelectedFiles([])
        if (quillRef.current) {
          quillRef.current.root.innerHTML = ''
        }
        
        alert('Demande de recrutement soumise avec succès!')
      } else {
        const errorData = await response.json()
        console.error('Erreur lors de la soumission:', errorData)
        alert('Erreur lors de la soumission de la demande. Veuillez réessayer.')
      }
    } catch (error) {
      console.error('Erreur réseau:', error)
      alert('Erreur de connexion. Veuillez vérifier votre connexion et réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" rel="stylesheet" />

      <div className="form-header">
        <h1 className="form-title">Demande de recrutement</h1>
        <p className="form-description">
          Remplissez ce formulaire pour soumettre votre demande de recrutement. Tous les champs marqués d'un astérisque (*) sont requis pour traiter votre demande efficacement.
        </p>
      </div>

      <form className="generic-form" onSubmit={handleSubmit}>
        <table className="form-table">
          <tbody>

            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required" htmlFor="jobTitle">
                  Intitulé du poste
                </label>
              </th>
              <td className="form-input-cell">
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  placeholder="Ex: Développeur Full Stack Senior"
                  className="form-input"
                  required
                  disabled={isSubmitting}
                />
              </td>
            </tr>

            <tr>
              <th className="form-label-cell">
                <label className="form-label">
                  Pièces jointes
                </label>
              </th>
              <td className="form-input-cell">
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
                        disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                            disabled={isSubmitting}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </td>
            </tr>

            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">
                  Description détaillée
                </label>
              </th>
              <td className="form-input-cell">
                <div className="rich-editor-container">
                  <div id="editor" style={{ minHeight: "200px", opacity: isSubmitting ? 0.5 : 1 }}></div>
                </div>
              </td>
            </tr>

            <tr>
              <td colSpan="2" className="form-submit-cell">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-large"
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                  <span className="btn-arrow">→</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  )
}