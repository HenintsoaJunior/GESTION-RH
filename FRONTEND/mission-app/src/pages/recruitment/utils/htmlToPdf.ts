import type { JobDescriptionDetails, RequestDetailsDTO, RequestValidationDTO } from "@/api/recruitment/service";

const basePdfStyles = () => `
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 14px;
    line-height: 1.5;
    color: #222;
  }

  .page {
    padding: 20px;
    max-width: 900px;
    margin: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  .section {
    margin-top: 12px;
    page-break-inside: avoid;
  }

  .section-title {
    font-weight: bold;
    font-size: 14px;
    text-transform: none;
    border-bottom: none;
    margin-bottom: 4px;
  }

  .sub-section {
    margin-bottom: 4px;
  }

  .header-table {
    width: 100%;
    margin-bottom: 25px;
    border: 1px solid #000;
  }

  .header-table td {
    border: none;
    padding: 6px 8px;
    vertical-align: middle;
  }

  .header-logo { width: 20%; text-align: center; }
  .header-title { width: 50%; text-align: center; font-size: 20px; font-weight: bold; }
  .header-info { width: 30%; font-size: 11px; }

  .no-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }
`;

const recruitmentRequestStyles = () => `
  .section-title {
    font-weight: bold;
    font-size: 14px;
    margin-top: 16px;
    margin-bottom: 6px;
    border-bottom: 1px solid #ccc; /* Sépare la section */
    padding-bottom: 2px;
  }

  .sub-section {
    margin-left: 12px;   /* indentation pour sous-section */
    margin-bottom: 4px;
  }

  .sub-section span.label {
    font-weight: bold;   /* label en gras */
    display: inline;
    white-space: normal;
  }

  .sub-section span.value {
    font-weight: normal; /* valeurs non bold */
  }

  table.border {
    width: 100%;
    border-collapse: collapse;
    border: 0.5px solid #000; /* bordure fine */
  }

  table.border td, table.border th {
    border: 0.5px solid #000; /* bordure fine */
    padding: 6px;
    vertical-align: top;
    font-weight: normal; /* éviter le gras par défaut */
  }

  td.center {
    text-align: center;
  }

  .validator-name {
    font-size: 12px;
    font-weight: bold; /* juste le nom */
  }

  .small {
    font-size: 12px;
    color: #555;
  }

  .job-header {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    margin-bottom: 8px;
  }

  .job-header .label {
    font-weight: bold;
  }

  .job-header .value {
    font-weight: normal;
  }
  
  .page { 
    page-break-inside: avoid; 
  }
`;


const jobDescriptionStyles = () => `
  ul {
    margin: 6px 0 0 30px;
    padding: 0;
  }

  li {
    margin-bottom: 6px;
  }

  .section {
    margin-top: 12px;
  }

  .section-title {
    font-size: 14px;
    font-weight: bold;
    border: none;
    margin-bottom: 6px;
    text-transform: none;
  }

  .inline-field {
    display: flex;
    gap: 6px;
    margin-bottom: 4px;
  }

  .inline-label {
    font-weight: bold;
    white-space: nowrap;
  }

  .inline-value {
    flex: 1;
  }

  .profil-ideal {
    margin-top: 14px;
  }

  .profil-ideal strong {
    display: block;
    margin-top: 12px;     
    margin-left: 14px;   
    font-size: 13.5px;
  }

  .profil-ideal ul {
    margin-top: 4px;
  }

  .page > .section:first-child {
    margin-top: 0;
  }
`;


export const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("fr-FR") : "—";

// ============================================
// FONCTIONS DE GENERATION PDF
// ============================================

export function buildRecruitmentRequestHtml(
  details: RequestDetailsDTO,
  validations: RequestValidationDTO[]
) {
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <title>Demande de recrutement</title>
    <style>
      ${basePdfStyles()}
      ${recruitmentRequestStyles()}
    </style>
  </head>
  <body>
    <div class="page">

      <!-- INTITULÉ / EFFECTIF -->
      <div class="job-header">
        <div><span class="label">Intitulé du poste :</span> <span class="value">${details.post ?? "—"}</span></div>
        <div><span class="label">Effectif :</span> <span class="value">${details.effective ?? "—"}</span></div>
      </div>

      <!-- NATURE -->
      <div class="section">
        <div class="section-title">Nature du contrat</div>
        <div class="sub-section"><span class="label">Type :</span> <span class="value">${details.contract ?? details.contractPrecision ?? "—"}</span></div>
        ${details.contract !== "CDI" ? `<div class="sub-section"><span class="label">Durée :</span> <span class="value">${details.monthDuration ? details.monthDuration + " mois" : "—"}</span></div>` : ""}
      </div>

      <!-- RATTACHEMENT -->
      <div class="section">
        <div class="section-title">Rattachement du poste</div>
        <div class="sub-section"><span class="label">Direction :</span> <span class="value">${details.direction ?? "—"}</span></div>
        <div class="sub-section"><span class="label">Département :</span> <span class="value">${details.department ?? "—"}</span></div>
        <div class="sub-section"><span class="label">Service :</span> <span class="value">${details.service ?? "—"}</span></div>
        <div class="sub-section"><span class="label">Rattachement hiérarchique :</span> <span class="value">${details.hierarchicalManager ?? "—"}</span></div>
        <div class="sub-section"><span class="label">Rattachement fonctionnel :</span> <span class="value">${details.functionalManager ?? "—"}</span></div>
      </div>

      <!-- MOTIF -->
      <div class="section">
        <div class="section-title">Motif du recrutement</div>
        <div class="sub-section"><span class="label">Remplacement :</span> <span class="value">${details.isReplacement ? "OUI" : "NON"}</span></div>
        ${details.isReplacement ? `
          <div class="sub-section"><span class="label">Date de remplacement :</span> <span class="value">${formatDate(details.replacementDate)}</span></div>
          <div class="sub-section"><span class="label">Motif de remplacement :</span> <span class="value">${details.replacementReason ?? details.reasonPrecision}</span></div>
          <div class="sub-section"><span class="label">Ancien titulaire :</span> <span class="value">${details.lastTitular ?? "—"}</span></div>
        ` : ""}
        <div class="sub-section"><span class="label">Dotation au budget :</span> <span class="value">${details.isPlanned ? "Prévue" : "Non-prévue"}</span></div>
        ${!details.isPlanned ? `<div class="sub-section"><span class="label">Explications de création :</span> <span class="value">${details.notPlannedReason ?? "—"}</span></div>` : ""}
      </div>

      <!-- DATE DE PRISE -->
      <div class="section">
        <div class="section-title">Date de prise de service souhaitée</div>
        <div class="sub-section"><span class="value">${formatDate(details.beginningDate)}</span></div>
      </div>

      <!-- VALIDATIONS -->
      <div class="section">
        <div class="section-title">Validations de la demande</div>
        <table class="border">
          <tr>
            ${validations.map(v => `<td class="center validator-name">${v.validator}</td>`).join("")}
          </tr>
          <tr>
            ${validations.map(v => `<td class="center">${(v.status=="En cours") ? "Validée":v.status ?? "—"}<br/><span class="small">${formatDate(v.validatedAt)}</span></td>`).join("")}
          </tr>
        </table>
      </div>

      <!-- FOOTER -->
      <div class="section">
        <strong>Reçu par la Direction des Ressources Humaines le :</strong>
        ........................................................
      </div>
    </div>
  </body>
  </html>
  `;
}


export function buildRecruitmentJobDescriptionHtml(
  details: RequestDetailsDTO,
  job: JobDescriptionDetails
) {
  const buildList = (items: string[]) =>
    items.length
      ? `<ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>`
      : "";

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <title>Fiche de poste</title>
    <style>
      ${basePdfStyles()}
      ${jobDescriptionStyles()}
    </style>
  </head>

  <body>
    <div class="page">

      <!-- INFOS PRINCIPALES -->
      <div class="section">
        <div class="inline-field">
          <span class="inline-label">Rattachement hiérarchique :</span>
          <span class="inline-value">${details.hierarchicalManager ?? "—"}</span>
        </div>

        <div class="inline-field">
          <span class="inline-label">Lieu(x) de travail :</span>
          <span class="inline-value">${details.sites.join(", ")}</span>
        </div>

        <div class="inline-field">
          <span class="inline-label">Type de contrat :</span>
          <span class="inline-value">
            ${details.contract ?? details.contractPrecision ?? "—"}
          </span>
        </div>
      </div>

      <!-- MISSIONS -->
      <div class="section">
        <div class="section-title">Missions</div>
        <div class="sub-section">${job.mission}</div>
      </div>

      <!-- ATTRIBUTIONS -->
      ${
        job.attributions.length
          ? `
          <div class="section">
            <div class="section-title">Attributions</div>
            ${buildList(job.attributions)}
          </div>
        `
          : ""
      }

      <!-- PROFIL IDÉAL -->
      <div class="section profil-ideal">
        <div class="section-title">Profil idéal</div>

        ${job.formations.length ? `<strong>Formations</strong>${buildList(job.formations)}` : ""}
        ${job.experiences.length ? `<strong>Expériences professionnelles</strong>${buildList(job.experiences)}` : ""}
        ${job.softSkills.length ? `<strong>Qualités personnelles requises</strong>${buildList(job.softSkills)}` : ""}
        ${job.skills.length ? `<strong>Compétences requises</strong>${buildList(job.skills)}` : ""}
      </div>

      <hr style="
        margin: 22px 0 12px 0;
        border: none;
        border-top: 0.5px solid #555;
        height: 0;
      " />

      <!-- FOOTER -->
      <p style="margin-top:20px" class="no-break">
        Le dossier de candidature composé d’une lettre de motivation et 
        d’un curriculum vitae détaillé (avec photo d’identité récente et 
        mentionnant un numéro de téléphone et une adresse courriel) devra 
        être adressé au plus tard le <b>${formatDate(details.beginningDate)}</b> à 
        <b>recrutement.interne@ravinala-airports.aero</b>
        dont objet : <u>${job.post}</u>.
      </p>
    </div>
  </body>
  </html>
`;
}
