// src/components/Footer.tsx
"use client";

import React from "react";
import { SidebarFooter, SidebarFooterInfo } from "@/styles/template-styles";

interface FooterProps {
  collapsed: boolean;
}

const Footer: React.FC<FooterProps> = ({ collapsed }) => {
  return (
    <SidebarFooter>
      {!collapsed && (
        <SidebarFooterInfo>
          <div className="sidebar-footer-title">Ravinala Airports</div>
          <div className="sidebar-footer-subtitle">Gestion de Mission</div>
        </SidebarFooterInfo>
      )}
    </SidebarFooter>
  );
};

export default Footer;