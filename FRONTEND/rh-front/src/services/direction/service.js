"use client";

import { BASE_URL } from "config/apiConfig";

export const fetchServices = async (setServices, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, services: true }));
    const response = await fetch(`${BASE_URL}/api/Service`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des services: ${response.statusText}`);
    }

    const data = await response.json();
    setServices(data);
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        service: data.map((service) => service.serviceName),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des services:", error);
    onError({ isOpen: true, type: "error", message: `Erreur lors du chargement des services: ${error.message}` });
  } finally {
    setIsLoading((prev) => ({ ...prev, services: false }));
  }
};

export const getServiceId = (serviceName, services) =>
  services.find((service) => service.serviceName === serviceName)?.serviceId || "";