"use client"

import { useEffect, useRef } from "react"

let isQuillScriptLoaded = false

export default function RichTextEditor({ placeholder, onChange, disabled, initialValue }) {
  const quillRef = useRef(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    const initializeQuill = () => {
      if (typeof window !== "undefined" && window.Quill && !quillRef.current) {
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
          placeholder,
        })

        // Set initial value if provided
        if (initialValue && !isInitializedRef.current) {
          quillRef.current.root.innerHTML = initialValue
          isInitializedRef.current = true
        }

        quillRef.current.on("text-change", () => {
          if (onChange) {
            onChange(quillRef.current.root.innerHTML)
          }
        })
      }
    }

    if (typeof window !== "undefined" && !isQuillScriptLoaded && !window.Quill) {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"
      script.async = true
      script.onload = () => {
        isQuillScriptLoaded = true
        initializeQuill()
      }
      script.onerror = () => console.error("Failed to load Quill script")
      document.head.appendChild(script)

      return () => {
      }
    } else {
      initializeQuill()
    }
  }, [placeholder, onChange, initialValue])

  // Update content when initialValue changes
  useEffect(() => {
    if (quillRef.current && initialValue !== undefined) {
      const currentContent = quillRef.current.root.innerHTML
      if (currentContent !== initialValue) {
        quillRef.current.root.innerHTML = initialValue
      }
    }
  }, [initialValue])

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
      <link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" rel="stylesheet" />
      <div id="editor" style={{ minHeight: "200px", opacity: disabled ? 0.5 : 1 }}></div>
    </div>
  )
}