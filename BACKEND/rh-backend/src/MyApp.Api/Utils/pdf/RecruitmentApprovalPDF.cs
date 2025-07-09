using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using System;
using System.IO;

namespace Utils.pdf
{
    public class RecruitmentApprovalPDF
    {
        public byte[] GenerateApprovalPdf()
        {
            using (MemoryStream memoryStream = new MemoryStream())
            {
                // Créer le document PDF
                PdfWriter writer = new PdfWriter(memoryStream);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf);

                // Ajouter le texte au centre du document
                Paragraph paragraph = new Paragraph("Votre demande a été validée")
                    .SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER)
                    .SetFontSize(20);
                document.Add(paragraph);

                // Fermer le document
                document.Close();

                return memoryStream.ToArray();
            }
        }

        // Méthode pour préparer la réponse HTTP avec le PDF
        public (byte[] fileContent, string contentType, string fileName) PreparePdfDownload()
        {
            byte[] pdfBytes = GenerateApprovalPdf();
            string contentType = "application/pdf";
            string fileName = $"Recruitment_Approval_{DateTime.Now:yyyyMMddHHmmss}.pdf";

            return (pdfBytes, contentType, fileName);
        }
    }
}