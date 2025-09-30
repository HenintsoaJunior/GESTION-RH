export default function Footer({ collapsed, themes, theme, handleThemeChange }) {
  return (
    <div className="sidebar-footer">
      {!collapsed ? (
        <>
          <div className="sidebar-footer-info">
            <div className="sidebar-footer-title">Ravinala Airports</div>
            <div className="sidebar-footer-subtitle">Système de recrutement v2.1</div>
          </div>
        </>
      ) : (
        <div className="theme-selector theme-selector-small">
          <div className="theme-dots">
            {themes.map((t) => (
              <button
                key={t.id}
                className={`theme-dot ${theme === t.id ? "active" : ""}`}
                style={{ backgroundColor: t.color }}
                onClick={() => handleThemeChange(t.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}