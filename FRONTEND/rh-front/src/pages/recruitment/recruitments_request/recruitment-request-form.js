"use client"

import { useState } from "react"
import { Send } from 'lucide-react'
import { BASE_URL } from "../../../config/apiConfig"
import "../../../styles/generic-form-styles.css"
import RichTextEditor from "../../../components/RichTextEditor"
import FileUpload from "../../../components/FileUpload"
import Alert from "../../../components/Alert"

export default function RecruitmentRequestForm() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alert, setAlert] = useState({ isOpen: false, type: 'info', message: '' })

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      const form = event.target

      const jobTitle = form.jobTitle.value

      formData.append('RecruitmentRequestId', '')
      formData.append('JobTitle', jobTitle)
      formData.append('Description', description)
      formData.append('Status', 'En Cours')
      formData.append('RequesterId', 'USR001')
      formData.append('RequestDate', new Date().toISOString())
      formData.append('ApprovalDate', new Date().toISOString())

      selectedFiles.forEach((file) => {
        formData.append('Files', file)
      })

      const response = await fetch(`${BASE_URL}/api/RecruitmentRequest`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Demande créée avec succès:', result)

        form.reset()
        setSelectedFiles([])
        setDescription('')
        showAlert('success', 'Demande de recrutement soumise avec succès!')
      } else {
        const errorData = await response.json()
        console.error('Erreur lors de la soumission:', errorData)
        showAlert('error', 'Erreur lors de la soumission de la demande. Veuillez réessayer.')
      }
    } catch (error) {
      console.error('Erreur réseau:', error)
 showAlert('error', 'Erreur de connexion. Veuillez vérifier votre connexion et réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
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
                <FileUpload onFilesChange={setSelectedFiles} disabled={isSubmitting} />
              </td>
            </tr>

            <tr>
              <th className="form-label-cell">
                <label className="form-label form-label-required">
                  Description détaillée
                </label>
              </th>
              <td className="form-input-cell">
                <RichTextEditor 
                  placeholder="Décrivez le poste en détail..." 
                  onChange={setDescription}
                  disabled={isSubmitting}
                />
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