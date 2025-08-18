"use client";

import { useState } from "react";
import { X, FileText, ImageIcon, File } from "lucide-react";

export default function FileUpload({ onFilesChange, disabled }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const updatedFiles = [...selectedFiles, ...files];
      setSelectedFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const getFileIconComponent = (file) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (file.type.includes("pdf") || file.type.includes("doc")) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-area">
        <label className="file-upload-label">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.png,.gif"
            onChange={handleFileChange}
            disabled={disabled}
            className="file-input"
          />
          <span className="file-upload-button">
            Choisir des fichiers
          </span>
        </label>
        <div className="upload-formats">
          Fiche de poste, organigramme, documents RH (PDF, DOC, DOCX, TXT, JPG, PNG - Max 10MB)
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h4 className="selected-files-title">Fichiers sélectionnés :</h4>
          <div className="files-list">
            {selectedFiles.map((file, index) => (
              <div key={`file-${index}`} className="file-item">
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
  );
}