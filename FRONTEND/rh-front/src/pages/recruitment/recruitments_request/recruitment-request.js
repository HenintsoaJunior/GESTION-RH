"use client"

import { useEffect, useRef, useState } from "react"
import { Upload, X, FileText, ImageIcon, File } from "lucide-react"
import "./recruitment-request.css"

export default function RecruitmentRequest() {
  const fileInputRef = useRef(null)
  const quillRef = useRef(null)
  const [quillLoaded, setQuillLoaded] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)

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
      // Custom attachment blot
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
              ["link", "image", { attachment: true }], // Add attachment to toolbar
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

      // Remove custom button since handler is now in toolbar
      // const attachButton = document.createElement("button")
      // ...
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

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const jobTitle = formData.get("jobTitle")
    const description = quillRef.current ? quillRef.current.root.innerHTML : ""

    console.log("Form submitted:", {
      jobTitle,
      description,
      files: selectedFiles.map((f) => f.name),
    })
  }

  return (
    <div className="recruitment-container">
      <link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" rel="stylesheet" />

      <div className="recruitment-header">
        <h1 className="recruitment-title">Demande de recrutement</h1>
        <p className="recruitment-description">
          Remplissez ce formulaire pour soumettre votre demande de recrutement. Tous les champs sont requis pour traiter
          votre demande efficacement.
        </p>
      </div>

      <form className="recruitment-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="jobTitle">
              Intitulé du poste *
            </label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              placeholder="Ex: Développeur Full Stack Senior"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pièces jointes</label>
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
                  <button type="button" className="upload-button" onClick={handleFileButtonClick}>
                    Parcourir les fichiers
                  </button>
                </div>
                <div className="upload-formats">PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)</div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                accept=".pdf,.doc,.docx,.txt,.jpg,.png,.gif"
                onChange={handleFileChange}
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
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group description-group">
            <label className="form-label">Description du poste *</label>
            <div className="description-container">
              <div id="editor" style={{ minHeight: "200px" }}></div>
            </div>
          </div>

          <div className="form-group submit-group">
            <button type="submit" className="submit-btn">
              <span>Envoyer la demande</span>
              <span className="submit-arrow">→</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}