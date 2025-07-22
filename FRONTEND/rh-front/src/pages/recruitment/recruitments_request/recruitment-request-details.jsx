"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  User,
  Building2,
  Calendar,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Edit,
  Trash2,
} from "lucide-react"
import { formatDate } from "utils/generalisation"
import { fetchRecruitmentRequestById } from "services/recruitment/recruitment-request-service/recruitment-request-service"
import Alert from "components/alert"
import "styles/recruitment/recruitment-request-details.css"

const RecruitmentRequestDetails = () => {
  const { recruitmentRequestId } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" })

  useEffect(() => {
    const loadRequest = async () => {
      await fetchRecruitmentRequestById(recruitmentRequestId, setRequest, setIsLoading, (error) =>
        setAlert({
          isOpen: true,
          type: "error",
          message: `Erreur lors du chargement des détails de la demande: ${error.message}`,
        }),
      )
    }
    loadRequest()
  }, [recruitmentRequestId])

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approuvé":
        return <CheckCircle className="statut-icone statut-icone--approuve" />
      case "Rejeté":
        return <XCircle className="statut-icone statut-icone--rejete" />
      case "En Cours":
        return <Clock className="statut-icone statut-icone--en-cours" />
      default:
        return <AlertCircle className="statut-icone statut-icone--en-attente" />
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approuvé":
        return "statut-badge statut-badge--approuve"
      case "Rejeté":
        return "statut-badge statut-badge--rejete"
      case "En Cours":
        return "statut-badge statut-badge--en-cours"
      default:
        return "statut-badge statut-badge--en-attente"
    }
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="chargement-conteneur">
          <div className="chargement-texte">Chargement...</div>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="page-container">
        <div className="erreur-conteneur">
          <div className="erreur-texte">Aucune donnée trouvée pour cette demande.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <Alert
        type={alert.type}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      {/* Header */}
      <div className="en-tete">
        <div className="en-tete-contenu">
          <div className="en-tete-navigation">
            <div className="navigation-gauche">
              <button className="bouton-retour" onClick={() => navigate("/recruitment/recruitment-request")}>
                <ArrowLeft className="bouton-retour-icone" />
                <span>Retour</span>
              </button>
              <div className="separateur-vertical"></div>
              <h1 className="titre-principal">
                Demande de recrutement pour {request.recruitmentRequest?.positionTitle || "Non spécifié"}
              </h1>
            </div>
            <div className={getStatusStyle(request.recruitmentRequest?.status)}>
              {getStatusIcon(request.recruitmentRequest?.status)}
              <span className="statut-texte">{request.recruitmentRequest?.status || "Inconnu"}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="contenu-principal">
        <div className="grille-principale">
          {/* Main Content */}
          <div className="colonne-principale">
            {/* Informations Générales */}
            <div className="carte">
              <div className="carte-en-tete">
                <h2 className="carte-titre">
                  <FileText className="carte-titre-icone carte-titre-icone--bleu" />
                  Informations Générales
                </h2>
              </div>
              <div className="carte-contenu">
                <div className="grille-champs">
                  <div className="champ">
                    <label className="champ-label">Intitulé du Poste</label>
                    <p className="champ-valeur champ-valeur--important">
                      {request.recruitmentRequest?.positionTitle || "Non spécifié"}
                    </p>
                  </div>
                  <div className="champ">
                    <label className="champ-label">Effectif</label>
                    <p className="champ-valeur">{request.recruitmentRequest?.positionCount || "Non spécifié"}</p>
                  </div>
                  <div className="champ">
                    <label className="champ-label">Type de Contrat</label>
                    <p className="champ-valeur">{request.recruitmentRequest?.contractType?.label || "Non spécifié"}</p>
                  </div>
                  <div className="champ">
                    <label className="champ-label">ID Demande</label>
                    <p className="champ-valeur champ-valeur--code">
                      {request.recruitmentRequest?.recruitmentRequestId || "Non spécifié"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Rattachement du Poste */}
            <div className="carte">
              <div className="carte-en-tete">
                <h2 className="carte-titre">
                  <Building2 className="carte-titre-icone carte-titre-icone--vert" />
                  Rattachement du Poste
                </h2>
              </div>
              <div className="carte-contenu">
                <div className="grille-champs">
                  <div className="champ">
                    <label className="champ-label">Direction</label>
                    <p className="champ-valeur">
                      {request.direction?.directionName
                        ? `${request.direction.directionName} (${request.direction.acronym || ""})`
                        : "Non spécifié"}
                    </p>
                  </div>
                  <div className="champ">
                    <label className="champ-label">Département</label>
                    <p className="champ-valeur">{request.department?.departmentName || "Non spécifié"}</p>
                  </div>
                  <div className="champ">
                    <label className="champ-label">Service</label>
                    <p className="champ-valeur">{request.service?.serviceName || "Non spécifié"}</p>
                  </div>
                  <div className="champ">
                    <label className="champ-label">Site</label>
                    <div className="champ-avec-icone">
                      <MapPin className="champ-icone" />
                      <p className="champ-valeur">{request.recruitmentRequest?.site?.siteName || "Non spécifié"}</p>
                    </div>
                  </div>
                  <div className="champ">
                    <label className="champ-label">Supérieur Hiérarchique</label>
                    <div className="champ-avec-icone">
                      <User className="champ-icone" />
                      <p className="champ-valeur">
                        {request.directSupervisor?.firstName && request.directSupervisor?.lastName
                          ? `${request.directSupervisor.firstName} ${request.directSupervisor.lastName}`
                          : "Non spécifié"}
                      </p>
                    </div>
                  </div>
                  <div className="champ">
                    <label className="champ-label">Fonction du Supérieur</label>
                    <p className="champ-valeur">{request.supervisorPosition || "Non spécifié"}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Motif du Recrutement */}
            <div className="carte">
              <div className="carte-en-tete">
                <h2 className="carte-titre">
                  <AlertCircle className="carte-titre-icone carte-titre-icone--orange" />
                  Motif du Recrutement
                </h2>
              </div>
              <div className="carte-contenu">
                <div className="grille-champs">
                  <div className="champ">
                    <label className="champ-label">Raison du Recrutement</label>
                    <p className="champ-valeur">
                      {request.recruitmentRequest?.recruitmentReason?.name || "Non spécifié"}
                    </p>
                  </div>
                  <div className="champ">
                    <label className="champ-label">Date de Prise de Service Souhaitée</label>
                    <div className="champ-avec-icone">
                      <Calendar className="champ-icone" />
                      <p className="champ-valeur">
                        {formatDate(request.recruitmentRequest?.desiredStartDate) || "Non spécifié"}
                      </p>
                    </div>
                  </div>
                  {request.recruitmentRequest?.formerEmployeeName && (
                    <div className="champ champ--pleine-largeur">
                      <label className="champ-label">Employé remplacé</label>
                      <p className="champ-valeur">{request.recruitmentRequest?.formerEmployeeName}</p>
                    </div>
                  )}
                  {request.recruitmentRequest?.newPositionExplanation && (
                    <div className="champ champ--pleine-largeur">
                      <label className="champ-label">Explication du Nouveau Poste</label>
                      <div
                        className="champ-valeur champ-valeur--html"
                        dangerouslySetInnerHTML={{ __html: request.recruitmentRequest.newPositionExplanation }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="colonne-secondaire">
            {/* Actions */}
            <div className="carte">
              <div className="carte-en-tete">
                <h3 className="carte-titre-secondaire">Actions</h3>
              </div>
              <div className="carte-contenu">
                <div className="groupe-boutons-actions">
                  {/* Actions principales */}
                  <div className="actions-principales">
                    <button className="bouton bouton--approuver bouton--action-principale">
                      <CheckCircle className="bouton-icone" />
                      <span>Approuver</span>
                    </button>
                    <button className="bouton bouton--rejeter bouton--action-principale">
                      <XCircle className="bouton-icone" />
                      <span>Rejeter</span>
                    </button>
                  </div>

                  {/* Séparateur */}
                  
                  {/* Actions de téléchargement */}
                  <div className="actions-telechargement">
                    <button
                      className="bouton bouton--process bouton--action-secondaire"
                      onClick={() => navigate(`/recruitment/process/${request.recruitmentRequest?.recruitmentRequestId}`)}
                    >
                      <Clock className="bouton-icone" />
                      <span>Voir le Processus</span>
                    </button>
                    <div className="separateur-actions">
                      <span className="separateur-texte">Téléchargements</span>
                    </div>

                    <div className="actions-fichiers">
                      <button className="bouton bouton--telecharger-pdf bouton--action-fichier">
                        <FileText className="bouton-icone" />
                        <span>PDF</span>
                      </button>
                      <button className="bouton bouton--telecharger-word bouton--action-fichier">
                        <Download className="bouton-icone" />
                        <span>Word</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Informations Administratives */}
            <div className="carte">
              <div className="carte-en-tete">
                <h3 className="carte-titre-secondaire">Informations Administratives</h3>
              </div>
              <div className="carte-contenu">
                <div className="groupe-infos">
                  <div className="info-admin">
                    <label className="info-admin-label">Date de Création</label>
                    <p className="info-admin-valeur">{formatDate(request.createdAt) || "Non spécifié"}</p>
                  </div>
                  <div className="info-admin">
                    <label className="info-admin-label">Créé par</label>
                    <p className="info-admin-valeur">
                      {request.recruitmentRequest?.requester?.employee?.firstName &&
                      request.recruitmentRequest?.requester?.employee?.lastName
                        ? `${request.recruitmentRequest.requester.employee.firstName} ${request.recruitmentRequest.requester.employee.lastName}`
                        : "Non spécifié"}
                    </p>
                  </div>
                  <div className="info-admin">
                    <label className="info-admin-label">Dernière Modification</label>
                    <p className="info-admin-valeur">{formatDate(request.updatedAt) || "Non spécifié"}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Management Actions */}
            <div className="carte">
              <div className="carte-en-tete">
                <h3 className="carte-titre-secondaire">Gestion</h3>
              </div>
              <div className="carte-contenu">
                <div className="groupe-boutons">
                  <button
                    className="bouton bouton--modifier"
                    onClick={() =>
                      navigate(
                        `/recruitment/recruitment-request-form/${request.recruitmentRequest?.recruitmentRequestId}`,
                      )
                    }
                  >
                    <Edit className="bouton-icone" />
                    Modifier
                  </button>
                  <button
                    className="bouton bouton--supprimer"
                    onClick={() => {
                      setAlert({
                        isOpen: true,
                        type: "warning",
                        message: "Fonctionnalité de suppression non implémentée.",
                      })
                    }}
                  >
                    <Trash2 className="bouton-icone" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
            {/* Comments Section */}
            <div className="carte">
              <div className="carte-en-tete">
                <h3 className="carte-titre-secondaire">Recommandations</h3>
              </div>
              <div className="carte-contenu">
                <div className="formulaire-recommandations">
                  <textarea className="zone-texte" placeholder="Recommandations..."></textarea>
                  <button className="bouton bouton--ajouter-recommandation">Ajouter Recommandations</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecruitmentRequestDetails
