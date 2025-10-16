// src/components/Footer.tsx
"use client";

import React from "react";
import { SidebarFooter, SidebarFooterInfo, ThemeSelector } from "@/styles/template-styles";

interface Theme {
  id: string;
  name: string;
  color: string;
}

interface FooterProps {
  collapsed: boolean;
  themes: Theme[];
  theme: string;
  handleThemeChange: (newTheme: string) => void;
}

const Footer: React.FC<FooterProps> = ({ collapsed, themes, theme, handleThemeChange }) => {
  return (
    <SidebarFooter>
      {!collapsed ? (
        <SidebarFooterInfo>
          <div className="sidebar-footer-title">Ravinala Airports</div>
          <div className="sidebar-footer-subtitle">Gestion de Mission</div>
        </SidebarFooterInfo>
      ) : (
        <ThemeSelector className="theme-selector theme-selector-small">
          <div className="theme-dots">
            {themes.map((t) => (
              <button
                key={t.id}
                className={`theme-dot ${theme === t.id ? "active" : ""}`}
                style={{ backgroundColor: t.color }}
                onClick={() => handleThemeChange(t.id)}
                aria-label={`Changer le thème vers ${t.name}`}
              />
            ))}
          </div>
        </ThemeSelector>
      )}
    </SidebarFooter>
  );
};

export default Footer;