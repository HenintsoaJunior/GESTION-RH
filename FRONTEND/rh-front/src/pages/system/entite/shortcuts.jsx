"use client";
import { Link } from "react-router-dom";
import "styles/shortcuts.css";

export default function ShortcutsDashboard() {
  const shortcuts = [
    {
      id: 1,
      title: "Employee",
      link: "/employee",
    },
    {
      id: 2,
      title: "Direction",
      link: "/direction/direction-form",
    },
    {
      id: 3,
      title: "Departement",
      link: "/direction/department-form",
    },
    {
      id: 4,
      title: "Service",
      link: "/direction/service-form",
    },
  ];

  return (
    <div className="dashboard-container-shortcut">
      <div className="stats-container-shortcut">
        <h1 className="table-title-shortcut">Quick Shortcuts</h1>
        <table className="shortcuts-table-shortcut">
          <tbody>
            <tr>
              {shortcuts.map((shortcut) => (
                <td key={shortcut.id} className="shortcut-cell-shortcut">
                  <Link to={shortcut.link} className="shortcut-card-shortcut">
                    <div className="shortcut-content-shortcut">
                      <h3 className="shortcut-title-shortcut">{shortcut.title}</h3>
                    </div>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}