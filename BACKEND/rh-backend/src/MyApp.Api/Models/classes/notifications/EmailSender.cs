using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web;

namespace MyApp.Api.Models.classes.notifications;

public class EmailSender : IDisposable
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _apiUrl;
    private readonly string _logoUrl;
    private readonly string _replyTo;
    private readonly string _fromEmail;
    private readonly IConfiguration _configuration;
    private readonly TemplateEmail _templateEmail;

    public EmailSender(IConfiguration configuration)
    {
        _configuration = configuration;
        _apiKey = _configuration.GetSection("EmailSettings:ApiKey").Value ?? string.Empty;
        _apiUrl = _configuration.GetSection("EmailSettings:ApiUrl").Value ?? string.Empty;
        _logoUrl = _configuration.GetSection("EmailSettings:LogoUrl").Value ?? string.Empty;
        _replyTo = _configuration.GetSection("EmailSettings:ReplyTo").Value ?? string.Empty;
        _fromEmail = _configuration.GetSection("EmailSettings:FromEmail").Value ?? string.Empty;

        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);

        _templateEmail = new TemplateEmail(_logoUrl);
    }
    public async Task SendValidatorNotificationEmailAsync(
        string actionType,
        string createdBy,
        string role,
        string createdDate,
        string status,
        string toEmail,
        string linkUrl,
        string? subject = null)
    {
        var (dynamicSubject, htmlMessage, plainTextMessage) = _templateEmail.GetValidatorTemplate(
            actionType, createdBy, role, createdDate, status, linkUrl, subject);

        await SendEmailAsync(dynamicSubject, htmlMessage, plainTextMessage, toEmail);
    }


    public async Task SendCollaboratorValidatedEmailAsync(
        string missionTitle,
        string validatorName,
        string validatedDate,
        string status,
        string toEmail,
        string linkUrl,
        string? subject = null)
    {
        var (dynamicSubject, htmlMessage, plainTextMessage) = _templateEmail.GetCollaboratorValidatedTemplate(
            missionTitle, validatorName, validatedDate, status, linkUrl, subject);

        await SendEmailAsync(dynamicSubject, htmlMessage, plainTextMessage, toEmail);
    }


    public async Task SendTreasurerNotificationEmailAsync(
        string missionTitle,
        string validatedBy,
        string validatedDate,
        string toEmail,
        string linkUrl,
        string? amount = null,
        string status = "Validée - Prête pour paiement",
        string? subject = null)
    {
        var (dynamicSubject, htmlMessage, plainTextMessage) = _templateEmail.GetTreasurerTemplate(
            missionTitle: missionTitle,
            validatedBy: validatedBy,
            validatedDate: validatedDate,
            amount: amount,
            status: status,
            linkUrl: linkUrl,
            subject: subject);

        await SendEmailAsync(dynamicSubject, htmlMessage, plainTextMessage, toEmail);
    }


    private async Task SendEmailAsync(string subject, string htmlMessage, string plainTextMessage, string toEmail)
    {
        string imageSrc = _logoUrl;
        try
        {
            var imageResponse = await _httpClient.GetAsync(_logoUrl);
            imageResponse.EnsureSuccessStatusCode();
            var imageBytes = await imageResponse.Content.ReadAsByteArrayAsync();
            var base64Image = Convert.ToBase64String(imageBytes);
            imageSrc = $"data:image/jpeg;base64,{base64Image}";
            Console.WriteLine("Image converted to base64 successfully");

            htmlMessage = htmlMessage.Replace(_logoUrl, imageSrc);
        }
        catch (Exception error)
        {
            Console.WriteLine($"Unable to convert image to base64, using URL: {error.Message}");
        }

        var requestBody = new Dictionary<string, object>
        {
            ["from"] = _fromEmail,
            ["to"] = toEmail,
            ["subject"] = subject,
            ["message"] = htmlMessage,
            ["text"] = plainTextMessage,
            ["reply_to"] = _replyTo,
            ["h:Precedence"] = "bulk",
            ["h:Importance"] = "Normal",
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync(_apiUrl, content);
            if (!response.IsSuccessStatusCode)
            {
                var errorData = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(errorData);
                var error = doc.RootElement.TryGetProperty("error", out var errorProp) ? errorProp.GetString() : response.ReasonPhrase;
                throw new Exception($"API Error: {error}");
            }

            var data = await response.Content.ReadAsStringAsync();
            Console.WriteLine("✅ Email sent successfully! " + data);
        }
        catch (Exception err)
        {
            Console.WriteLine($"❌ Error sending email: {err.Message}");
            throw;
        }
    }

    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}