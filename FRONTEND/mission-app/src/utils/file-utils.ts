interface ModalContent {
  fileUrl?: string;
  fileName?: string;
  extension?: string;
  isBlobUrl?: boolean;
  error?: string;
}

export const handleFileView = async (
  fileContent: string | Uint8Array | ArrayBuffer,
  fileName: string,
  setModalContent: (content: ModalContent | null) => void,
  setModalOpen: (open: boolean) => void,
  fileType?: string
): Promise<void> => {
  try {
    if (!fileContent) {
      throw new Error("Aucun contenu de fichier fourni.");
    }

    // Convert fileContent to Uint8Array if necessary
    let binaryContent: Uint8Array;
    if (typeof fileContent === "string") {
      try {
        const decoded = atob(fileContent);
        binaryContent = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) {
          binaryContent[i] = decoded.charCodeAt(i);
        }
      } catch {
        throw new Error("Le contenu du fichier semble être une chaîne base64 invalide.");
      }
    } else if (!(fileContent instanceof Uint8Array || fileContent instanceof ArrayBuffer)) {
      throw new Error("Le contenu du fichier est invalide ou dans un format non supporté.");
    } else if (fileContent instanceof ArrayBuffer) {
      binaryContent = new Uint8Array(fileContent);
    } else {
      binaryContent = fileContent;
    }

    // Copy to ensure ArrayBuffer (avoid SharedArrayBuffer type issues)
    const newBuffer = new ArrayBuffer(binaryContent.length);
    const safeBinaryContent = new Uint8Array(newBuffer);
    safeBinaryContent.set(binaryContent);

    // Convert binary content to base64
    let base64String: string;
    try {
      base64String = btoa(
        safeBinaryContent.reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
    } catch (e) {
      throw new Error("Erreur lors de la conversion en base64: " + (e as Error).message);
    }

    // Determine MIME type
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
    };
    const extension = fileName?.split(".").pop()?.toLowerCase() || "";
    const mimeType = fileType || mimeTypes[extension] || "application/octet-stream";

    // Create data URL or Blob URL for PDF
    let fileUrl: string;
    if (extension === "pdf") {
      const blob = new Blob([safeBinaryContent], { type: "application/pdf" });
      fileUrl = window.URL.createObjectURL(blob);
    } else {
      fileUrl = `data:${mimeType};base64,${base64String}`;
    }

    // Check if the file type is previewable
    const previewableTypes: string[] = ["pdf", "jpg", "jpeg", "png", "gif"];
    if (previewableTypes.includes(extension)) {
      setModalContent({ fileUrl, fileName, extension, isBlobUrl: extension === "pdf" });
      setModalOpen(true);
    } else {
      setModalContent({
        error: "Ce type de fichier ne peut pas être prévisualisé. Veuillez le télécharger.",
      });
      setModalOpen(true);
      handleFileDownload(safeBinaryContent, fileName);
    }
  } catch (error) {
    console.error("Erreur lors de l'accès au fichier:", error);
    setModalContent({ error: `Impossible d'accéder au fichier: ${(error as Error).message}` });
    setModalOpen(true);
  }
};

export const handleFileDownload = async (
  fileContent: string | Uint8Array | ArrayBuffer,
  fileName: string
): Promise<void> => {
  try {
    if (!fileContent) {
      throw new Error("Aucun contenu de fichier fourni.");
    }

    // Convert fileContent to Uint8Array if necessary
    let binaryContent: Uint8Array;
    if (typeof fileContent === "string") {
      try {
        const decoded = atob(fileContent);
        binaryContent = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) {
          binaryContent[i] = decoded.charCodeAt(i);
        }
      } catch {
        throw new Error("Le contenu du fichier semble être une chaîne base64 invalide.");
      }
    } else if (!(fileContent instanceof Uint8Array || fileContent instanceof ArrayBuffer)) {
      throw new Error("Le contenu du fichier est invalide ou dans un format non supporté.");
    } else if (fileContent instanceof ArrayBuffer) {
      binaryContent = new Uint8Array(fileContent);
    } else {
      binaryContent = fileContent;
    }

    // Copy to ensure ArrayBuffer (avoid SharedArrayBuffer type issues)
    const newBuffer = new ArrayBuffer(binaryContent.length);
    const safeBinaryContent = new Uint8Array(newBuffer);
    safeBinaryContent.set(binaryContent);

    // Convert binary content to Blob
    const blob = new Blob([safeBinaryContent], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erreur de téléchargement:", error);
    alert(`Erreur lors du téléchargement: ${(error as Error).message}`);
  }
};