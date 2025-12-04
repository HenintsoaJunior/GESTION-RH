using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace MyApp.Api.Models.classes.notifications;

public class TemplateEmail
{
    private readonly string _logoUrl;

    public TemplateEmail(string logoUrl)
    {
        _logoUrl = logoUrl ?? string.Empty;
    }

   
    public (string subject, string html, string plainText) GetValidatorTemplate(
        string actionType,
        string createdBy,
        string role,
        string createdDate,
        string status,
        string linkUrl,
        string? subject = null)
    {
        string dynamicSubject = subject ?? "Mission en attente de validation";
        string bannerTitle = "Nouvelle mission en attente de validation";
        string bannerSubtitle = "Une action de votre part est requise";
        string missionTitle = "Détails de la Mission à Valider";
        string buttonText = "Consulter et Valider la Mission";
        string bannerColor = "#f59e0b";
        string textColor = "#92400e";
        string badgePrefix = "⏱";

        string imageSrc = _logoUrl;
        var plainTextMessage = $@"
GESTION DES MISSIONS
{bannerTitle}
{bannerSubtitle}
DÉTAILS DE LA MISSION
---------------------
Créée par : {createdBy}
Date de création : {createdDate}
Statut : {status}
Pour {buttonText.ToLowerInvariant()}, veuillez accéder à la plateforme :
{linkUrl}
---
Cet email a été envoyé automatiquement par le système de gestion des missions.
Vous recevez cette notification en tant que valideur pour cette {actionType.ToLowerInvariant()}.
© 2025 Gestion des Missions. Tous droits réservés.
".Trim();

        var htmlMessage = $@"<!DOCTYPE html>
<html lang=""fr"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>{dynamicSubject}</title>
  <style>
    :root {{
      --primary-color: #69b42e;
      --primary-dark: #5a8c42;
      --secondary-color: #f59e0b;
      --text-primary: #333;
      --text-secondary: #63666a;
      --bg-light: #f8f9fa;
      --border-light: #e0e0e0;
    }}
    * {{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }}
    body {{
      font-family: Arial, sans-serif;
      background-color: #f8f9fa;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }}
    table {{
      border-collapse: collapse;
    }}
    .email-container {{
      max-width: 650px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
    }}
    .email-header {{
      background: #ffffff;
      padding: 32px 30px;
      border-bottom: 3px solid #e0e0e0;
    }}
    .header-content {{
      width: 100%;
    }}
    .header-title {{
      color: #333;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      letter-spacing: -0.3px;
      margin: 0;
    }}
    .logo-wrapper {{
      background-color: #ffffff;
      padding: 4px;
      text-align: left;
    }}
    .status-banner {{
      background-color: #fffbeb;
      border-left: 4px solid {bannerColor};
      padding: 22px 30px;
    }}
    .status-content h2 {{
      color: {textColor};
      font-size: 19px;
      font-weight: bold;
      margin-bottom: 6px;
      letter-spacing: -0.2px;
    }}
    .status-content p {{
      color: {textColor};
      font-size: 14px;
      opacity: 0.85;
      margin: 0;
    }}
    .email-body {{
      padding: 36px 30px;
    }}
    .mission-card {{
      border: 2px solid #e0e0e0;
      padding: 28px;
      margin-bottom: 28px;
    }}
    .mission-title {{
      color: #69b42e;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 22px;
      padding-bottom: 14px;
      border-bottom: 3px solid #69b42e;
    }}
    .mission-title::before {{
      content: ""📋 "";
    }}
    .info-row {{
      padding: 14px 0;
      border-bottom: 1px solid #f0f0f0;
    }}
    .info-row:last-child {{
      border-bottom: none;
    }}
    .info-label {{
      font-weight: bold;
      color: #63666a;
      display: inline-block;
      min-width: 170px;
      font-size: 14px;
    }}
    .info-value {{
      color: #333;
      font-size: 14px;
      display: inline-block;
    }}
    .status-badge {{
      display: inline-block;
      background-color: #fffbeb;
      color: {textColor};
      padding: 6px 14px;
      font-weight: bold;
      font-size: 13px;
      border: 1px solid #fde68a;
    }}
    .status-badge::before {{
      content: ""{badgePrefix} "";
    }}
    .action-section {{
      text-align: center;
      margin: 28px 0;
    }}
    .action-button {{
      display: inline-block;
      background: #69b42e;
      color: #ffffff;
      padding: 16px 36px;
      text-decoration: none;
      font-weight: bold;
      font-size: 15px;
      border: none;
    }}
    .action-button:hover {{
      background: #5a8c42;
    }}
    .divider {{
      height: 1px;
      background: #e0e0e0;
      margin: 28px 0;
    }}
    .metadata {{
      background-color: #f8f9fa;
      padding: 20px;
      margin-top: 24px;
      border-left: 3px solid #9d9d9c;
    }}
    .metadata-item {{
      font-size: 13px;
      color: #63666a;
      line-height: 1.5;
      margin-bottom: 12px;
    }}
    .metadata-item:last-child {{
      margin-bottom: 0;
    }}
    .metadata-item::before {{
      content: ""ℹ️ "";
    }}
    .email-footer {{
      background: #f8f9fa;
      padding: 28px 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }}
    .footer-logo {{
      font-size: 18px;
      font-weight: bold;
      color: #69b42e;
      margin-bottom: 8px;
      display: block;
    }}
    .footer-text {{
      color: #63666a;
      font-size: 13px;
      line-height: 1.7;
      margin-bottom: 12px;
    }}
    .footer-links {{
      margin: 16px 0;
    }}
    .footer-link {{
      color: #69b42e;
      text-decoration: none;
      font-weight: bold;
      padding: 0 8px;
    }}
    .footer-link:hover {{
      color: #5a8c42;
      text-decoration: underline;
    }}
    .footer-separator {{
      color: #e0e0e0;
      margin: 0 4px;
    }}
    .copyright {{
      font-size: 12px;
      color: #9ca3af;
      margin-top: 16px;
    }}
    @media (max-width: 600px) {{
      body {{ padding: 10px; }}
      .email-header {{
        padding: 24px 20px;
      }}
      .header-title {{
        font-size: 20px;
      }}
      .status-banner {{
        padding: 18px 20px;
      }}
      .email-body {{ padding: 28px 20px; }}
      .mission-card {{
        padding: 22px;
      }}
      .info-row {{
        display: block;
      }}
      .info-label {{
        min-width: auto;
        display: block;
        margin-bottom: 4px;
      }}
      .action-button {{
        display: block;
        text-align: center;
        padding: 14px 28px;
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
      }}
      .email-footer {{
        padding: 24px 20px;
      }}
    }}
  </style>
</head>
<body>
  <table class=""email-container"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
    <tr>
      <td class=""email-header"">
        <table class=""header-content"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
          <tr>
            <td width=""20%"" align=""left"" valign=""middle"">
              <div class=""logo-wrapper"">
                <img src=""{imageSrc}"" alt=""Logo"" width=""80"" height=""80"" style=""width: 80px; height: 80px; border: 0; display: block;"">
              </div>
            </td>
            <td width=""80%"" align=""center"" valign=""middle"">
              <h1 class=""header-title"">Gestion des Missions</h1>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class=""status-banner"">
        <table cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
          <tr>
            <td>
              <h2>{bannerTitle}</h2>
              <p>{bannerSubtitle}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class=""email-body"">
        <table cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
          <tr>
            <td class=""mission-card"">
              <h3 class=""mission-title"">{missionTitle}</h3>
              <div class=""info-row"">
                <span class=""info-label"">Créée par :</span>
                <span class=""info-value""><strong>{createdBy}</strong> ({role})</span>
              </div>
              <div class=""info-row"">
                <span class=""info-label"">Date de création :</span>
                <span class=""info-value"">{createdDate}</span>
              </div>
              <div class=""info-row"">
                <span class=""info-label"">Statut :</span>
                <span class=""info-value"">
                  <span class=""status-badge"">{status}</span>
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td class=""action-section"">
              <a href=""{linkUrl}"" class=""action-button"">
                {buttonText}
              </a>
            </td>
          </tr>
          <tr>
            <td class=""divider""></td>
          </tr>
          <tr>
            <td class=""metadata"">
              <div class=""metadata-item"">
                Cet email a été envoyé automatiquement par le système de gestion des missions
              </div>
              <div class=""metadata-item"">
                Vous recevez cette notification en tant que valideur pour cette {actionType}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class=""email-footer"">
        <table cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
          <tr>
            <td align=""center"">
              <span class=""footer-logo"">Gestion des Missions</span>
              <p class=""footer-text"">
                Système de gestion et de suivi des missions
              </p>
              <div class=""footer-links"">
                <a href=""http://localhost:5183"" class=""footer-link"">Accéder à la plateforme</a>
                <span class=""footer-separator"">•</span>
                <a href=""http://localhost:5183/support"" class=""footer-link"">Aide et support</a>
              </div>
              <p class=""copyright"">
                © 2025 Gestion des Missions. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

        return (dynamicSubject, htmlMessage, plainTextMessage);
    }

    /// <summary>
    /// Template pour le collaborateur : Notification que la mission a été validée par le valideur.
    /// </summary>
    /// <param name="missionTitle">Titre de la mission.</param>
    /// <param name="validatorName">Nom du valideur.</param>
    /// <param name="validatedDate">Date de validation.</param>
    /// <param name="status">Statut (ex: "Validée").</param>
    /// <param name="linkUrl">URL du lien.</param>
    /// <param name="subject">Sujet optionnel.</param>
    /// <returns>Tuple contenant le sujet, le HTML et le texte brut.</returns>
    public (string subject, string html, string plainText) GetCollaboratorValidatedTemplate(
        string missionTitle,
        string validatorName,
        string validatedDate,
        string status,
        string linkUrl,
        string? subject = null)
    {
        string dynamicSubject = subject ?? "Votre mission a été validée";
        string bannerTitle = "Mission validée avec succès";
        string bannerSubtitle = "Votre mission est prête pour la suite du processus";
        string buttonText = "Voir les détails de la mission";
        string bannerColor = "#10b981";
        string textColor = "#047857";
        string badgePrefix = "✅";

        string imageSrc = _logoUrl;

        var plainTextMessage = $@"
GESTION DES MISSIONS
{bannerTitle}
{bannerSubtitle}
DÉTAILS DE LA VALIDATION
---------------------
Validée par : {validatorName}
Date de validation : {validatedDate}
Statut : {status}
Pour consulter les détails, veuillez accéder à la plateforme :
{linkUrl}
---
Cet email a été envoyé automatiquement par le système de gestion des missions.
Félicitations, votre mission a été validée !
© 2025 Gestion des Missions. Tous droits réservés.
".Trim();

        var htmlMessage = $@"<!DOCTYPE html>
<html lang=""fr"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>{dynamicSubject}</title>
  <style>
    :root {{
      --primary-color: #69b42e;
      --primary-dark: #5a8c42;
      --secondary-color: #f59e0b;
      --text-primary: #333;
      --text-secondary: #63666a;
      --bg-light: #f8f9fa;
      --border-light: #e0e0e0;
    }}
    * {{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }}
    body {{
      font-family: Arial, sans-serif;
      background-color: #f8f9fa;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }}
    table {{
      border-collapse: collapse;
    }}
    .email-container {{
      max-width: 650px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
    }}
    .email-header {{
      background: #ffffff;
      padding: 32px 30px;
      border-bottom: 3px solid #e0e0e0;
    }}
    .header-content {{
      width: 100%;
    }}
    .header-title {{
      color: #333;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      letter-spacing: -0.3px;
      margin: 0;
    }}
    .logo-wrapper {{
      background-color: #ffffff;
      padding: 4px;
      text-align: left;
    }}
    .status-banner {{
      background-color: #ecfdf5;
      border-left: 4px solid {bannerColor};
      padding: 22px 30px;
    }}
    .status-content h2 {{
      color: {textColor};
      font-size: 19px;
      font-weight: bold;
      margin-bottom: 6px;
      letter-spacing: -0.2px;
    }}
    .status-content p {{
      color: {textColor};
      font-size: 14px;
      opacity: 0.85;
      margin: 0;
    }}
    .email-body {{
      padding: 36px 30px;
    }}
    .mission-card {{
      border: 2px solid #e0e0e0;
      padding: 28px;
      margin-bottom: 28px;
    }}
    .mission-title {{
      color: #69b42e;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 22px;
      padding-bottom: 14px;
      border-bottom: 3px solid #69b42e;
    }}
    .mission-title::before {{
      content: ""🎉 "";
    }}
    .info-row {{
      padding: 14px 0;
      border-bottom: 1px solid #f0f0f0;
    }}
    .info-row:last-child {{
      border-bottom: none;
    }}
    .info-label {{
      font-weight: bold;
      color: #63666a;
      display: inline-block;
      min-width: 170px;
      font-size: 14px;
    }}
    .info-value {{
      color: #333;
      font-size: 14px;
      display: inline-block;
    }}
    .status-badge {{
      display: inline-block;
      background-color: #ecfdf5;
      color: {textColor};
      padding: 6px 14px;
      font-weight: bold;
      font-size: 13px;
      border: 1px solid #bbf7d0;
    }}
    .status-badge::before {{
      content: ""{badgePrefix} "";
    }}
    .action-section {{
      text-align: center;
      margin: 28px 0;
    }}
    .action-button {{
      display: inline-block;
      background: #69b42e;
      color: #ffffff;
      padding: 16px 36px;
      text-decoration: none;
      font-weight: bold;
      font-size: 15px;
      border: none;
    }}
    .action-button:hover {{
      background: #5a8c42;
    }}
    .divider {{
      height: 1px;
      background: #e0e0e0;
      margin: 28px 0;
    }}
    .metadata {{
      background-color: #f8f9fa;
      padding: 20px;
      margin-top: 24px;
      border-left: 3px solid #9d9d9c;
    }}
    .metadata-item {{
      font-size: 13px;
      color: #63666a;
      line-height: 1.5;
      margin-bottom: 12px;
    }}
    .metadata-item:last-child {{
      margin-bottom: 0;
    }}
    .metadata-item::before {{
      content: ""ℹ️ "";
    }}
    .email-footer {{
      background: #f8f9fa;
      padding: 28px 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }}
    .footer-logo {{
      font-size: 18px;
      font-weight: bold;
      color: #69b42e;
      margin-bottom: 8px;
      display: block;
    }}
    .footer-text {{
      color: #63666a;
      font-size: 13px;
      line-height: 1.7;
      margin-bottom: 12px;
    }}
    .footer-links {{
      margin: 16px 0;
    }}
    .footer-link {{
      color: #69b42e;
      text-decoration: none;
      font-weight: bold;
      padding: 0 8px;
    }}
    .footer-link:hover {{
      color: #5a8c42;
      text-decoration: underline;
    }}
    .footer-separator {{
      color: #e0e0e0;
      margin: 0 4px;
    }}
    .copyright {{
      font-size: 12px;
      color: #9ca3af;
      margin-top: 16px;
    }}
    @media (max-width: 600px) {{
      body {{ padding: 10px; }}
      .email-header {{
        padding: 24px 20px;
      }}
      .header-title {{
        font-size: 20px;
      }}
      .status-banner {{
        padding: 18px 20px;
      }}
      .email-body {{ padding: 28px 20px; }}
      .mission-card {{
        padding: 22px;
      }}
      .info-row {{
        display: block;
      }}
      .info-label {{
        min-width: auto;
        display: block;
        margin-bottom: 4px;
      }}
      .action-button {{
        display: block;
        text-align: center;
        padding: 14px 28px;
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
      }}
      .email-footer {{
        padding: 24px 20px;
      }}
    }}
  </style>
</head>
<body>
  <table class=""email-container"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
    <tr>
      <td class=""email-header"">
        <table class=""header-content"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
          <tr>
            <td width=""20%"" align=""left"" valign=""middle"">
              <div class=""logo-wrapper"">
                <img src=""{imageSrc}"" alt=""Logo"" width=""80"" height=""80"" style=""width: 80px; height: 80px; border: 0; display: block;"">
              </div>
            </td>
            <td width=""80%"" align=""center"" valign=""middle"">
              <h1 class=""header-title"">Gestion des Missions</h1>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class=""status-banner"">
        <table cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
          <tr>
            <td>
              <h2>{bannerTitle}</h2>
              <p>{bannerSubtitle}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class=""email-body"">
        <table cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
          <tr>
            <td class=""mission-card"">
              <h3 class=""mission-title"">{missionTitle}</h3>
              <div class=""info-row"">
                <span class=""info-label"">Validée par :</span>
                <span class=""info-value""><strong>{validatorName}</strong></span>
              </div>
              <div class=""info-row"">
                <span class=""info-label"">Date de validation :</span>
                <span class=""info-value"">{validatedDate}</span>
              </div>
              <div class=""info-row"">
                <span class=""info-label"">Statut :</span>
                <span class=""info-value"">
                  <span class=""status-badge"">{status}</span>
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td class=""action-section"">
              <a href=""{linkUrl}"" class=""action-button"">
                {buttonText}
              </a>
            </td>
          </tr>
          <tr>
            <td class=""divider""></td>
          </tr>
          <tr>
            <td class=""metadata"">
              <div class=""metadata-item"">
                Cet email a été envoyé automatiquement par le système de gestion des missions
              </div>
              <div class=""metadata-item"">
                Félicitations, votre mission a été validée !
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class=""email-footer"">
        <table cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
          <tr>
            <td align=""center"">
              <span class=""footer-logo"">Gestion des Missions</span>
              <p class=""footer-text"">
                Système de gestion et de suivi des missions
              </p>
              <div class=""footer-links"">
                <a href=""http://localhost:5183"" class=""footer-link"">Accéder à la plateforme</a>
                <span class=""footer-separator"">•</span>
                <a href=""http://localhost:5183/support"" class=""footer-link"">Aide et support</a>
              </div>
              <p class=""copyright"">
                © 2025 Gestion des Missions. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

        return (dynamicSubject, htmlMessage, plainTextMessage);
    }

    public (string subject, string html, string plainText) GetTreasurerTemplate(
        string missionTitle,
        string validatedBy,
        string validatedDate,
        string? amount = null,
        string status = "Validée - Prête pour paiement",
        string linkUrl = "",
        string? subject = null)
    {
        string dynamicSubject = subject ?? "Mission validée : Traitement financier requis";
        string bannerTitle = "Mission prête pour traitement financier";
        string bannerSubtitle = "Une mission validée attend votre action";
        string buttonText = "Traiter le paiement";
        string bannerColor = "#8b5cf6";
        string textColor = "#7c3aed";
        string badgePrefix = "💰";

        string imageSrc = _logoUrl;

        var amountInfo = !string.IsNullOrEmpty(amount) ? $"Montant : {amount}\n" : "";

        var plainTextMessage = $@"
GESTION DES MISSIONS
{bannerTitle}
{bannerSubtitle}
DÉTAILS DE LA VALIDATION
---------------------
Validée par : {validatedBy}
Date de validation : {validatedDate}
{amountInfo}Statut : {status}
Pour traiter le paiement, veuillez accéder à la plateforme :
{linkUrl}
---
Cet email a été envoyé automatiquement par le système de gestion des missions.
Une nouvelle mission est prête pour validation financière.
© 2025 Gestion des Missions. Tous droits réservés.
".Trim();

        var amountRow = !string.IsNullOrEmpty(amount) ? $@"
              <div class=""info-row"">
                <span class=""info-label"">Montant :</span>
                <span class=""info-value"">{amount}</span>
              </div>" : "";

        var htmlMessage = $@"<!DOCTYPE html>
<html lang=""fr"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>{dynamicSubject}</title>
  <style>
    :root {{
      --primary-color: #69b42e;
      --primary-dark: #5a8c42;
      --secondary-color: #f59e0b;
      --text-primary: #333;
      --text-secondary: #63666a;
      --bg-light: #f8f9fa;
      --border-light: #e0e0e0;
    }}
    * {{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }}
    body {{
      font-family: Arial, sans-serif;
      background-color: #f8f9fa;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }}
    table {{
      border-collapse: collapse;
    }}
    .email-container {{
      max-width: 650px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
    }}
    .email-header {{
      background: #ffffff;
      padding: 32px 30px;
      border-bottom: 3px solid #e0e0e0;
    }}
    .header-content {{
      width: 100%;
    }}
    .header-title {{
      color: #333;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      letter-spacing: -0.3px;
      margin: 0;
    }}
    .logo-wrapper {{
      background-color: #ffffff;
      padding: 4px;
      text-align: left;
    }}
    .status-banner {{
      background-color: #f5f3ff;
      border-left: 4px solid {bannerColor};
      padding: 22px 30px;
    }}
    .status-content h2 {{
      color: {textColor};
      font-size: 19px;
      font-weight: bold;
      margin-bottom: 6px;
      letter-spacing: -0.2px;
    }}
    .status-content p {{
      color: {textColor};
      font-size: 14px;
      opacity: 0.85;
      margin: 0;
    }}
    .email-body {{
      padding: 36px 30px;
    }}
    .mission-card {{
      border: 2px solid #e0e0e0;
      padding: 28px;
      margin-bottom: 28px;
    }}
    .mission-title {{
      color: #69b42e;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 22px;
      padding-bottom: 14px;
      border-bottom: 3px solid #69b42e;
    }}
    .mission-title::before {{
      content: ""💼 "";
    }}
    .info-row {{
      padding: 14px 0;
      border-bottom: 1px solid #f0f0f0;
    }}
    .info-row:last-child {{
      border-bottom: none;
    }}
    .info-label {{
      font-weight: bold;
      color: #63666a;
      display: inline-block;
      min-width: 170px;
      font-size: 14px;
    }}
    .info-value {{
      color: #333;
      font-size: 14px;
      display: inline-block;
    }}
    .status-badge {{
      display: inline-block;
      background-color: #f5f3ff;
      color: {textColor};
      padding: 6px 14px;
      font-weight: bold;
      font-size: 13px;
      border: 1px solid #ddd6fe;
    }}
    .status-badge::before {{
      content: ""{badgePrefix} "";
    }}
    .action-section {{
      text-align: center;
      margin: 28px 0;
    }}
    .action-button {{
      display: inline-block;
      background: #69b42e;
      color: #ffffff;
      padding: 16px 36px;
      text-decoration: none;
      font-weight: bold;
      font-size: 15px;
      border: none;
    }}
    .action-button:hover {{
      background: #5a8c42;
    }}
    .divider {{
      height: 1px;
      background: #e0e0e0;
      margin: 28px 0;
    }}
    .metadata {{
      background-color: #f8f9fa;
      padding: 20px;
      margin-top: 24px;
      border-left: 3px solid #9d9d9c;
    }}
    .metadata-item {{
      font-size: 13px;
      color: #63666a;
      line-height: 1.5;
      margin-bottom: 12px;
    }}
    .metadata-item:last-child {{
      margin-bottom: 0;
    }}
    .metadata-item::before {{
      content: ""ℹ️ "";
    }}
    .email-footer {{
      background: #f8f9fa;
      padding: 28px 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }}
    .footer-logo {{
      font-size: 18px;
      font-weight: bold;
      color: #69b42e;
      margin-bottom: 8px;
      display: block;
    }}
    .footer-text {{
      color: #63666a;
      font-size: 13px;
      line-height: 1.7;
      margin-bottom: 12px;
    }}
    .footer-links {{
      margin: 16px 0;
    }}
    .footer-link {{
      color: #69b42e;
      text-decoration: none;
      font-weight: bold;
      padding: 0 8px;
    }}
    .footer-link:hover {{
      color: #5a8c42;
      text-decoration: underline;
    }}
    .footer-separator {{
      color: #e0e0e0;
      margin: 0 4px;
    }}
    .copyright {{
      font-size: 12px;
      color: #9ca3af;
      margin-top: 16px;
    }}
    @media (max-width: 600px) {{
      body {{ padding: 10px; }}
      .email-header {{
        padding: 24px 20px;
      }}
      .header-title {{
        font-size: 20px;
      }}
      .status-banner {{
        padding: 18px 20px;
      }}
      .email-body {{ padding: 28px 20px; }}
      .mission-card {{
        padding: 22px;
      }}
      .info-row {{
        display: block;
      }}
      .info-label {{
        min-width: auto;
        display: block;
        margin-bottom: 4px;
      }}
      .action-button {{
        display: block;
        text-align: center;
        padding: 14px 28px;
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
      }}
      .email-footer {{
        padding: 24px 20px;
      }}
    }}
  </style>
</head>
<body>
  <table class=""email-container"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
    <tr>
      <td class=""email-header"">
        <table class=""header-content"" cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
          <tr>
            <td width=""20%"" align=""left"" valign=""middle"">
              <div class=""logo-wrapper"">
                <img src=""{imageSrc}"" alt=""Logo"" width=""80"" height=""80"" style=""width: 80px; height: 80px; border: 0; display: block;"">
              </div>
            </td>
            <td width=""80%"" align=""center"" valign=""middle"">
              <h1 class=""header-title"">Gestion des Missions</h1>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class=""status-banner"">
        <table cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
          <tr>
            <td>
              <h2>{bannerTitle}</h2>
              <p>{bannerSubtitle}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class=""email-body"">
        <table cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
          <tr>
            <td class=""mission-card"">
              <h3 class=""mission-title"">{missionTitle}</h3>
              <div class=""info-row"">
                <span class=""info-label"">Validée par :</span>
                <span class=""info-value""><strong>{validatedBy}</strong></span>
              </div>
              <div class=""info-row"">
                <span class=""info-label"">Date de validation :</span>
                <span class=""info-value"">{validatedDate}</span>
              </div>
              {amountRow}
              <div class=""info-row"">
                <span class=""info-label"">Statut :</span>
                <span class=""info-value"">
                  <span class=""status-badge"">{status}</span>
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td class=""action-section"">
              <a href=""{linkUrl}"" class=""action-button"">
                {buttonText}
              </a>
            </td>
          </tr>
          <tr>
            <td class=""divider""></td>
          </tr>
          <tr>
            <td class=""metadata"">
              <div class=""metadata-item"">
                Cet email a été envoyé automatiquement par le système de gestion des missions
              </div>
              <div class=""metadata-item"">
                Une nouvelle mission est prête pour validation financière
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class=""email-footer"">
        <table cellpadding=""0"" cellspacing=""0"" border=""0"" width=""100%"">
          <tr>
            <td align=""center"">
              <span class=""footer-logo"">Gestion des Missions</span>
              <p class=""footer-text"">
                Système de gestion et de suivi des missions
              </p>
              <div class=""footer-links"">
                <a href=""http://localhost:5183"" class=""footer-link"">Accéder à la plateforme</a>
                <span class=""footer-separator"">•</span>
                <a href=""http://localhost:5183/support"" class=""footer-link"">Aide et support</a>
              </div>
              <p class=""copyright"">
                © 2025 Gestion des Missions. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

        return (dynamicSubject, htmlMessage, plainTextMessage);
    }
}