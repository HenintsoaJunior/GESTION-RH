"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { TabContainer, TabButton } from "@/styles/onglet-style"; 
import CompensationScaleNational from "./national/list/index";
import ExpenseTypesList from "./type/list/index"; 
import ExpenseCompensationScaleInternational from "./international/list";

const StyledTabContainer = styled.div`${TabContainer}`;

const StyledTabButton = styled.button<{ $isActive: boolean; $hasBorderRight: boolean; }>`
  ${TabButton}
`;

const CompensationScalesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'types' | 'national' | 'international'>('types');

  const handleTabClick = (tab: 'types' | 'national' | 'international') => {
    setActiveTab(tab);
  };

  return (
    <div style={{ padding: 'var(--spacing-md)' }}>
      <StyledTabContainer>
        <StyledTabButton
          $isActive={activeTab === 'types'}
          $hasBorderRight={true}
          onClick={() => handleTabClick('types')}
        >
          Types de Dépense
        </StyledTabButton>
        <StyledTabButton
          $isActive={activeTab === 'national'}
          $hasBorderRight={true}
          onClick={() => handleTabClick('national')}
        >
          National
        </StyledTabButton>
        <StyledTabButton
          $isActive={activeTab === 'international'}
          $hasBorderRight={false}
          onClick={() => handleTabClick('international')}
        >
          International
        </StyledTabButton>
      </StyledTabContainer>

      {activeTab === 'types' ? (
        <ExpenseTypesList />
      ) : activeTab === 'national' ? (
        <CompensationScaleNational />
      ) : (
        <ExpenseCompensationScaleInternational />
      )}
    </div>
  );
};

export default CompensationScalesPage;