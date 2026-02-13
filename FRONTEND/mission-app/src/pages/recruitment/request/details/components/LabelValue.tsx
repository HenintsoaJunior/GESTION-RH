import React from "react";
import DOMPurify from "dompurify";

interface LabelValueProps {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}

const LabelValue: React.FC<LabelValueProps> = ({ label, value, children }) => {
  const content = children ?? value ?? "—";

  // On purifie le HTML avant de l'afficher
  const sanitizedContent =
    typeof content === "string" ? DOMPurify.sanitize(content) : content;

  return (
    <div className="info-card">
      <span className="label">{label} : </span>
      {typeof sanitizedContent === "string" ? (
        <span
          className="value"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      ) : (
        <span className="value">{sanitizedContent}</span>
      )}
    </div>
  );
};

export default LabelValue;

