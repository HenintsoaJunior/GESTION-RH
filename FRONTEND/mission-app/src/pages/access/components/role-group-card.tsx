import { ChevronDown, ChevronUp } from "lucide-react";
import type { HabilitationGroup } from "..";
import type { Dispatch, SetStateAction } from "react";

const ITEMS_PER_CARD = 7;

interface Props {
  roleId: string;
  group: HabilitationGroup;
  expandedGroups: Set<string>;
  setExpandedGroups: Dispatch<SetStateAction<Set<string>>>;
}

const RoleGroupCard: React.FC<Props> = ({
  roleId,
  group,
  expandedGroups,
  setExpandedGroups
}) => {
  const key = `${roleId}-${group.groupId}`;
  const isExpanded = expandedGroups.has(key);

  const displayed = isExpanded
    ? group.habilitations
    : group.habilitations.slice(0, ITEMS_PER_CARD);

  const toggle = () => {
    setExpandedGroups((prev: Set<string>) => {
      const set = new Set(prev);

      if(set.has(key)) set.delete(key);
      else set.add(key);
    //   set.has(key) ? set.delete(key) : set.add(key);
      return set;
    });
  };

  return (
    <div
      style={{
        flex: "1 1 250px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "12px",
        background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        fontSize: "0.85rem"
      }}
    >
      <h4 style={{ marginBottom: "8px" }}>{group.label}</h4>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {displayed.map((hab) => (
          <li
            key={hab.habilitationId}
            style={{ padding: "4px 0", borderBottom: "1px solid #eee" }}
          >
            {hab.label}
          </li>
        ))}
      </ul>

      {group.habilitations.length > ITEMS_PER_CARD && (
        <button
          onClick={toggle}
          style={{
            marginTop: "8px",
            padding: "4px 8px",
            border: "1px solid var(--primary-color)",
            background: "var(--primary-light)",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9rem"
          }}
        >
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {isExpanded ? " Réduire" : " Afficher plus"}
        </button>
      )}
    </div>
  );
};

export default RoleGroupCard;
