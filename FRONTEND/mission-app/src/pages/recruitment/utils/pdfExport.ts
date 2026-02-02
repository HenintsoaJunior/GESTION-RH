import type { JobDescriptionDetails, RequestDetailsDTO, RequestValidationDTO } from "@/api/recruitment/service";
import jsPDF from "jspdf";
import html2pdf from "html2pdf.js";
import { buildRecruitmentJobDescriptionHtml, buildRecruitmentRequestHtml, formatDate } from "./htmlToPdf";

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });


// ====================================
// Export Demande en PDF
// ====================================
const drawRequestHeader = (
  pdf: jsPDF,
  logo: HTMLImageElement,
  details: RequestDetailsDTO,
  page: number,
  total: number
) => {
  const startY = 10;
  const rowHeight = 22;

  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginX = 15;

  const colLogo = 35;
  const colInfo = 45;
  const colTitle = pageWidth - marginX * 2 - colLogo - colInfo;

  pdf.setLineWidth(0.5);
  pdf.rect(marginX, startY, colLogo, rowHeight);
  pdf.rect(marginX + colLogo, startY, colTitle, rowHeight);
  pdf.rect(marginX + colLogo + colTitle, startY, colInfo, rowHeight);

  const padding = 3;
  let w = colLogo - padding * 2;
  let h = (logo.height / logo.width) * w;
  if (h > rowHeight - padding * 2) {
    h = rowHeight - padding * 2;
    w = (logo.width / logo.height) * h;
  }
  pdf.addImage(logo, "JPEG", marginX + (colLogo - w) / 2, startY + (rowHeight - h) / 2, w, h);

  const titleX = marginX + colLogo + colTitle / 2;
  const fontSize = 13;
  pdf.setFont("Times", "bold");
  pdf.setFontSize(fontSize);
  const boxCenterY = startY + rowHeight / 2.5;
  const textHeight = fontSize * 0.7;
  const titleY = boxCenterY + textHeight / 2 - 1;
  pdf.text("Demande d'autorisation de recrutement", titleX, titleY, { align: "center" });

  pdf.setFont("Times", "normal");
  pdf.setFontSize(9);
  const infoX = marginX + colLogo + colTitle + 2;
  pdf.text(`Référence : ${details.id}`, infoX, startY + 7);
  pdf.text(`Date : ${formatDate(details.sendingDate)}`, infoX, startY + 12);
  pdf.text(`Page : ${page} / ${total}`, infoX, startY + 17);
};

export const exportRequestToPDF = async (
  details: RequestDetailsDTO,
  validations: RequestValidationDTO[]
) => {
  // HTML avec Intitulé/Effectif uniquement sous le header
  const htmlContent = buildRecruitmentRequestHtml(details, validations);

  const container = document.createElement("div");
  container.innerHTML = htmlContent;

  container.style.width = "180mm";
  container.style.padding = "8mm";
  container.style.boxSizing = "border-box";

  const logo = await loadImage("/Logo.JPG");

  await html2pdf()
    .set({
      margin: [35, 8, 15, 8],
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .from(container)
    .toPdf()
    .get("pdf")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((pdf: any) => {
      const pageCount = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        drawRequestHeader(pdf, logo, details, i, pageCount);
      }

      pdf.save(`Demande_${details.post}.pdf`);
    });
};


// ====================================
// Export TDR en PDF
// ====================================
const drawJobDescriptionHeader = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  logo: HTMLImageElement,
  job: JobDescriptionDetails,
  page: number,
  total: number
) => {
  const startY = 10;
  const rowHeight = 22;

  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginX = 15;

  const colLogo = 35;
  const colInfo = 45;
  const colTitle = pageWidth - marginX * 2 - colLogo - colInfo;

  pdf.setLineWidth(0.5);
  pdf.rect(marginX, startY, colLogo, rowHeight);
  pdf.rect(marginX + colLogo, startY, colTitle, rowHeight);
  pdf.rect(marginX + colLogo + colTitle, startY, colInfo, rowHeight);

  /* ====== LOGO AUTO-FIT ====== */
  const padding = 3;
  const maxW = colLogo - padding * 2;
  const maxH = rowHeight - padding * 2;

  let w = maxW;
  let h = (logo.height / logo.width) * w;

  if (h > maxH) {
    h = maxH;
    w = (logo.width / logo.height) * h;
  }

  pdf.addImage(
    logo, "JPEG",
    marginX + (colLogo - w) / 2,
    startY + (rowHeight - h) / 2,
    w, h
  );

  /* ====== TITRE PARFAITEMENT CENTRÉ ====== */
  const fontSize = 13;
  pdf.setFont("Times", "bold");
  pdf.setFontSize(fontSize);

  const titleX = marginX + colLogo + colTitle / 2;
  const boxCenterY = startY + rowHeight / 2.5;
  const textHeight = fontSize * 0.7;
  const titleY = boxCenterY + textHeight / 2 - 1;

  pdf.text("Avis de recrutement interne", titleX, titleY, {
    align: "center",
  });

  /* ====== INFOS ====== */
  pdf.setFont("Times", "normal");
  pdf.setFontSize(9);

  const infoX = marginX + colLogo + colTitle + 2;

  pdf.text(`Référence : ${job.id}`, infoX, startY + 7);
  pdf.text(`Date : ${formatDate(job.createdAt)}`, infoX, startY + 12);
  pdf.text(`Page : ${page} / ${total}`, infoX, startY + 17);
};


export const exportJobDescriptionToPDF = async (
  details: RequestDetailsDTO,
  job: JobDescriptionDetails
) => {
  const htmlContent = buildRecruitmentJobDescriptionHtml(details, job);

  const container = document.createElement("div");
  container.innerHTML = htmlContent;
  container.style.width = "180mm";
  container.style.padding = "8mm";

  const logo = await loadImage("/Logo.JPG");

  await html2pdf()
    .set({
      margin: [30, 8, 15, 8],
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(container)
    .toPdf()
    .get("pdf")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((pdf: any) => {
      const pageCount = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        drawJobDescriptionHeader(pdf, logo, job, i, pageCount);
      }

      pdf.save(`Recrutement_${job.post}_${formatDate(job.createdAt)}.pdf`);
    });
};
