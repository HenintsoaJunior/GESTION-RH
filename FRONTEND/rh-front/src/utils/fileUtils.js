export const handleFileView = async (fileContent, fileName, fileType, setModalContent, setModalOpen) => {
    try {
        if (!fileContent) {
            throw new Error("Aucun contenu de fichier fourni.");
        }

        // Convert fileContent to Uint8Array if necessary
        let binaryContent = fileContent;
        if (typeof fileContent === "string") {
            try {
                const decoded = atob(fileContent);
                binaryContent = new Uint8Array(decoded.length);
                for (let i = 0; i < decoded.length; i++) {
                    binaryContent[i] = decoded.charCodeAt(i);
                }
            } catch (e) {
                throw new Error("Le contenu du fichier semble être une chaîne base64 invalide.");
            }
        } else if (!(fileContent instanceof Uint8Array || fileContent instanceof ArrayBuffer)) {
            throw new Error("Le contenu du fichier est invalide ou dans un format non supporté.");
        }

        // Convert to Uint8Array if ArrayBuffer
        if (binaryContent instanceof ArrayBuffer) {
            binaryContent = new Uint8Array(binaryContent);
        }

        // Convert binary content to base64
        let base64String;
        try {
            base64String = btoa(
                binaryContent.reduce((data, byte) => data + String.fromCharCode(byte), "")
            );
        } catch (e) {
            throw new Error("Erreur lors de la conversion en base64: " + e.message);
        }

        // Determine MIME type
        const mimeTypes = {
            pdf: "application/pdf",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            gif: "image/gif",
        };
        const extension = fileName?.split(".").pop()?.toLowerCase() || "";
        const mimeType = fileType || mimeTypes[extension] || "application/octet-stream";

        // Create data URL or Blob URL for PDF
        let fileUrl;
        if (extension === "pdf") {
            const blob = new Blob([binaryContent], { type: "application/pdf" });
            fileUrl = window.URL.createObjectURL(blob);
        } else {
            fileUrl = `data:${mimeType};base64,${base64String}`;
        }

        // Check if the file type is previewable
        const previewableTypes = ["pdf", "jpg", "jpeg", "png", "gif"];
        if (previewableTypes.includes(extension)) {
            setModalContent({ fileUrl, fileName, extension, isBlobUrl: extension === "pdf" });
            setModalOpen(true);
        } else {
            setModalContent({
                error: "Ce type de fichier ne peut pas être prévisualisé. Veuillez le télécharger.",
            });
            setModalOpen(true);
            handleFileDownload(binaryContent, fileName);
        }
    } catch (error) {
        console.error("Erreur lors de l'accès au fichier:", error);
        setModalContent({ error: `Impossible d'accéder au fichier: ${error.message}` });
        setModalOpen(true);
    }
};

export const handleFileDownload = async (fileContent, fileName) => {
    try {
        if (!fileContent) {
            throw new Error("Aucun contenu de fichier fourni.");
        }

        // Convert fileContent to Uint8Array if necessary
        let binaryContent = fileContent;
        if (typeof fileContent === "string") {
            try {
                const decoded = atob(fileContent);
                binaryContent = new Uint8Array(decoded.length);
                for (let i = 0; i < decoded.length; i++) {
                    binaryContent[i] = decoded.charCodeAt(i);
                }
            } catch (e) {
                throw new Error("Le contenu du fichier semble être une chaîne base64 invalide.");
            }
        } else if (!(fileContent instanceof Uint8Array || fileContent instanceof ArrayBuffer)) {
            throw new Error("Le contenu du fichier est invalide ou dans un format non supporté.");
        }

        // Convert to Uint8Array if ArrayBuffer
        if (binaryContent instanceof ArrayBuffer) {
            binaryContent = new Uint8Array(binaryContent);
        }

        // Convert binary content to Blob
        const blob = new Blob([binaryContent], { type: "application/octet-stream" });
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
        alert(`Erreur lors du téléchargement: ${error.message}`);
    }
};