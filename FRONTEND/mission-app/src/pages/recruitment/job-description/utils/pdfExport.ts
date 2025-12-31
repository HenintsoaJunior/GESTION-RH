import type { JobDescriptionDetails, RequestDetailsDTO, RequestValidationDTO } from "@/api/recruitment/service";
import jsPDF from "jspdf";

// ====================================
// Export Fiche de poste PDF
// ====================================
export const exportJobToPDF = (job: JobDescriptionDetails) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageWidth = 595;
  let yPos = margin;

  /* TITRE */
  doc.setFontSize(18);
  doc.setFont("times", "normal"); // serif
  doc.text(`Fiche de poste N° ${job.id}` , pageWidth / 2, yPos, { align: "center" });
  yPos += 30;

  /* SÉPARATEUR */
  doc.setLineWidth(1);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 20;

  doc.setFontSize(12);
  doc.setFont("times", "normal"); // serif

  const writeRow = (label: string, value: string | string[]) => {
    // Sous-titre souligné
    doc.setFont("times", "normal");
    doc.text(`${label} :`, margin, yPos);
    const labelWidth = doc.getTextWidth(`${label} :`);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 2, margin + labelWidth, yPos + 2);

    yPos += 18; // descendre sous le label

    doc.setFont("times", "normal"); // valeurs moins grasses

    if (Array.isArray(value) && value.length > 0) {
      value.forEach((v) => {
        const lines = doc.splitTextToSize(`• ${v}`, pageWidth - margin * 2 - 20); // puce
        doc.text(lines, margin + 20, yPos);
        yPos += lines.length * doc.getLineHeight();
      });
      yPos += 10;
    } else {
      const text = typeof value === "string" ? value : "--";
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2 - 20);
      doc.text(lines, margin + 20, yPos);
      yPos += lines.length * doc.getLineHeight() + 10;
    }
  };

  writeRow("Nom du poste", job.post);
  writeRow("Mission", job.mission);

  if (job.attributions.length > 0) writeRow("Attributions", job.attributions);
  if (job.formations.length > 0) writeRow("Formations", job.formations);
  if (job.experiences.length > 0) writeRow("Expériences", job.experiences);
  if (job.softSkills.length > 0) writeRow("Soft Skills", job.softSkills);
  if (job.skills.length > 0) writeRow("Compétences techniques", job.skills);
  if (job.lastTitular) writeRow("Dernier titulaire", job.lastTitular);

  doc.save(`Fiche_poste_${job.id}.pdf`);
};

// ====================================
// Export Demande PDF
// ====================================
export const exportRequestToPDF = (details: RequestDetailsDTO, validations: RequestValidationDTO[], beginningDate: string, endingDate: string) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageWidth = 595;
  let yPos = margin;

  /* TITRE */
  doc.setFontSize(18);
  doc.setFont("times", "normal"); // serif
  doc.text(`Demande N° ${details.id}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 30;

  /* SÉPARATEUR */
  doc.setLineWidth(1);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 20;

  doc.setFontSize(12);
  doc.setFont("times", "normal"); // serif

  const infoRows: [string, string | null | undefined][] = [
    ["Statut", details.status],
    ["Demandeur", details.applicantUser],
    ["Direction", details.direction],
    ["Departement", details.department],
    ["Service", details.service],
    ["Contrat", details.contract ?? details.contractPrecision],
    ["Début du contrat", beginningDate],
    ["Durée", details.monthDuration != null ? `${details.monthDuration} mois` : "--"],
    ["Fin du contrat", endingDate],
    ["Sites concernées", details.sites.join(", ")],
  ];

  if(details.isReplacement) {
    infoRows.push(
      ["Remplacement", "Oui"],
      ["Motif du remplacement", details.replacementReason ?? details.reasonPrecision],
      ["Ancien titulaire", details.lastTitular ?? "—"]
    );
  }

  infoRows.forEach(([label, value]) => {
    doc.setFont("times", "normal"); // sous-titre serif, non souligné
    doc.text(`${label} :`, margin, yPos);

    doc.setFont("times", "normal"); // valeurs serif
    doc.text(value ?? "—", margin + 150, yPos);
    yPos += 18;
  });
  yPos += 20;

  /* SÉPARATEUR */
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 40;

  /* SIGNATURES */
  if (validations.length > 0) {
    const tableTop = yPos;
    const tableWidth = pageWidth - 2 * margin;
    const colWidth = tableWidth / validations.length;

    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setLineWidth(0.3);
    doc.setDrawColor(120);

    let maxNameHeight = 0;
    const wrappedNames = validations.map(v => {
      const lines = doc.splitTextToSize(v.applicantUser ?? "", colWidth - 10);
      const height = lines.length * doc.getLineHeight();
      maxNameHeight = Math.max(maxNameHeight, height);
      return lines;
    });

    const nameRowHeight = Math.max(26, maxNameHeight + 10);
    const signatureRowHeight = 85;

    validations.forEach((v, index) => {
      const x = margin + index * colWidth;
      doc.rect(x, tableTop, colWidth, nameRowHeight);
      doc.text(wrappedNames[index], x + colWidth / 2, tableTop + 16, { align: "center" });

      doc.rect(x, tableTop + nameRowHeight, colWidth, signatureRowHeight);

      if (v.signatureBase64) {
        doc.addImage(`data:image/png;base64,${v.signatureBase64}`, "PNG", x + 10, tableTop + nameRowHeight + 10, colWidth - 20, 45);
      } else {
        doc.setFont("times", "italic");
        doc.text("En attente", x + colWidth / 2, tableTop + nameRowHeight + signatureRowHeight / 2, { align: "center" });
        doc.setFont("times", "normal");
      }
    });

    yPos += nameRowHeight + signatureRowHeight + 25;
  }

  doc.save(`Demande/${details.id}.pdf`);
};
