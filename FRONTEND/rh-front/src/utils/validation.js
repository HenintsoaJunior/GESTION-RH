"use client";

export const handleValidationError = (error, defaultMessage = "Une erreur est survenue") => {
  // Avoid logging the entire error object to prevent circular structure issues
  console.log("Erreur reçue :", {
    message: error?.message,
    responseData: error?.response?.data,
  });

  // Try to parse error.message if it's a JSON string
  let parsedError = null;
  if (error?.message && typeof error.message === "string") {
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      console.log("Erreur lors du parsing de error.message :", e);
    }
  }

  // Handle validation errors
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
      fieldErrors: errors,
    };
  }

  // Handle HTTP errors without validation details
  if (error?.response?.data?.title || parsedError?.title) {
    return {
      isOpen: true,
      type: "error",
      message: error?.response?.data?.title || parsedError?.title || defaultMessage,
      fieldErrors: {},
    };
  }

  // Handle non-HTTP errors
  return {
    isOpen: true,
    type: "error",
    message: error?.message || defaultMessage,
    fieldErrors: {},
  };
};