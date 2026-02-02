import React from "react";

interface LabelValueProps {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}

const LabelValue: React.FC<LabelValueProps> = ({ label, value, children }) => {
  return (
    <div className="info-card">
      <span className="label">{label} : </span>
      <span className="value">
        {children ?? value ?? "—"}
      </span>
    </div>
  );
};

export default LabelValue;
