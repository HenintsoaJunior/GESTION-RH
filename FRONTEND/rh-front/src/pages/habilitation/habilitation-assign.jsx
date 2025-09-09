import { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";
import {
  DashboardContainer,
  Loading,
  NoDataMessage,
  FormInputSearch,
} from "styles/generaliser/table-container";
import {
  CardsContainer,
  Card,
  CardHeader,
  CardTitle,
  EmptyCardsState,
  LoadingCardsState,
} from "styles/generaliser/card-container";
import Alert from "components/alert";
import { fetchAllHabilitations } from "services/users/habilitation";

const HabilitationAssign = ({ roleId, roleName, initialHabilitations = [], onHabilitationsChange }) => {
  // Déclarer selectedHabilitations en premier pour éviter l'erreur TDZ
  const [selectedHabilitations, setSelectedHabilitations] = useState(
    initialHabilitations.map((h) => h.habilitationId)
  );
  const [habilitations, setHabilitations] = useState([]);
  const [filteredHabilitations, setFilteredHabilitations] = useState([]);
  const [isLoading, setIsLoading] = useState({ habilitations: false });
  const [alert, setAlert] = useState({ isOpen: false, type: "info", message: "" });
  const [totalEntries, setTotalEntries] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Gestion des erreurs
  const handleError = useCallback((error) => {
    setAlert({
      isOpen: true,
      type: "error",
      message: error.message || "Une erreur est survenue",
    });
  }, []);

  // Gestion du succès
  const handleSuccess = useCallback((alertData) => {
    setAlert({
      isOpen: true,
      type: "success",
      message: alertData.message,
    });
  }, []);

  // Charger les habilitations
  useEffect(() => {
    fetchAllHabilitations(setHabilitations, setIsLoading, setTotalEntries, handleError);
  }, [handleError]);

  // Mettre à jour les habilitations sélectionnées dans le composant parent
  useEffect(() => {
    if (onHabilitationsChange) {
      onHabilitationsChange(selectedHabilitations);
    }
  }, [selectedHabilitations, onHabilitationsChange]);

  // Filtrer les habilitations selon la recherche et le filtre
  useEffect(() => {
    let filtered = habilitations.filter((hab) =>
      hab.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType === "selected") {
      filtered = filtered.filter((hab) => selectedHabilitations.includes(hab.habilitationId));
    } else if (filterType === "unselected") {
      filtered = filtered.filter((hab) => !selectedHabilitations.includes(hab.habilitationId));
    }

    setFilteredHabilitations(filtered);
  }, [habilitations, searchTerm, filterType, selectedHabilitations]);

  // Gérer la sélection/désélection des habilitations
  const handleCheckboxChange = (habilitationId) => {
    setSelectedHabilitations((prev) =>
      prev.includes(habilitationId)
        ? prev.filter((id) => id !== habilitationId)
        : [...prev, habilitationId]
    );
  };

  // Basculer entre les filtres
  const handleFilterToggle = (newFilterType) => {
    setFilterType(newFilterType);
  };

  // Sélectionner ou désélectionner toutes les habilitations
  const handleSelectAll = () => {
    if (selectedHabilitations.length === habilitations.length) {
      setSelectedHabilitations([]);
      setFilterType("all");
    } else {
      setSelectedHabilitations(habilitations.map((h) => h.habilitationId));
      setFilterType("all");
    }
  };

  // Calculer les compteurs
  const totalHabilitations = habilitations.length;
  const selectedCount = selectedHabilitations.length;
  const unselectedCount = totalHabilitations - selectedCount;

  return (
    <DashboardContainer>
      {alert.isOpen && (
        <Alert
          type={alert.type}
          message={alert.message}
          isOpen={alert.isOpen}
          onClose={() => setAlert({ ...alert, isOpen: false })}
        />
      )}

      <div
        style={{
          background: "var(--bg-primary)",
          padding: "var(--spacing-lg)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "var(--spacing-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-md)",
          transition: "none",
        }}
      >
        <div style={{ display: "flex", gap: "var(--spacing-sm)", flexWrap: "wrap" }}>
          <button
            onClick={() => handleFilterToggle("all")}
            style={{
              padding: "var(--spacing-xs) var(--spacing-md)",
              border: filterType === "all" ? "2px solid var(--primary-color)" : "1px solid var(--border-light)",
              borderRadius: "var(--radius-md)",
              background: filterType === "all" ? "var(--primary-color)" : "transparent",
              color: filterType === "all" ? "#ffffff" : "var(--text-primary)",
              cursor: "pointer",
              fontSize: "var(--font-size-xs)",
              fontWeight: "500",
              transition: "none",
            }}
          >
            Toutes ({totalHabilitations})
          </button>
          <button
            onClick={() => handleFilterToggle("selected")}
            style={{
              padding: "var(--spacing-xs) var(--spacing-md)",
              border: filterType === "selected" ? "2px solid var(--primary-color)" : "1px solid var(--border-light)",
              borderRadius: "var(--radius-md)",
              background: filterType === "selected" ? "var(--primary-color)" : "transparent",
              color: filterType === "selected" ? "#ffffff" : "var(--text-primary)",
              cursor: "pointer",
              fontSize: "var(--font-size-xs)",
              fontWeight: "500",
              transition: "none",
            }}
          >
            Sélectionnées ({selectedCount})
          </button>
          <button
            onClick={() => handleFilterToggle("unselected")}
            style={{
              padding: "var(--spacing-xs) var(--spacing-md)",
              border: filterType === "unselected" ? "2px solid var(--primary-color)" : "1px solid var(--border-light)",
              borderRadius: "var(--radius-md)",
              background: filterType === "unselected" ? "var(--primary-color)" : "transparent",
              color: filterType === "unselected" ? "#ffffff" : "var(--text-primary)",
              cursor: "pointer",
              fontSize: "var(--font-size-xs)",
              fontWeight: "500",
              transition: "none",
            }}
          >
            Non sélectionnées ({unselectedCount})
          </button>
          <button
            onClick={handleSelectAll}
            style={{
              padding: "var(--spacing-xs) var(--spacing-md)",
              border: "1px solid var(--primary-color)",
              borderRadius: "var(--radius-md)",
              background: "transparent",
              color: "var(--primary-color)",
              cursor: "pointer",
              fontSize: "var(--font-size-xs)",
              fontWeight: "500",
              transition: "none",
            }}
          >
            {selectedHabilitations.length === habilitations.length ? "Désélectionner tout" : "Sélectionner tout"}
          </button>
        </div>
        <div style={{ position: "relative" }}>
          <FormInputSearch
            type="text"
            placeholder="Rechercher une habilitation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              paddingLeft: "var(--spacing-xl)",
              fontSize: "var(--font-size-xs)",
              transition: "none"
            }}
          />
        </div>
      </div>

      <CardsContainer>
        {isLoading.habilitations ? (
          <LoadingCardsState>
            <Loading style={{ fontSize: "var(--font-size-xs)" }}>Chargement...</Loading>
          </LoadingCardsState>
        ) : filteredHabilitations.length > 0 ? (
          filteredHabilitations.map((habilitation) => {
            const isSelected = selectedHabilitations.includes(habilitation.habilitationId);
            return (
              <Card
                key={habilitation.habilitationId}
                style={{
                  border: isSelected ? "2px solid var(--primary-color)" : "1px solid var(--border-light)",
                  cursor: "pointer",
                  transition: "none",
                }}
                onClick={() => handleCheckboxChange(habilitation.habilitationId)}
              >
                <CardHeader
                  style={{
                    background: isSelected ? "var(--primary-color)" : "var(--bg-secondary)",
                    color: isSelected ? "#ffffff" : "var(--text-primary)",
                    transition: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: isSelected ? "2px solid #ffffff" : "2px solid var(--border-light)",
                        borderRadius: "var(--radius-sm)",
                        background: isSelected ? "#ffffff" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "none",
                      }}
                    >
                      {isSelected && <Check size={10} color="var(--primary-color)" />}
                    </div>
                    <CardTitle style={{ 
                      color: "inherit", 
                      fontSize: "var(--font-size-xs)",
                      transition: "none"
                    }}>
                      {habilitation.label || "Non spécifié"}
                    </CardTitle>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        ) : (
          <EmptyCardsState>
            <NoDataMessage style={{ fontSize: "var(--font-size-xs)" }}>
              {searchTerm ? "Aucune habilitation trouvée pour cette recherche." : "Aucune habilitation trouvée."}
            </NoDataMessage>
          </EmptyCardsState>
        )}
      </CardsContainer>
    </DashboardContainer>
  );
};

export default HabilitationAssign;