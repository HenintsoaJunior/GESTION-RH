// TemplateFooter.tsx
"use client";

import React from "react";
import { TemplateFooter as StyledTemplateFooter, FooterCopyright } from "@/styles/template-styles";

interface TemplateFooterProps {
  collapsed?: boolean;
}

const TemplateFooter: React.FC<TemplateFooterProps> = ({ collapsed }) => {
  const currentYear = new Date().getFullYear();

  return (
    <StyledTemplateFooter $collapsed={collapsed}>
      <FooterCopyright>
        © {currentYear} Ravinala Airport
      </FooterCopyright>
    </StyledTemplateFooter>
  );
};

export default TemplateFooter;