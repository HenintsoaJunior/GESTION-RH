"use client"

import { useEffect, useRef } from "react"
import Quill from "quill"
import "../styles/quill.snow.css"


export default function RichTextEditor({ 
  placeholder, 
  onChange, 
  disabled 
}) {
  const quillRef = useRef(null)
  const editorRef = useRef(null)

  useEffect(() => {
    const initializeQuill = () => {
      if (!quillRef.current && editorRef.current) {
        const Embed = Quill.import("blots/embed")

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

        Quill.register(AttachmentBlot)

        quillRef.current = new Quill(editorRef.current, {
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
          placeholder,
        })

        quillRef.current.on("text-change", () => {
          if (onChange) {
            onChange(quillRef.current.root.innerHTML)
          }
        })

        // Gérer l'état disabled
        if (disabled) {
          quillRef.current.disable()
        }
      }
    }

    initializeQuill()

    // Cleanup function
    return () => {
      if (quillRef.current) {
        quillRef.current = null
      }
    }
  }, [placeholder, onChange, disabled])

  // Gérer les changements de l'état disabled
  useEffect(() => {
    if (quillRef.current) {
      if (disabled) {
        quillRef.current.disable()
      } else {
        quillRef.current.enable()
      }
    }
  }, [disabled])

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

  return (
    <div className="rich-editor-container">
      <style jsx>{`
        .rich-editor-container .ql-editor {
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .rich-editor-container .ql-attachment {
          margin: 10px 0;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        
        .rich-editor-container .attachment-preview {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .rich-editor-container .attachment-icon {
          font-size: 16px;
        }
        
        .rich-editor-container .attachment-name {
          font-weight: 500;
          flex: 1;
        }
        
        .rich-editor-container .attachment-size {
          color: #666;
          font-size: 12px;
        }
      `}</style>
      <div ref={editorRef}></div>
    </div>
  )
}