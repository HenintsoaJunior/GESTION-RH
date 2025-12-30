import styled from "styled-components";
import {
  TabContainer,
  TabButton,
} from "@/styles/onglet-style";

const StyledTabContainer = styled.div`${TabContainer}`;

type TabButtonProps = {
  $isActive: boolean;
  $hasBorderRight: boolean;
};

const StyledTabButton = styled.button<TabButtonProps>`
  ${TabButton}
`;

interface Tab {
  key: string;
  label: string;
}

interface MissionTabsProps {
  activeTab: string;
  tabTitles: Tab[];
  onTabChange: (tab: string) => void;
}

const MissionTabs: React.FC<MissionTabsProps> = ({
  activeTab,
  tabTitles,
  onTabChange,
}) => {
  return (
    <StyledTabContainer>
      {tabTitles.map((tab, index) => (
        <StyledTabButton
          key={tab.key}
          $isActive={activeTab === tab.key}
          $hasBorderRight={index < tabTitles.length - 1}
          onClick={() => onTabChange(tab.key as any)}
        >
          {tab.label}
        </StyledTabButton>
      ))}
    </StyledTabContainer>
  );
};

export default MissionTabs;