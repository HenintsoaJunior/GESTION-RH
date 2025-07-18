"use client";

import { BASE_URL } from "config/apiConfig";

export const fetchSites = async (setSites, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, sites: true }));
    const response = await fetch(`${BASE_URL}/api/Site`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des sites: ${response.statusText}`);
    }

    const data = await response.json();
    setSites(data);
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        site: data.map((site) => site.siteName),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des sites:", error);
    onError({ isOpen: true, type: "error", message: `Erreur lors du chargement des sites: ${error.message}` });
  } finally {
    setIsLoading((prev) => ({ ...prev, sites: false }));
  }
};

export const getSiteId = (siteName, sites) =>
  sites.find((site) => site.siteName === siteName)?.siteId || "";