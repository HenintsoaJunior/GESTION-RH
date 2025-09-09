"use client";

// Import de l'URL de base de l'API depuis la configuration
import { BASE_URL } from 'config/apiConfig';

// Définition des headers par défaut pour les requêtes HTTP
const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/**
 * Fonction pour récupérer le token depuis localStorage
 */
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token ? JSON.parse(token).accessToken : null;
};

/**
 * Fonction centrale de gestion des réponses HTTP.
 * - Gère les erreurs HTTP (status non-OK)
 * - Tente de parser le corps de la réponse en JSON pour extraire le message d'erreur
 * - Redirige vers "/login" en cas d'erreur d'autorisation (401 ou 403)
 * - Retourne le contenu selon le type de réponse attendu (json ou blob)
 */
const handleResponse = async (response, responseType = 'json') => {
  if (!response.ok) {
    // Gestion des erreurs d'autorisation
    if (response.status === 401 || response.status === 403) {
      // Supprimer les données stockées en cas d'erreur d'autorisation
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // Rediriger vers la page de connexion
      window.location.href = "/login";
      throw new Error("Accès non autorisé. Redirection vers la page de connexion.");
    }

    // Construction du message d'erreur par défaut
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorData = null;

    try {
      // Lecture du corps de la réponse en texte
      const errorText = await response.text();
      if (errorText) {
        try {
          // Tente de parser le texte en JSON
          errorData = JSON.parse(errorText);
          // Utilise le message d'erreur du JSON si disponible
          errorMessage = errorData.message || errorData.error || errorText;
        } catch {
          // Si le parsing échoue, utilise le texte brut
          errorMessage = errorText;
        }
      }
    } catch (e) {
      // Affiche un avertissement si le corps ne peut pas être lu
      console.warn('Could not read error response body:', e);
    }

    // Création et enrichissement de l'objet Error
    const error = new Error(errorMessage);
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data: errorData || { message: errorMessage },
    };
    throw error; // Propagation de l'erreur
  }

  // Retourne le contenu selon le type demandé
  if (responseType === 'blob') {
    return response.blob();
  }
  return response.json();
};

/**
 * Fonction générique pour effectuer une requête HTTP.
 * - Construit l'URL avec les paramètres de requête
 * - Fusionne les headers par défaut, ajoute le token Bearer, et inclut les headers personnalisés
 * - Sérialise le corps en JSON si présent
 * - Utilise fetch pour envoyer la requête
 * - Gère la réponse via handleResponse
 */
const apiRequest = async ({ endpoint, method = 'GET', body = null, headers = {}, queryParams = {}, responseType = 'json' }) => {
  try {
    // Construction de l'URL complète avec paramètres de requête
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    // Récupération du token Bearer
    const accessToken = getAuthToken();
    const authHeader = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

    // Fusion des headers
    const requestHeaders = { ...defaultHeaders, ...authHeader, ...headers };

    // Préparation des options pour fetch
    const options = {
      method,
      headers: requestHeaders,
    };

    // Ajout du corps si présent (pour POST/PUT)
    if (body) {
      options.body = JSON.stringify(body);
    }

    // Envoi de la requête et gestion de la réponse
    const response = await fetch(url.toString(), options);
    return await handleResponse(response, responseType);
  } catch (error) {
    // Ajout d'informations sur l'erreur brute
    error.response = error.response || {};
    error.response.rawResponse = error.response.rawResponse || error;
    throw error;
  }
};

// Fonctions utilitaires pour chaque méthode HTTP
export const apiGet = (endpoint, queryParams = {}, headers = {}) =>
  apiRequest({ endpoint, method: 'GET', queryParams, headers });

export const apiPost = (endpoint, body = null, queryParams = {}, headers = {}, responseType = 'json') =>
  apiRequest({ endpoint, method: 'POST', body, queryParams, headers, responseType });

export const apiPut = (endpoint, body = null, queryParams = {}, headers = {}, responseType = 'json') =>
  apiRequest({ endpoint, method: 'PUT', body, queryParams, headers, responseType });

export const apiDelete = (endpoint, queryParams = {}, headers = {}, responseType = 'json') =>
  apiRequest({ endpoint, method: 'DELETE', queryParams, headers, responseType });