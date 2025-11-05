// template-footer.tsx
"use client";
import React from "react";
import { TemplateFooter as StyledTemplateFooter, FooterCopyright } from "@/styles/template-styles";

const TemplateFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <StyledTemplateFooter>
      <FooterCopyright>
        © {currentYear} Ravinala Airports
      </FooterCopyright>
    </StyledTemplateFooter>
  );
};
export default TemplateFooter;