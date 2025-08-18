"use client";
import { apiGet } from "utils/apiUtils";

export const fetchServices = async (setServices, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, services: true }));
    const data = await apiGet("/api/Service");
    setServices(data);
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        service: data.map((service) => service.serviceName),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des services:", error);
    onError({ 
      isOpen: true, 
      type: "error", 
      message: `Erreur lors du chargement des services: ${error.message}` 
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, services: false }));
  }
};

export const getServiceId = (serviceName, services) =>
  services.find((service) => service.serviceName === serviceName)?.serviceId || "";