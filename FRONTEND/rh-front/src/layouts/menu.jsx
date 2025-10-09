export default function Menu({ 
  menuData, 
  isMenuLoading, 
  collapsed, 
  activeItem, 
  renderMenuItem, 
  setActive, 
  groupMenuBySection 
}) {
  const renderMenu = () => {
    const groupedMenu = groupMenuBySection(menuData);

    return (
      <nav className="sidebar-nav">
        {isMenuLoading ? (
          <div className="menu-loading-dots">Chargement du menu ...</div>
        ) : (
          <ul>
            {groupedMenu.navigation.length > 0 && (
              <>
                <div className="sidebar-divider">
                  <span>{!collapsed && "NAVIGATION"}</span>
                </div>
                {groupedMenu.navigation.map((item) => renderMenuItem(item, 0))}
              </>
            )}

            {groupedMenu.administration.length > 0 && (
              <>
                <div className="sidebar-divider">
                  <span>{!collapsed && "ADMINISTRATION"}</span>
                </div>
                {groupedMenu.administration.map((item) => renderMenuItem(item, 0))}
              </>
            )}
          </ul>
        )}
      </nav>
    );
  };

  return (
    <>
      {renderMenu()}
    </>
  );
}