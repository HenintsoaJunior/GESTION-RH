"use client";

import React, { useState } from "react";
import styled from "styled-components";
import ExpenseReportStep from "./step/expense-report-step";

const Container = styled.div`
    padding: var(--spacing-md);
    background: var(--background-light);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-light);
`;

const SectionTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 4px;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
`;

const NavButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;

    &:hover:not(:disabled) {
        background: var(--primary-hover);
    }
    &:disabled {
        background: var(--disabled-color);
        cursor: not-allowed;
    }
`;

const OMNoteDeFrais = ({ selectedAssignmentId }) => {
    // Form state for ExpenseReportStep
    const [formData, setFormData] = useState({
        titled: "",
        description: "",
        type: "",
        currencyUnit: "",
        amount: "",
        rate: "",
        assignationId: selectedAssignmentId || "",
        expenseReportTypeId: "",
        userId: "",
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fictional expenseReportTypes data
    const expenseReportTypes = [
        {
            "expenseReportTypeId": "ERT001",
            "type": "FRAIS DE TRANSPORT/MISSION",
            "createdAt": "2025-10-02T14:59:55.093",
            "updatedAt": null
        },
        {
            "expenseReportTypeId": "ERT002",
            "type": "FRAIS DE RESTAURATION/RECEPTION",
            "createdAt": "2025-10-02T14:59:55.093",
            "updatedAt": null
        },
        {
            "expenseReportTypeId": "ERT003",
            "type": "AUTRE DEPENSE",
            "createdAt": "2025-10-02T14:59:55.093",
            "updatedAt": null
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error if value is provided
        if (value) {
            setFieldErrors(prev => ({ ...prev, [name]: [] }));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Fictional submit logic
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            // Reset form or add to list, etc.
            setFormData({
                titled: "",
                description: "",
                type: "",
                currencyUnit: "",
                amount: "",
                rate: "",
                assignationId: selectedAssignmentId || "",
                expenseReportTypeId: "",
                userId: "",
            });
        }, 1000);
    };

    return (
        <Container>
            <SectionTitle>Ajouter une Nouvelle Note de Frais</SectionTitle>
            <form onSubmit={handleFormSubmit}>
                <ExpenseReportStep
                    formData={formData}
                    fieldErrors={fieldErrors}
                    isSubmitting={isSubmitting}
                    handleInputChange={handleInputChange}
                    expenseReportTypes={expenseReportTypes}
                />
                <ButtonContainer>
                    <NavButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Enregistrement..." : "Enregistrer la Note de Frais"}
                    </NavButton>
                </ButtonContainer>
            </form>
        </Container>
    );
};

export default OMNoteDeFrais;