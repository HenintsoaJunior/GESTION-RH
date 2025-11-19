using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using MyApp.Api.Entities.notifications;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Models.classes.notifications
{
    /// <summary>
    /// Classe utilitaire pour générer des templates HTML pour les notifications par email.
    /// Permet de centraliser et de rendre réutilisables les templates HTML complexes.
    /// </summary>
    public static class Template
    {
        private const string LogoPlaceholder = "{LOGO_SRC}";
        private const string BannerTitlePlaceholder = "{BANNER_TITLE}";
        private const string BannerSubtitlePlaceholder = "{BANNER_SUBTITLE}";
        private const string MissionTitlePlaceholder = "{MISSION_TITLE}";
        private const string CreatedByPlaceholder = "{CREATED_BY}";
        private const string RolePlaceholder = "{ROLE}";
        private const string CreatedDatePlaceholder = "{CREATED_DATE}";
        private const string StatusPlaceholder = "{STATUS}";
        private const string LinkUrlPlaceholder = "{LINK_URL}";
        private const string ButtonTextPlaceholder = "{BUTTON_TEXT}";
        private const string ActionTypePlaceholder = "{ACTION_TYPE}";
        private const string BannerColorPlaceholder = "{BANNER_COLOR}";
        private const string TextColorPlaceholder = "{TEXT_COLOR}";
        private const string BadgePrefixPlaceholder = "{BADGE_PREFIX}";

        /// <summary>
        /// Template HTML principal pour les notifications de mission.
        /// </summary>
        private static readonly string MissionNotificationTemplate = @"
<!DOCTYPE html>
<html lang=""fr"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>{DYNAMIC_SUBJECT}</title>
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
      border-left: 4px solid {BANNER_COLOR};
      padding: 22px 30px;
    }}
    .status-content h2 {{
      color: {TEXT_COLOR};
      font-size: 19px;
      font-weight: bold;
      margin-bottom: 6px;
      letter-spacing: -0.2px;
    }}
    .status-content p {{
      color: {TEXT_COLOR};
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
      color: {TEXT_COLOR};
      padding: 6px 14px;
      font-weight: bold;
      font-size: 13px;
      border: 1px solid #fde68a;
    }}
    .status-badge::before {{
      content: ""{BADGE_PREFIX} "";
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
                <img src=""{LOGO_SRC}"" alt=""Logo"" width=""80"" height=""80"" style=""width: 80px; height: 80px; border: 0; display: block;"">
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
              <h2>{BANNER_TITLE}</h2>
              <p>{BANNER_SUBTITLE}</p>
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
              <h3 class=""mission-title"">{MISSION_TITLE}</h3>
              <div class=""info-row"">
                <span class=""info-label"">Créée par :</span>
                <span class=""info-value""><strong>{CREATED_BY}</strong> ({ROLE})</span>
              </div>
              <div class=""info-row"">
                <span class=""info-label"">Date de création :</span>
                <span class=""info-value"">{CREATED_DATE}</span>
              </div>
              <div class=""info-row"">
                <span class=""info-label"">Statut :</span>
                <span class=""info-value"">
                  <span class=""status-badge"">{STATUS}</span>
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td class=""action-section"">
              <a href=""{LINK_URL}"" class=""action-button"">
                {BUTTON_TEXT}
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
                Vous recevez cette notification car vous êtes concerné par cette {ACTION_TYPE}
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

        /// <summary>
        /// Génère le template HTML pour une notification de mission.
        /// </summary>
        /// <param name="actionType">Type d'action (ex: "validation", "insertion").</param>
        /// <param name="createdBy">Nom de la personne qui a créé la mission.</param>
        /// <param name="role">Rôle de la personne.</param>
        /// <param name="createdDate">Date de création formatée.</param>
        /// <param name="status">Statut de la mission.</param>
        /// <param name="linkUrl">URL du lien d'action.</param>
        /// <param name="subject">Sujet optionnel (sinon généré dynamiquement).</param>
        /// <param name="logoSrc">Source du logo (base64 ou URL).</param>
        /// <returns>Le HTML généré.</returns>
        public static string GenerateMissionNotificationHtml(
            string actionType,
            string createdBy,
            string role,
            string createdDate,
            string status,
            string linkUrl,
            string? subject = null,
            string logoSrc = "")
        {
            var dynamicSubject = subject ?? GetDefaultSubject(actionType);
            var bannerTitle = GetBannerTitle(actionType);
            var bannerSubtitle = GetBannerSubtitle(actionType);
            var missionTitle = GetMissionTitle(actionType);
            var buttonText = GetButtonText(actionType);
            var bannerColor = GetBannerColor(actionType);
            var textColor = GetTextColor(actionType);
            var badgePrefix = GetBadgePrefix(actionType);

            var html = MissionNotificationTemplate
                .Replace("{DYNAMIC_SUBJECT}", dynamicSubject)
                .Replace(LogoPlaceholder, logoSrc)
                .Replace(BannerTitlePlaceholder, bannerTitle)
                .Replace(BannerSubtitlePlaceholder, bannerSubtitle)
                .Replace(MissionTitlePlaceholder, missionTitle)
                .Replace(CreatedByPlaceholder, createdBy)
                .Replace(RolePlaceholder, role)
                .Replace(CreatedDatePlaceholder, createdDate)
                .Replace(StatusPlaceholder, status)
                .Replace(LinkUrlPlaceholder, linkUrl)
                .Replace(ButtonTextPlaceholder, buttonText)
                .Replace(ActionTypePlaceholder, actionType.ToLowerInvariant())
                .Replace(BannerColorPlaceholder, bannerColor)
                .Replace(TextColorPlaceholder, textColor)
                .Replace(BadgePrefixPlaceholder, badgePrefix);

            return html;
        }

        /// <summary>
        /// Génère le texte brut (plain text) correspondant au template HTML.
        /// </summary>
        /// <param name="actionType">Type d'action.</param>
        /// <param name="createdBy">Créateur.</param>
        /// <param name="createdDate">Date de création.</param>
        /// <param name="status">Statut.</param>
        /// <param name="linkUrl">URL du lien.</param>
        /// <param name="buttonText">Texte du bouton.</param>
        /// <returns>Le message en texte brut.</returns>
        public static string GenerateMissionPlainText(
            string actionType,
            string createdBy,
            string createdDate,
            string status,
            string linkUrl,
            string buttonText)
        {
            var bannerTitle = GetBannerTitle(actionType);
            var bannerSubtitle = GetBannerSubtitle(actionType);

            return $@"
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
Vous recevez cette notification car vous êtes concerné par cette {actionType.ToLowerInvariant()}.
© 2025 Gestion des Missions. Tous droits réservés.
".Trim();
        }

        /// <summary>
        /// Template HTML pour les rappels de notifications.
        /// </summary>
        private static readonly string ReminderNotificationTemplate = @"
<!DOCTYPE html>
<html lang=""fr"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{DYNAMIC_SUBJECT}</title>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 20px; border: 1px solid #e0e0e0; }}
        .header {{ background: #69b42e; color: white; padding: 15px; text-align: center; }}
        .content {{ padding: 20px; }}
        .footer {{ text-align: center; padding: 10px; color: #63666a; font-size: 12px; }}
        .button {{ display: inline-block; background: #69b42e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
        .info-row {{ padding: 10px 0; border-bottom: 1px solid #f0f0f0; }}
        .info-label {{ font-weight: bold; color: #63666a; display: inline-block; min-width: 120px; }}
        .info-value {{ color: #333; display: inline-block; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h2>{BANNER_TITLE}</h2>
        </div>
        <div class=""content"">
            <p>Bonjour {USER_NAME},</p>
            <p>Vous avez une notification non consultée depuis {DAYS_AGO} jour(s) :</p>
            <h3>{NOTIFICATION_TITLE}</h3>
            <p>{NOTIFICATION_MESSAGE}</p>
            <div class=""info-row"">
                <span class=""info-label"">Type :</span>
                <span class=""info-value"">{NOTIFICATION_TYPE}</span>
            </div>
            <div class=""info-row"">
                <span class=""info-label"">Priorité :</span>
                <span class=""info-value"">{NOTIFICATION_PRIORITY}</span>
            </div>
            {RELATED_MENU_HTML}
            {RELATED_ID_HTML}
            <p>Merci de consulter cette notification pour rester à jour.</p>
            <a href=""{LINK_URL}"" class=""button"">Consulter maintenant</a>
        </div>
        <div class=""footer"">
            © 2025 Gestion des Missions. Tous droits réservés.
        </div>
    </div>
</body>
</html>";

        /// <summary>
        /// Génère le template HTML pour un rappel de notification.
        /// </summary>
        /// <param name="notification">La notification à rappeler.</param>
        /// <param name="user">L'utilisateur destinataire.</param>
        /// <param name="cutoffDate">Date de seuil pour le calcul des jours.</param>
        /// <returns>Le HTML généré.</returns>
        public static string GenerateReminderNotificationHtml(Notifications notification, User user, DateTime cutoffDate)
        {
            var daysAgo = (DateTime.UtcNow - cutoffDate).Days;
            var userName = user.Name ?? "Utilisateur";
            var dynamicSubject = $"Rappel : {notification.Title}";
            var bannerTitle = "Rappel : Notification en attente";
            var linkUrl = GenerateNotificationLink(notification.RelatedMenu, notification.RelatedId);
            var relatedMenuHtml = !string.IsNullOrWhiteSpace(notification.RelatedMenu) 
                ? $"<div class=\"info-row\"><span class=\"info-label\">Menu lié :</span><span class=\"info-value\">{notification.RelatedMenu}</span></div>" 
                : "";
            var relatedIdHtml = !string.IsNullOrWhiteSpace(notification.RelatedId) 
                ? $"<div class=\"info-row\"><span class=\"info-label\">ID lié :</span><span class=\"info-value\">{notification.RelatedId}</span></div>" 
                : "";

            var html = ReminderNotificationTemplate
                .Replace("{DYNAMIC_SUBJECT}", dynamicSubject)
                .Replace("{BANNER_TITLE}", bannerTitle)
                .Replace("{USER_NAME}", userName)
                .Replace("{DAYS_AGO}", daysAgo.ToString())
                .Replace("{NOTIFICATION_TITLE}", notification.Title)
                .Replace("{NOTIFICATION_MESSAGE}", notification.Message)
                .Replace("{NOTIFICATION_TYPE}", notification.Type)
                .Replace("{NOTIFICATION_PRIORITY}", notification.Priority.ToString())
                .Replace("{RELATED_MENU_HTML}", relatedMenuHtml)
                .Replace("{RELATED_ID_HTML}", relatedIdHtml)
                .Replace("{LINK_URL}", linkUrl);

            return html;
        }

        /// <summary>
        /// Génère le texte brut pour un rappel de notification.
        /// </summary>
        /// <param name="notification">La notification à rappeler.</param>
        /// <param name="user">L'utilisateur destinataire.</param>
        /// <param name="cutoffDate">Date de seuil pour le calcul des jours.</param>
        /// <returns>Le message en texte brut.</returns>
        public static string GenerateReminderPlainText(Notifications notification, User user, DateTime cutoffDate)
        {
            var daysAgo = (DateTime.UtcNow - cutoffDate).Days;
            var userName = user.Name ?? "Utilisateur";
            var linkUrl = GenerateNotificationLink(notification.RelatedMenu, notification.RelatedId);

            var relatedMenuText = !string.IsNullOrWhiteSpace(notification.RelatedMenu) ? $"\nMenu lié : {notification.RelatedMenu}" : "";
            var relatedIdText = !string.IsNullOrWhiteSpace(notification.RelatedId) ? $"\nID lié : {notification.RelatedId}" : "";

            return $@"
Rappel : Notification en attente

Bonjour {userName},

Vous avez une notification non consultée depuis {daysAgo} jour(s) :

{notification.Title}

{notification.Message}

Type : {notification.Type}
Priorité : {notification.Priority}{relatedMenuText}{relatedIdText}

Merci de consulter cette notification pour rester à jour.

{linkUrl}

© 2025 Gestion des Missions. Tous droits réservés.
".Trim();
        }

        // Méthodes privées pour les valeurs dynamiques (extraites de EmailSender)
        private static string GetDefaultSubject(string actionType)
        {
            return actionType.ToLowerInvariant() switch
            {
                "validation" => "Mission en attente de validation",
                "insertion" => "Nouvelle mission insérée",
                _ => $"Notification de mission - {actionType}"
            };
        }

        private static string GetBannerTitle(string actionType)
        {
            return actionType.ToLowerInvariant() switch
            {
                "validation" => "Nouvelle mission en attente de validation",
                "insertion" => "Nouvelle mission insérée",
                _ => $"Mission {actionType.ToLowerInvariant()}"
            };
        }

        private static string GetBannerSubtitle(string actionType)
        {
            return actionType.ToLowerInvariant() switch
            {
                "validation" => "Une action de votre part est requise",
                "insertion" => "Une nouvelle mission a été ajoutée au système",
                _ => $"Une mise à jour liée à {actionType.ToLowerInvariant()} est disponible"
            };
        }

        private static string GetMissionTitle(string actionType)
        {
            return actionType.ToLowerInvariant() switch
            {
                "validation" => "Détails de la Mission",
                "insertion" => "Détails de la Nouvelle Mission",
                _ => "Détails de la Mission"
            };
        }

        private static string GetButtonText(string actionType)
        {
            return actionType.ToLowerInvariant() switch
            {
                "validation" => "Consulter et Valider la Mission",
                "insertion" => "Consulter la Mission",
                _ => $"Voir les Détails ({actionType})"
            };
        }

        private static string GetBannerColor(string actionType)
        {
            return actionType.ToLowerInvariant() switch
            {
                "validation" => "#f59e0b",
                "insertion" => "#10b981",
                _ => "#f59e0b"
            };
        }

        private static string GetTextColor(string actionType)
        {
            return actionType.ToLowerInvariant() switch
            {
                "validation" => "#92400e",
                "insertion" => "#047857",
                _ => "#92400e"
            };
        }

        private static string GetBadgePrefix(string actionType)
        {
            return actionType.ToLowerInvariant() switch
            {
                "validation" => "⏱",
                "insertion" => "➕",
                _ => "📌"
            };
        }

        private static string GenerateNotificationLink(string? relatedMenu, string? relatedId)
        {
            return $"http://localhost:5183/notifications?menu={System.Web.HttpUtility.UrlEncode(relatedMenu ?? "")}&id={System.Web.HttpUtility.UrlEncode(relatedId ?? "")}";
        }
    }
}