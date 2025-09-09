import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Add useParams
import { Check, Clock, Star, Target, X } from "lucide-react";
import { BASE_URL } from "config/apiConfig";
import "styles/recruitment/process.css";

export default function ProcessWorkflow() {
  const { recruitmentRequestId } = useParams(); // Retrieve the ID from the URL
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les données de l'API
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/RecruitmentApproval/byRecruitmentRequest/${recruitmentRequestId}`,
          {
            method: "GET",
            headers: {
              accept: "*/*",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setApprovals(data);
        } else {
          setError("Erreur lors de la récupération des données.");
        }
      } catch (err) {
        setError("Erreur de connexion. Veuillez vérifier votre connexion et réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovals();
  }, [recruitmentRequestId]); // Add recruitmentRequestId as a dependency

  // Trouver l'approbateur et le statut pour un approvalOrder donné
  const getApproverForOrder = (order) => {
    const approval = approvals.find((app) => app.approvalOrder === order);
    return {
      approverId: approval ? approval.approverId : "N/A",
      status: approval ? approval.status || "En attente" : "En attente",
    };
  };

  // Déterminer la classe et le texte du statut
  const getStatusProps = (status) => {
    if (status === "Recommandé" || status === "Approuvé") {
      return { className: "status approved", text: <><Check size={14} /> APPROUVÉ</> };
    } else if (status === "Refusé") {
      return { className: "status rejected", text: <><X size={14} /> REFUSÉ</> };
    }
    return { className: "status pending", text: <><Clock size={14} /> EN ATTENTE</> };
  };

  // Déterminer la classe CSS de la boîte selon le statut
  const getBoxStatusClass = (status) => {
    if (status === "Recommandé" || status === "Approuvé") {
      return "approved";
    } else if (status === "Refusé") {
      return "rejected";
    }
    return "pending";
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="workflow-container">
      {/* Background gradient */}
      <div className="workflow-background" />

      {/* Initial Request */}
      <div className="workflow-box initial">
        <div className="icon">📝</div>
        <div className="title">DEMANDE INITIALE</div>
        <div className="subtitle">Validation Workflow</div>
      </div>

      {/* Connector from initial to directors */}
      <div className="connector-svg-container">
        <svg className="connector-svg" width="600" height="48" viewBox="0 0 600 48">
          <line x1="300" y1="0" x2="300" y2="24" stroke="#7986cb" strokeWidth="3" />
          <line x1="120" y1="24" x2="480" y2="24" stroke="#7986cb" strokeWidth="3" />
          <line x1="120" y1="24" x2="120" y2="40" stroke="#7986cb" strokeWidth="3" />
          <line x1="300" y1="24" x2="300" y2="40" stroke="#7986cb" strokeWidth="3" />
          <line x1="480" y1="24" x2="480" y2="40" stroke="#7986cb" strokeWidth="3" />
          <polygon points="120,40 114,32 126,32" fill="#7986cb" />
          <polygon points="300,40 294,32 306,32" fill="#7986cb" />
          <polygon points="480,40 474,32 486,32" fill="#7986cb" />
        </svg>
      </div>

      {/* Three directors row */}
      <div className="directors-row">
        {/* DRH (approvalOrder: 1) */}
        <div className={`workflow-box drh ${getBoxStatusClass(getApproverForOrder(1).status)}`}>
          <div className="icon">👥</div>
          <div className="title">DRH</div>
          <div className="subtitle">Directeur RH ({getApproverForOrder(1).approverId})</div>
          <div className={getStatusProps(getApproverForOrder(1).status).className}>
            {getStatusProps(getApproverForOrder(1).status).text}
          </div>
        </div>

        {/* DAF (approvalOrder: 2) */}
        <div className={`workflow-box daf ${getBoxStatusClass(getApproverForOrder(2).status)}`}>
          <div className="icon">💰</div>
          <div className="title">DAF</div>
          <div className="subtitle">Directeur Financier ({getApproverForOrder(2).approverId})</div>
          <div className={getStatusProps(getApproverForOrder(2).status).className}>
            {getStatusProps(getApproverForOrder(2).status).text}
          </div>
        </div>

        {/* DCM (approvalOrder: 3) */}
        <div className={`workflow-box dcm ${getBoxStatusClass(getApproverForOrder(3).status)}`}>
          <div className="icon">📊</div>
          <div className="title">DCM</div>
          <div className="subtitle">Directeur Commercial ({getApproverForOrder(3).approverId})</div>
          <div className={getStatusProps(getApproverForOrder(3).status).className}>
            {getStatusProps(getApproverForOrder(3).status).text}
          </div>
        </div>
      </div>

      {/* Connector from directors to DG */}
      <div className="connector-svg-container">
        <svg className="connector-svg" width="600" height="48" viewBox="0 0 600 48">
          <line x1="120" y1="0" x2="120" y2="24" stroke="#7986cb" strokeWidth="3" />
          <line x1="300" y1="0" x2="300" y2="24" stroke="#7986cb" strokeWidth="3" />
          <line x1="480" y1="0" x2="480" y2="24" stroke="#7986cb" strokeWidth="3" />
          <line x1="120" y1="24" x2="480" y2="24" stroke="#7986cb" strokeWidth="3" />
          <line x1="300" y1="24" x2="300" y2="40" stroke="#7986cb" strokeWidth="3" />
          <polygon points="300,40 294,32 306,32" fill="#7986cb" />
        </svg>
      </div>

      {/* General Director (approvalOrder: 4) */}
      <div className={`workflow-box dg ${getBoxStatusClass(getApproverForOrder(4).status)}`}>
        <div className="icon">
          <Star size={20} />
        </div>
        <div className="title">DG</div>
        <div className="subtitle">Directeur Général ({getApproverForOrder(4).approverId})</div>
        <div className={getStatusProps(getApproverForOrder(4).status).className}>
          {getStatusProps(getApproverForOrder(4).status).text}
        </div>
      </div>

      {/* Connector from DG to Final Decision */}
      <div className="connector-svg-container">
        <svg className="connector-svg" width="100" height="48" viewBox="0 0 100 48">
          <line x1="50" y1="0" x2="50" y2="40" stroke="#7986cb" strokeWidth="3" />
          <polygon points="50,40 44,32 56,32" fill="#7986cb" />
        </svg>
      </div>

      {/* Final Decision */}
      <div className="workflow-box decision">
        <div className="icon">
          <Target size={20} />
        </div>
        <div className="title">DÉCISION FINALE</div>
        <div className="subtitle">Validation complète</div>
      </div>
    </div>
  );
}