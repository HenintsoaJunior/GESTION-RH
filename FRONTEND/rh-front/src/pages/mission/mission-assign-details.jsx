"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Download, ArrowLeft, Calendar, MapPin, Clock, User, Building, CreditCard } from "lucide-react"
import { formatDate } from "utils/generalisation"
import Alert from "components/alert"
import "styles/mission/assignment-details-styles.css"

// Données statiques pour simuler les détails de l'assignation
const mockAssignment = {
  assignmentId: 1,
  missionId: 1,
  missionTitle: "Développement d'une application mobile",
  beneficiary: "Jean Dupont",
  matricule: "JD123",
  function: "Développeur",
  base: "Paris",
  direction: "IT",
  departmentService: "Développement",
  costCenter: "CC001",
  meansOfTransport: "Train",
  whoWillGo: "Paris",
  departureDate: "2025-02-10",
  departureTime: "08:00",
  missionDuration: 32,
  returnDate: "2025-03-13",
  returnTime: "18:00",
  status: "En Cours",
  createdAt: "2025-01-20",
  indemnityDetails: [
    {
      date: "2025-02-10",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-11",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-12",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-13",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-14",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-15",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-16",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-17",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-18",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-19",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-20",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-21",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-22",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-23",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-24",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-25",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-26",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-27",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-02-28",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-03-01",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-03-02",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-03-03",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-03-04",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-03-05",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-03-06",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-03-07",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-03-08",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-03-09",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-03-10",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-03-11",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    {
      date: "2025-03-12",
      transport: 25000,
      breakfast: 35000,
      lunch: 35000,
      dinner: 35000,
      accommodation: 120000,
      total: 215000,
    },
    { date: "2025-03-13", total: 6665000 },
  ],
}

const AssignmentDetails = () => {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" })

  // Simuler le chargement des données
  useEffect(() => {
    setIsLoading(true)
    // Simuler un appel API
    setTimeout(() => {
      setAssignment(mockAssignment)
      setIsLoading(false)
    }, 1000)
  }, [assignmentId])

  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "0"
  }

  const handleExportPDF = () => {
    // Fonctionnalité d'export PDF non implémentée
    setAlert({ isOpen: true, type: "info", message: "Exportation PDF en cours de développement." })
  }

  const getStatusBadge = (status) => {
    const statusClass =
      status === "En Cours"
        ? "status-progress"
        : status === "Planifié"
          ? "status-pending"
          : status === "Terminé"
            ? "status-approved"
            : "status-pending"
    return <span className={`status-badge ${statusClass}`}>{status || "Inconnu"}</span>
  }

  const getDetailIcon = (label) => {
    switch (label) {
      case "Bénéficiaire":
      case "Matricule":
      case "Fonction":
        return <User className="detail-icon" />
      case "Date de départ":
      case "Date de retour":
      case "Date de création":
        return <Calendar className="detail-icon" />
      case "Heure de départ":
      case "Heure de retour":
      case "Durée de la mission":
        return <Clock className="detail-icon" />
      case "Base":
      case "Destination":
        return <MapPin className="detail-icon" />
      case "Direction":
      case "Département/Service":
        return <Building className="detail-icon" />
      case "Centre de coût":
        return <CreditCard className="detail-icon" />
      default:
        return null
    }
  }

  return (
    <div className="assignment-details-container">
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      {/* Header avec bouton retour à gauche */}
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate("/mission/payment-status")} className="btn-back" title="Retour à la liste">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="header-title-section">
            <h1 className="page-title">Détails de l'Assignation</h1>
            <p className="page-subtitle">Mission #{assignmentId}</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleExportPDF} className="btn-export-pdf" title="Exporter en PDF">
            <Download className="w-4 h-4" />
            Exporter PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Chargement des détails...</p>
        </div>
      ) : assignment ? (
        <>
          {/* Informations générales */}
          <div className="info-section">
            <div className="section-header">
              <h2 className="section-title">Informations Générales</h2>
              <div className="status-container">{getStatusBadge(assignment.status)}</div>
            </div>

            <div className="details-grid">
              {[
                { label: "Bénéficiaire", value: assignment.beneficiary },
                { label: "Matricule", value: assignment.matricule },
                { label: "Mission", value: assignment.missionTitle },
                { label: "Fonction", value: assignment.function },
                { label: "Base", value: assignment.base },
                { label: "Direction", value: assignment.direction },
                { label: "Département/Service", value: assignment.departmentService },
                { label: "Centre de coût", value: assignment.costCenter },
                { label: "Moyen de transport", value: assignment.meansOfTransport },
                { label: "Destination", value: assignment.whoWillGo },
                { label: "Date de départ", value: formatDate(assignment.departureDate) },
                { label: "Heure de départ", value: assignment.departureTime },
                { label: "Durée de la mission", value: `${assignment.missionDuration} jours` },
                { label: "Date de retour", value: formatDate(assignment.returnDate) },
                { label: "Heure de retour", value: assignment.returnTime },
                { label: "Date de création", value: formatDate(assignment.createdAt) },
              ].map((item, index) => (
                <div key={index} className="detail-card">
                  <div className="detail-header">
                    {getDetailIcon(item.label)}
                    <span className="detail-label">{item.label}</span>
                  </div>
                  <span className="detail-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tableau des indemnités */}
          <div className="indemnity-section">
            <div className="section-header">
              <h2 className="section-title">Régularisation des Indemnités de Mission</h2>
            </div>

            <div className="table-wrapper">
              <div className="table-container">
                <table className="indemnity-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transport</th>
                      <th>Petit Déjeuner</th>
                      <th>Déjeuner</th>
                      <th>Dîner</th>
                      <th>Hébergement</th>
                      <th>Montant Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignment.indemnityDetails.map((item, index) => (
                      <tr key={index} className={index === assignment.indemnityDetails.length - 1 ? "total-row" : ""}>
                        <td className="date-cell">
                          {item.date
                            ? new Date(item.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "2-digit",
                              })
                            : ""}
                        </td>
                        <td className="amount-cell">{item.transport ? `${formatNumber(item.transport)},00` : ""}</td>
                        <td className="amount-cell">{item.breakfast ? `${formatNumber(item.breakfast)},00` : ""}</td>
                        <td className="amount-cell">{item.lunch ? `${formatNumber(item.lunch)},00` : ""}</td>
                        <td className="amount-cell">{item.dinner ? `${formatNumber(item.dinner)},00` : ""}</td>
                        <td className="amount-cell">
                          {item.accommodation ? `${formatNumber(item.accommodation)},00` : ""}
                        </td>
                        <td className="total-cell">{item.total ? `${formatNumber(item.total)},00` : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="signature-section">
            <div className="section-header">
              <h2 className="section-title">Signatures</h2>
            </div>

            <div className="signature-grid">
              <div className="signature-card">
                <div className="signature-header">
                  <span className="signature-label">Le Requérant</span>
                </div>
                <div className="signature-content">
                  <span className="signature-name">{assignment.beneficiary}</span>
                  <div className="signature-line"></div>
                </div>
              </div>

              <div className="signature-card">
                <div className="signature-header">
                  <span className="signature-label">Le Directeur de tutelle</span>
                </div>
                <div className="signature-content">
                  <div className="signature-line"></div>
                </div>
              </div>

              <div className="signature-card">
                <div className="signature-header">
                  <span className="signature-label">Le Chef de Département / Service</span>
                </div>
                <div className="signature-content">
                  <div className="signature-line"></div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="no-data-container">
          <div className="no-data-content">
            <p className="no-data-text">Aucune donnée trouvée pour cette assignation.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignmentDetails
