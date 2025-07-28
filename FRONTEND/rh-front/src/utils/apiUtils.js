"use client";

import { BASE_URL } from 'config/apiConfig';

// Default headers
const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// Centralized error handling
const handleResponse = async (response, responseType = 'json') => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorData = null;

    try {
      const errorText = await response.text();
      if (errorText) {
        try {
          errorData = JSON.parse(errorText); // Parse JSON if available
          errorMessage = errorData.message || errorData.error || errorText;
        } catch {
          errorMessage = errorText; // Fallback to raw text if not JSON
        }
      }
    } catch (e) {
      console.warn('Could not read error response body:', e);
    }

    const error = new Error(errorMessage);
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data: errorData || { message: errorMessage },
    };
    throw error;
  }

  // Return response based on responseType
  if (responseType === 'blob') {
    return response.blob();
  }
  return response.json();
};

// Generic HTTP request function
const apiRequest = async ({ endpoint, method = 'GET', body = null, headers = {}, queryParams = {}, responseType = 'json' }) => {
  try {
    // Construct URL with query parameters
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    // Merge default headers with custom headers
    const requestHeaders = { ...defaultHeaders, ...headers };

    // Prepare fetch options
    const options = {
      method,
      headers: requestHeaders,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), options);
    return await handleResponse(response, responseType);
  } catch (error) {
    error.response = error.response || {};
    error.response.rawResponse = error.response.rawResponse || error;
    throw error;
  }
};

// HTTP method wrappers
export const apiGet = (endpoint, queryParams = {}, headers = {}) =>
  apiRequest({ endpoint, method: 'GET', queryParams, headers });

export const apiPost = (endpoint, body = null, queryParams = {}, headers = {}, responseType = 'json') =>
  apiRequest({ endpoint, method: 'POST', body, queryParams, headers, responseType });

export const apiPut = (endpoint, body = null, queryParams = {}, headers = {}, responseType = 'json') =>
  apiRequest({ endpoint, method: 'PUT', body, queryParams, headers, responseType });

export const apiDelete = (endpoint, queryParams = {}, headers = {}, responseType = 'json') =>
  apiRequest({ endpoint, method: 'DELETE', queryParams, headers, responseType });