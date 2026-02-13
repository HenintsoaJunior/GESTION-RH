import type { RequestValidationDTO } from "@/api/recruitment/service";
import RecruitmentStatusTag from "@/components/recruitment-status";
import { formatDate } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  hasJobDescription?: boolean;
  validations: RequestValidationDTO[];
  tdrValidations: RequestValidationDTO[];
}

const RequestHistoricTab: React.FC<Props> = ({ validations, tdrValidations }) => {
    return (<>
    {/* ===== HISTORIQUES POUR DEMANDE ===== */}
      <div className="card validation-card">
        <h3>Validations de la demande</h3>
        <div className="table-wrapper">
          <table className="validation-table">
            <thead>
              <tr>
                <th>Direction</th>
                <th>Validateur</th>
                <th>Décision</th>
                <th>Faite le</th>
              </tr>
            </thead>
            <tbody>
              {validations.map((v, i) => {
                const validated = !!v.validatedAt;
                return (
                  <tr key={i}>
                    <td style={{fontWeight:"bold"}}>{v.direction}</td>
                    <td>{v.validator}</td>
                    <td> 
                      { (validated) ? (<>
                        { v.status.toLowerCase()=="refusée" ? (
                          <RecruitmentStatusTag status="refusée" />
                        ) : <RecruitmentStatusTag status="validée" /> }
                      </>) 
                      : (<span>--</span>) } 
                    </td>
                    <td>
                      {validated
                        ? formatDate(new Date(v.validatedAt!), "dd MMM yyyy HH:mm", { locale: fr })
                        : "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    {/* ===== HISTORIQUES POUR TDR ===== */}
        <div className="card validation-card">
          <h3>Validations du TDR</h3>
          {(tdrValidations && tdrValidations.length > 0) ? (
            <div className="table-wrapper">
              <table className="validation-table">
                <thead>
                  <tr>
                    <th>Direction</th>
                    <th>Validateur</th>
                    <th>Décision</th>
                    <th>Faite le</th>
                  </tr>
                </thead>
                <tbody>
                  {tdrValidations.map((v, i) => {
                    const validated = !!v.validatedAt;
                    return (
                      <tr key={i}>
                        <td style={{fontWeight:"bold"}}>{v.direction}</td>
                        <td>{v.validator}</td>
                        <td> 
                          { (validated) ? (<>
                            { v.status.toLowerCase()=="refusée" ? (
                              <RecruitmentStatusTag status="refusée" />
                            ) : <RecruitmentStatusTag status="validée" /> }
                          </>) 
                          : (<span>--</span>) } 
                        </td>
                        <td>
                          {validated
                            ? formatDate(new Date(v.validatedAt!), "dd MMM yyyy HH:mm", { locale: fr })
                            : "--"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{paddingLeft:"2%"}}>Aucune validation de TDR trouvée.</p>
          )}
        </div>

    </>);
}

export default RequestHistoricTab;
