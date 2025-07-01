import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Eye, FileText, Loader2 } from 'lucide-react';
import { BASE_URL } from '../../../../config/apiConfig';
import './pdf-viewer.css';

const PDFViewer = () => {
  const { recruitmentRequestId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/RecruitmentRequest/files?recruitment_request_id=${recruitmentRequestId}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des fichiers');
      }

      const data = await response.json();
      setFiles(data);
      if (data.length > 0) {
        setSelectedFile(data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [recruitmentRequestId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const createPDFUrl = (base64String) => {
    try {
      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Erreur lors de la conversion base64:', error);
      return null;
    }
  };

  const downloadPDF = (file) => {
    const url = createPDFUrl(file.fileName);
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `document_${file.fileId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const viewPDF = (file) => {
    setSelectedFile(file);
  };

  if (loading) {
    return (
      <div className="pdf-viewer-loading">
        <div className="loading-content">
          <Loader2 className="loader-icon" />
          <span className="loading-text">Chargement des fichiers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-viewer-error">
        <div className="error-content">
          <FileText className="error-icon" />
          <p className="error-title">Erreur</p>
          <p className="error-message">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="back-button"
          >
            <ArrowLeft className="back-icon" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container">
      {/* En-tête */}
      <div className="pdf-viewer-header">
        <div className="header-left">
          <button
            onClick={() => navigate(-1)}
            className="back-link"
          >
            <ArrowLeft className="back-icon" />
            <span className="back-text">Retour</span>
          </button>
          <h1 className="header-title">Documents de la demande</h1>
        </div>
        <div className="header-id">
          ID: {recruitmentRequestId}
        </div>
      </div>

      {files.length === 0 ? (
        <div className="pdf-viewer-empty">
          <FileText className="empty-icon" />
          <p className="empty-text">Aucun document trouvé pour cette demande</p>
        </div>
      ) : (
        <div className="pdf-viewer-content">
          {/* Liste des fichiers */}
          <div className="pdf-viewer-files">
            <div className="files-header">
              <h2 className="files-title">
                Documents disponibles ({files.length})
              </h2>
            </div>
            <div className="files-list">
              {files.map((file, index) => (
                <div
                  key={file.fileId}
                  className={`file-item ${selectedFile?.fileId === file.fileId ? 'file-selected' : ''}`}
                >
                  <div className="file-content">
                    <div className="file-info">
                      <FileText className="file-icon" />
                      <div className="file-details">
                        <h3 className="file-title">
                          Document {index + 1}
                        </h3>
                        <p className="file-id">ID: {file.fileId}</p>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button
                        onClick={() => viewPDF(file)}
                        className="action-button view-button"
                      >
                        <Eye className="action-icon" />
                        <span>Voir</span>
                      </button>
                      <button
                        onClick={() => downloadPDF(file)}
                        className="action-button download-button"
                      >
                        <Download className="action-icon" />
                        <span>Télécharger</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aperçu du document */}
          {selectedFile && (
            <div className="pdf-viewer-preview">
              <div className="preview-header">
                <h2 className="preview-title">Aperçu du document</h2>
                <p className="preview-id">ID: {selectedFile.fileId}</p>
              </div>
              <div className="preview-content">
                <iframe
                  src={createPDFUrl(selectedFile.fileName)}
                  className="pdf-iframe"
                  title="Aperçu PDF"
                  onError={() => console.error('Erreur lors du chargement du PDF')}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFViewer;