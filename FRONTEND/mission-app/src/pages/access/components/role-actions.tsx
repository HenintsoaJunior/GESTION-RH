import { Plus } from "lucide-react";
import { ButtonPrimary } from "@/styles/popup-styles";

interface Props {
  canCreateRole?: boolean;
  onCreate: () => void;
}

const RoleActions: React.FC<Props> = ({ canCreateRole, onCreate }) => {
  if (!canCreateRole) return null;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
      <h2>Rôles</h2>
      <ButtonPrimary onClick={onCreate}>
        <Plus size={16} /> Créer un rôle
      </ButtonPrimary>
    </div>
  );
};

export default RoleActions;
