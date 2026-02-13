"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useGetContractTypes, type ContractType } from "@/api/contract/services";
import {
	FormSectionTitle,
	FormTable,
	FormRow,
	FormFieldCell,
	FormLabel,
	FormLabelRequired,
	FormInput,
	ErrorMessage,
	StyledAutoCompleteInput,
} from "@/styles/form-container";
import { useEmployeeInformations } from "@/api/users/services";
import { useGetSites, type Site } from "@/api/site/services";
import { type DocumentDTO } from "@/api/recruitment/service";
import type { CurrentUser } from "../hooks/use-request-form";


export interface PostInformationForm {
	post: string;
	effective: string | null;
	contractId: string | null;
	contractPrecision?: string | null;
	monthDuration?: string | null;
	sites: string[];

	direction: string | null;
	applicantUserId: string;
	creatorId: string;

	hierarchicalManagerId: string;
	functionalManagerId: string;
}

interface PostInformationStepProps {
	formData: PostInformationForm;
	isRegularisation: boolean;
	fieldErrors: { [key: string]: string[] };
	direction?: string;
	isSubmitting: boolean;
	isLoading?: { [key: string]: boolean };
	usersByDirection: DocumentDTO[];
	user: CurrentUser | null;
	suggestions: {
		applicant?: { displayName: string }[];
	};
	onDirectionChange?: (value: string) => void;
	handleInputChange: (
		e:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLTextAreaElement>
			| { target: { name: string; value: string | null } },
		section?: string
	) => void;
	handleAddNewSuggestion?: (type: string, value: string) => void;
}

const PostInformationStep: React.FC<PostInformationStepProps> = ({
	formData,
	isRegularisation,
	fieldErrors,
	isSubmitting,
	usersByDirection,
	user,
	handleInputChange,
	onDirectionChange,
}) => {
	const userSuggestions = useMemo(() =>
		usersByDirection.map(u => ({
			id: u.id, label: u.name
		})), [usersByDirection]
	);
	const [hierarchicalSearch, setHierarchicalSearch] = useState("");
	const [functionalSearch, setFunctionalSearch] = useState("");
	const [applicantSearch, setApplicantSearch] = useState("");


// ========================
// CHARGEMENT DES DONNEES
// ========================
	const { data: contractsResponse, isLoading: contractsLoading } = useGetContractTypes();
	const { data: sitesResponse, isLoading: sitesLoading } = useGetSites();

// Les infos du R. hiérarchique
	const { data: hierarchicalInfos } = useEmployeeInformations(
		formData.hierarchicalManagerId || undefined);
	const hierarchicalUser: CurrentUser | null = hierarchicalInfos ? {
		id: hierarchicalInfos.id,
		name: hierarchicalInfos.name,
		jobTitle: hierarchicalInfos.post,
		direction: hierarchicalInfos.direction,
		department: hierarchicalInfos.department,
		service: hierarchicalInfos.service,
	} : null;


// Les infos du R. fonctionnel
	const { data: functionalInfos } = useEmployeeInformations(
		formData.functionalManagerId || undefined);
	const functionalUser: CurrentUser | null = functionalInfos ? {
		id: functionalInfos.id,
		name: functionalInfos.name,
		jobTitle: functionalInfos.post,
		direction: functionalInfos.direction,
		department: functionalInfos.department,
		service: functionalInfos.service,
	} : null;
	
	const contracts: ContractType[] = contractsResponse?.data || [];
	const sites: Site[] = sitesResponse?.data || [];

	const selectedContract = contracts.find((c) => c.contractTypeId === formData.contractId) || null;
	const isOther = formData.contractId==="other" 
		|| (formData.contractId===null && formData.contractPrecision!=null);
	const isCDD =
		Boolean(selectedContract) && (
			(selectedContract?.code || "").toUpperCase() === "CDD"
		);

	const showPrecision = isOther && !isCDD; 
	const showDuration = isOther || isCDD; 

	const isValidSelection = (value: string) =>
  		userSuggestions.some(u => u.label === value);


// Pré-remplissage des 2 rattachements
	useEffect(() => {
		if (!user) return;

		// Hiérarchique
		if (!formData.hierarchicalManagerId) {
			handleInputChange({
				target: {
					name: "hierarchicalManagerId", value: user.id,
				},
			});
			setHierarchicalSearch(user.name);
		}

		// Fonctionnel
		if (!formData.functionalManagerId) {
			handleInputChange({
				target: {
					name: "functionalManagerId", value: user.id,
				},
			});
			setFunctionalSearch(user.name);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	useEffect(() => {
		if (!userSuggestions.length || !formData) return;

		const setLabelFromId = (id: string | null, setState: (v: string) => void) => {
			if (!id) return;
			const label = userSuggestions.find(u => u.id === id)?.label;
			if (label) setState(label);
		};

		// Pré-remplissage
		setLabelFromId(formData.hierarchicalManagerId, setHierarchicalSearch);
		setLabelFromId(formData.functionalManagerId, setFunctionalSearch);
		setLabelFromId(formData.applicantUserId, setApplicantSearch);
	}, [formData, userSuggestions]);


// DIRECTION et DEPARTEMENT à partir de R. hiérarchique
	useEffect(() => {
		if (hierarchicalUser?.direction) {
			handleInputChange({
				target: {
					name: "direction", value: hierarchicalUser.direction
				}
			});

			onDirectionChange?.(hierarchicalUser.direction);
		}
	}, [hierarchicalUser?.direction, handleInputChange, onDirectionChange]);


	useEffect(() => {
		if(formData.applicantUserId) {
			const label = userSuggestions.find(
			u => u.id === formData.applicantUserId
			)?.label;

			if(label) setApplicantSearch(label);
		}
	}, [formData.applicantUserId, userSuggestions]);


	return (<>
		<FormSectionTitle>Informations du poste</FormSectionTitle>
		<FormTable>
			<tbody>
				<FormRow>
					<FormFieldCell colSpan={2}>
						<FormLabelRequired>Poste</FormLabelRequired>
						<FormInput
							type="text"
							name="post"
							value={formData.post || ""}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
							placeholder="Saisir le poste..."
							disabled={isSubmitting}
							className={fieldErrors.post ? "input-error" : ""}
						/>
						{fieldErrors.post && fieldErrors.post.length > 0 && (
							<ErrorMessage>{fieldErrors.post.join(", ")}</ErrorMessage>
						)}
					</FormFieldCell>
				</FormRow>

				{/* Effectif sur sa propre cellule (ligne) */}
				<FormRow className="dual-field-row">
					<FormFieldCell>
						<FormLabelRequired>Effectif</FormLabelRequired>
						<FormInput
						type="text"
						name="effective"
						value={formData.effective ?? ""}
						placeholder="Ex : 2"
						disabled={isSubmitting}
						className={`no-spinner ${fieldErrors.effective ? "input-error" : ""}`}
						inputMode="numeric"          // clavier numérique sur mobile
						pattern="[0-9]*"              // indication navigateur
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							const value = e.target.value;

							// Autoriser uniquement les chiffres
							if(/^\d*$/.test(value)) {
							handleInputChange({
								target: {
								name: "effective",
								value: value === "" ? null : value
								}
							});
							}
						}}
						/>
						{fieldErrors.effective && fieldErrors.effective.length > 0 && (
							<ErrorMessage>{fieldErrors.effective.join(", ")}</ErrorMessage>
						)}
					</FormFieldCell>
				</FormRow>

				{/* Contrat : nouvelle ligne, radios horizontales */}
				<FormRow>
					<FormFieldCell colSpan={2}>
						<FormLabelRequired>Contrat</FormLabelRequired>
						{contractsLoading ? (
							<div>Chargement des contrats...</div>
						) : (
							<div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginTop: 8 }}>
								{contracts.map((ct) => (
									<label
										key={ct.code}
										style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 8 }}
									>
										<FormInput
											type="radio"
											name="contractId"
											value={ct.contractTypeId}
											checked={formData.contractId===ct.contractTypeId && isOther===false}
											onChange={() =>
												handleInputChange({ target: { name: "contractId", value: ct.contractTypeId } })
											}
											disabled={isSubmitting}
										/>
										<span style={{ whiteSpace: "nowrap" }}>{ct.label}</span>
									</label>
								))}

								{/* option "Autre" */}
								<label style={{ display: "flex", alignItems: "center", gap: 8 }}>
									<FormInput
										type="radio"
										name="contractId"
										value="other"
										checked={isOther===true}
										onChange={() =>
											handleInputChange({ target: { name: "contractId", value: "other" } })
										}
										disabled={isSubmitting}
									/>
									<span>Autre</span>
								</label>
							</div>
						)}

						{fieldErrors.contractId && fieldErrors.contractId.length > 0 && (
							<ErrorMessage>{fieldErrors.contractId.join(", ")}</ErrorMessage>
						)}
					</FormFieldCell>
				</FormRow>

				{showPrecision && (
					<FormRow className="dual-field-row">
						<FormFieldCell>
							<FormLabelRequired>Précision du contrat</FormLabelRequired>
							<FormInput
								type="text"
								name="contractPrecision"
								value={formData.contractPrecision || ""}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
								placeholder="Ex : Stage, VIE..."
								disabled={isSubmitting}
								className={fieldErrors.contractPrecision ? "input-error" : ""}
							/>
							{fieldErrors.contractPrecision && fieldErrors.contractPrecision.length > 0 && (
								<ErrorMessage>{fieldErrors.contractPrecision.join(", ")}</ErrorMessage>
							)}
						</FormFieldCell>
					</FormRow>
				)}

				{showDuration && (
					<FormRow className="dual-field-row">
						<FormFieldCell colSpan={2}>
							<FormLabelRequired>Durée</FormLabelRequired>

							<div style={{
								display: "grid",
								gridTemplateColumns: "50% auto",
								alignItems: "center",
								gap: 8,
								marginTop: 8,
							}}>
								<FormInput
								type="text"
								name="monthDuration"
								value={formData.monthDuration ?? ""}
								placeholder="Ex : 2"
								disabled={isSubmitting}
								className={`no-spinner ${fieldErrors.monthDuration ? "input-error" : ""}`}
								inputMode="numeric"          // clavier numérique sur mobile
								pattern="[0-9]*"              // indication navigateur
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									const value = e.target.value;

									// Autoriser uniquement les chiffres
									if(/^\d*$/.test(value)) {
										handleInputChange({
											target: {
												name: "monthDuration",
												value: value === "" ? null : value
											}
										});
									}
								}}
								/>
								<span style={{ color: "#555" }}> mois</span>
							</div>

							{fieldErrors.monthDuration && fieldErrors.monthDuration.length > 0 && (
								<ErrorMessage>{fieldErrors.monthDuration.join(", ")}</ErrorMessage>
							)}
						</FormFieldCell>
					</FormRow>
				)}

				{/* Sites : checkboxes multiples */}
				<FormRow>
					<FormFieldCell colSpan={2}>
						<FormLabelRequired>Sites</FormLabelRequired>
						{sitesLoading ? (
							<div>Chargement des sites...</div>
						) : (
							<div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
								{sites.map((site) => (
									<label
										key={site.siteId}
										style={{ display: "flex", alignItems: "center", gap: 8 }}
									>
										<FormInput
											type="checkbox"
											name={`site_${site.siteId}`}
											checked={formData.sites?.includes(site.siteId) || false}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												handleInputChange({
													target: {
														name: `site_${site.siteId}`,
														value: e.target.checked ? "true" : "false",
													},
												});
											}}
											disabled={isSubmitting}
										/>
										<span style={{ whiteSpace: "nowrap" }}>{site.siteName || site.code}</span>
									</label>
								))}
							</div>
						)}

						{fieldErrors.sites && fieldErrors.sites.length > 0 && (
							<ErrorMessage>{fieldErrors.sites.join(", ")}</ErrorMessage>
						)}
					</FormFieldCell>
				</FormRow>
			</tbody>
		</FormTable>

		<FormSectionTitle>Rattachements</FormSectionTitle>
		<FormTable>
			<tbody>
				<FormRow>
					<FormFieldCell colSpan={2}>
						{/* <FormLabelRequired>Rattachement du poste</FormLabelRequired> */}
						<div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 8 }}>
							{/* Direction */}
							<div>
								<FormLabel>Direction</FormLabel>
								<FormInput
									value={hierarchicalUser?.direction || ""}
									readOnly
									disabled
								/>
							</div>

							{/* Département */}
							<div>
								<FormLabel>Département</FormLabel>
								<FormInput
									value={hierarchicalUser?.department || ""}
									readOnly
									disabled
								/>
							</div>
						</div>
					</FormFieldCell>
				</FormRow>
				<FormRow>
					<FormFieldCell colSpan={2}>
						<FormLabelRequired>Rattachement hiérarchique</FormLabelRequired>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
							<StyledAutoCompleteInput
							value={hierarchicalSearch}
							suggestions={userSuggestions.map(u => u.label)}
							placeholder="Responsable hiérarchique..."
							fieldType="employee"
							fieldLabel="Rattachement hiérarchique"

							onChange={(value) => {
								setHierarchicalSearch(value);

								if (isValidSelection(value)) {
									const id = userSuggestions.find(u => 
										u.label === value)?.id ?? "";

									handleInputChange({
										target: {
											name: "hierarchicalManagerId", value: id,
										},
									});
								}
							}}
							/>

							<FormInput value={hierarchicalUser?.jobTitle || ""} readOnly disabled />
						</div>
						{fieldErrors.hierarchicalManagerId && fieldErrors.hierarchicalManagerId.length > 0 && (
							<ErrorMessage>{fieldErrors.hierarchicalManagerId.join(", ")}</ErrorMessage>
						)}
					</FormFieldCell>
				</FormRow>
				<FormRow>
					<FormFieldCell colSpan={2}>
						<FormLabelRequired>Rattachement fonctionnel</FormLabelRequired>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
							<StyledAutoCompleteInput
								value={functionalSearch}
								onChange={(value) => {
									setFunctionalSearch(value);

									if (isValidSelection(value)) {
										const id = userSuggestions.find(u => 
											u.label === value)?.id ?? "";

										handleInputChange({
											target: {
												name: "functionalManagerId", value: id,
											},
										});
									}
								}}
								suggestions={userSuggestions.map(u => u.label)}
								placeholder="Rattachement fonctionnel..."
								fieldType="employee"
								fieldLabel="Rattachement fonctionnel"
							/>
							<FormInput value={functionalUser?.jobTitle || ""} readOnly disabled />
						</div>
						{fieldErrors.functionalManagerId && fieldErrors.functionalManagerId.length > 0 && (
							<ErrorMessage>{fieldErrors.functionalManagerId.join(", ")}</ErrorMessage>
						)}
					</FormFieldCell>
				</FormRow>
				{ (isRegularisation || formData.applicantUserId!=formData.creatorId) && (
					<FormRow>
						<FormFieldCell colSpan={2}>
							<FormLabelRequired>Demandeur</FormLabelRequired>
							<StyledAutoCompleteInput
								value={applicantSearch}
								onChange={(label) => {
									setApplicantSearch(label);

									if (isValidSelection(label)) {
									const id = userSuggestions.find(u => u.label === label)?.id ?? "";
									handleInputChange({
										target: {
											name: "applicantUserId", value: id,
										},
									});
									}
								}}
								suggestions={userSuggestions.map(u => u.label)}
								placeholder="Demandeur..."
								fieldType="employee"
								fieldLabel="Demandeur"
							/>
							{fieldErrors.applicantUserId && (
								<ErrorMessage>{fieldErrors.applicantUserId.join(", ")}</ErrorMessage>
							)}
						</FormFieldCell>
					</FormRow>
				)}
				
				<FormRow>
					<FormFieldCell colSpan={2}>
						<FormInput
							type="hidden"
							name="applicantUserId"
							value={formData.applicantUserId}
							onChange={() => {}}
						/>

						<FormInput
							type="hidden"
							name="creatorId"
							value={formData.creatorId || ""}
							onChange={() => {}}
						/>
					</FormFieldCell>
				</FormRow>
				
			</tbody>
		</FormTable>
	</>);
};

export default PostInformationStep;
