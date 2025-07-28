"use client";

export const handleValidationError = (error, defaultMessage = "Une erreur est survenue") => {
  console.log("Erreur reçue :", JSON.stringify(error, null, 2));
  console.log("error.message :", error?.message);

  // Essayer de parser error.message si c'est une chaîne JSON
  let parsedError = null;
  if (error?.message) {
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      console.log("Erreur lors du parsing de error.message :", e);
    }
  }

  // Gestion des erreurs de validation
  if (error?.response?.data?.errors || parsedError?.errors) {
    const errors = error?.response?.data?.errors || parsedError?.errors;
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => {
        const messageText = Array.isArray(messages) ? messages.join(", ") : messages;
        return `${field}: ${messageText}`;
      })
      .join("; ");
    
    return {
      isOpen: true,
      type: "error",
      message: `Erreur de validation: ${errorMessages}`,
      fieldErrors: errors, // Inclure les erreurs par champ
    };
  }

  // Gestion des erreurs HTTP sans errors
  if (error?.response?.data?.title || parsedError?.title) {
    return {
      isOpen: true,
      type: "error",
      message: error?.response?.data?.title || parsedError?.title || defaultMessage,
      fieldErrors: {}, // Retourner un objet vide pour fieldErrors
    };
  }

  // Gestion des erreurs non-HTTP
  return {
    isOpen: true,
    type: "error",
    message: error?.message || defaultMessage,
    fieldErrors: {}, // Retourner un objet vide pour fieldErrors
  };
};