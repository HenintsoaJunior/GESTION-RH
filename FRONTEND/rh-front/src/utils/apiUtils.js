import { BASE_URL } from "config/apiConfig";

// Default headers
const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  // Add Authorization header here when needed, e.g.:
  // Authorization: `Bearer ${getAuthToken()}`,
};

// Centralized error handling
const handleResponse = async (response) => {
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
      console.warn("Could not read error response body:", e);
    }

    // Create a new Error with the response attached
    const error = new Error(errorMessage);
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data: errorData || { message: errorMessage }, // Attach parsed data or fallback
    };
    throw error;
  }
  return response.json();
};

// Generic HTTP request function
const apiRequest = async ({ endpoint, method = "GET", body = null, headers = {}, queryParams = {} }) => {
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
    return await handleResponse(response);
  } catch (error) {
    throw error; // Rethrow for specific handling in calling functions
  }
};

// HTTP method wrappers
export const apiGet = (endpoint, queryParams = {}, headers = {}) =>
  apiRequest({ endpoint, method: "GET", queryParams, headers });

export const apiPost = (endpoint, body = null, queryParams = {}, headers = {}) =>
  apiRequest({ endpoint, method: "POST", body, queryParams, headers });

// Add this to the existing apiUtils.js file, after apiPost
export const apiPut = (endpoint, body = null, queryParams = {}, headers = {}) =>
  apiRequest({ endpoint, method: "PUT", body, queryParams, headers });