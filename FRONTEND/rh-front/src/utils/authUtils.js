import { apiGet } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

let habilitationsCache = null;

export const hasHabilitation = async (habilitation) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.userId) {
      console.warn("No user data found in localStorage");
      return false;
    }

    if (habilitationsCache) {
      return habilitationsCache.some((hab) => hab.label === habilitation);
    }

    const response = await apiGet(
      `/api/User/${user.userId}/habilitations`,
      { accept: "application/json" } // Adjust headers as needed
    );

    if (!response || !Array.isArray(response)) {
      console.error("Invalid response from habilitations API");
      return false;
    }

    habilitationsCache = response;
    return response.some((hab) => hab.label === habilitation);
  } catch (error) {
    handleValidationError(error);
    console.error("Error fetching habilitations:", error);
    return false;
  }
};