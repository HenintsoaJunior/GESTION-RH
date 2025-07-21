import "styles/recruitment/process.css"
import { Check, Clock, Star, Target } from "lucide-react"

export default function ProcessWorkflow() {
  return (
    <div className="workflow-container">
      {/* Initial Request */}
      <div className="workflow-box initial">
        <div className="icon">📝</div>
        <div className="title">DEMANDE INITIALE</div>
        <div className="subtitle">Validation Workflow</div>
      </div>

      {/* Connecting lines from initial to directors */}
      <div className="connector-container top">
        <div className="connector left"></div>
        <div className="connector middle"></div>
        <div className="connector right"></div>
      </div>

      {/* Three directors row */}
      <div className="directors-row">
        {/* HR Director - Approved */}
        <div className="workflow-box drh">
          <div className="icon">👥</div>
          <div className="title">DRH</div>
          <div className="subtitle">Directeur RH</div>
          <div className="status approved">
            <Check size={16} /> RECOMMANDÉ
          </div>
        </div>

        {/* Financial Director - Pending */}
        <div className="workflow-box daf">
          <div className="icon">💰</div>
          <div className="title">DAF</div>
          <div className="subtitle">Directeur Financier</div>
          <div className="status pending">
            <Clock size={16} /> EN ATTENTE
          </div>
        </div>

        {/* Commercial Director - Pending */}
        <div className="workflow-box dcm">
          <div className="icon">📊</div>
          <div className="title">DCM</div>
          <div className="subtitle">Directeur Commercial</div>
          <div className="status pending">
            <Clock size={16} /> EN ATTENTE
          </div>
        </div>
      </div>

      {/* Connecting lines from directors to DG */}
      <div className="connector-container bottom">
        <div className="connector left-to-dg"></div>
        <div className="connector middle-to-dg"></div>
        <div className="connector right-to-dg"></div>
      </div>

      {/* General Director */}
      <div className="workflow-box dg">
        <div className="icon">
          <Star size={18} />
        </div>
        <div className="title">DG</div>
        <div className="subtitle">Directeur Général</div>
        <div className="status pending">
          <Clock size={16} /> EN ATTENTE
        </div>
      </div>

      {/* Connecting line from DG to Final Decision */}
      <div className="connector-container final">
        <div className="connector to-final"></div>
      </div>

      {/* Final Decision */}
      <div className="workflow-box decision">
        <div className="icon">
          <Target size={18} />
        </div>
        <div className="title">DÉCISION FINALE</div>
        <div className="subtitle">Validation complète</div>
      </div>
    </div>
  )
}
