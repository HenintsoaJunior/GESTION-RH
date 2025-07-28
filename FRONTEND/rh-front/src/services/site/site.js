"use client";

import { apiGet } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

export const fetchSites = async (setSites, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, sites: true }));

    const data = await apiGet("/api/Site");

    setSites(data);
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        site: data.map((site) => site.siteName),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des sites:", error);
    onError(handleValidationError(error, "Erreur lors du chargement des sites"));
  } finally {
    setIsLoading((prev) => ({ ...prev, sites: false }));
  }
};

export const getSiteId = (siteName, sites) =>
  sites.find((site) => site.siteName === siteName)?.siteId || "";