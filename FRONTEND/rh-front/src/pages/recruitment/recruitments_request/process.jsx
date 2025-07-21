import { Check, Clock, Star, Target } from "lucide-react"
import "styles/recruitment/process.css"

export default function ProcessWorkflow() {
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
          {/* Main vertical line */}
          <line x1="300" y1="0" x2="300" y2="24" stroke="#7986cb" strokeWidth="3" />

          {/* Horizontal distribution line */}
          <line x1="120" y1="24" x2="480" y2="24" stroke="#7986cb" strokeWidth="3" />

          {/* Three vertical lines to directors */}
          <line x1="120" y1="24" x2="120" y2="40" stroke="#7986cb" strokeWidth="3" />
          <line x1="300" y1="24" x2="300" y2="40" stroke="#7986cb" strokeWidth="3" />
          <line x1="480" y1="24" x2="480" y2="40" stroke="#7986cb" strokeWidth="3" />

          {/* Arrows */}
          <polygon points="120,40 114,32 126,32" fill="#7986cb" />
          <polygon points="300,40 294,32 306,32" fill="#7986cb" />
          <polygon points="480,40 474,32 486,32" fill="#7986cb" />
        </svg>
      </div>

      {/* Three directors row */}
      <div className="directors-row">
        {/* HR Director - Approved */}
        <div className="workflow-box drh">
          <div className="icon">👥</div>
          <div className="title">DRH</div>
          <div className="subtitle">Directeur RH</div>
          <div className="status approved">
            <Check size={14} /> RECOMMANDÉ
          </div>
        </div>

        {/* Financial Director - Pending */}
        <div className="workflow-box daf">
          <div className="icon">💰</div>
          <div className="title">DAF</div>
          <div className="subtitle">Directeur Financier</div>
          <div className="status pending">
            <Clock size={14} /> EN ATTENTE
          </div>
        </div>

        {/* Commercial Director - Pending */}
        <div className="workflow-box dcm">
          <div className="icon">📊</div>
          <div className="title">DCM</div>
          <div className="subtitle">Directeur Commercial</div>
          <div className="status pending">
            <Clock size={14} /> EN ATTENTE
          </div>
        </div>
      </div>

      {/* Connector from directors to DG */}
      <div className="connector-svg-container">
        <svg className="connector-svg" width="600" height="48" viewBox="0 0 600 48">
          {/* Three vertical lines from directors */}
          <line x1="120" y1="0" x2="120" y2="24" stroke="#7986cb" strokeWidth="3" />
          <line x1="300" y1="0" x2="300" y2="24" stroke="#7986cb" strokeWidth="3" />
          <line x1="480" y1="0" x2="480" y2="24" stroke="#7986cb" strokeWidth="3" />

          {/* Horizontal convergence line */}
          <line x1="120" y1="24" x2="480" y2="24" stroke="#7986cb" strokeWidth="3" />

          {/* Final vertical line to DG */}
          <line x1="300" y1="24" x2="300" y2="40" stroke="#7986cb" strokeWidth="3" />

          {/* Arrow */}
          <polygon points="300,40 294,32 306,32" fill="#7986cb" />
        </svg>
      </div>

      {/* General Director */}
      <div className="workflow-box dg">
        <div className="icon">
          <Star size={20} />
        </div>
        <div className="title">DG</div>
        <div className="subtitle">Directeur Général</div>
        <div className="status pending">
          <Clock size={14} /> EN ATTENTE
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
  )
}
