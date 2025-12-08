"use client";

import React, { useEffect } from "react";
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
} from "@/styles/form-container";
import { useEmployeeInformations, type EmployeeInformations } from "@/api/users/services";
import { useGetSites, type Site } from "@/api/site/services";


export interface PostInformationForm {
	post: string;
	effective: number | null;
	contractId: string | null;
	contractPrecision?: string | null;
	monthDuration?: number | null;
	sites: string[];
	applicantUserId: string;
}

interface PostInformationStepProps {
	formData: PostInformationForm;
	fieldErrors: { [key: string]: string[] };
	direction?: string;
	isSubmitting: boolean;
	isLoading?: { [key: string]: boolean };
	suggestions: {
		applicant?: { displayName: string }[];
	};
	onDirectionChange?: (value: string) => void;
	handleInputChange: (
		e:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLTextAreaElement>
			| { target: { name: string; value: string } },
		section?: string
	) => void;
	handleAddNewSuggestion?: (type: string, value: string) => void;
}

interface CurrentUser {
	id?: string;
	direction?: string;
	department?: string;
	service?: string;
	managerName?: string;
	managerFunction?: string;
}

const PostInformationStep: React.FC<PostInformationStepProps> = ({
	formData,
	fieldErrors,
	isSubmitting,
	handleInputChange,
	onDirectionChange,
}) => {
	const { data: contractsResponse, isLoading: contractsLoading } = useGetContractTypes();
	const { data: sitesResponse, isLoading: sitesLoading } = useGetSites();
	const { data: infosResponse } = useEmployeeInformations();
	const contracts: ContractType[] = contractsResponse?.data || [];
	const sites: Site[] = sitesResponse?.data || [];

	const selectedContract = contracts.find((c) => c.contractTypeId === formData.contractId) || null;
	const isOther = formData.contractId === "other";
	const isCDD =
		Boolean(selectedContract) &&
		(
			(selectedContract?.code || "").toUpperCase() === "CDD"
		);

	const showPrecision = isOther && !isCDD; 
	const showDuration = isOther || isCDD; 

	const employee = (infosResponse as EmployeeInformations);

	const currentUser: CurrentUser | null = employee? {
		id: employee.id,
		direction: employee.direction,
		department: employee.department,
		service: employee.service,
		managerName: employee.superiorName,
		managerFunction: employee.superiorPost
	} : null;

	useEffect(() => {
		if (currentUser?.direction) {
			onDirectionChange?.(currentUser.direction);
		}
	}, [currentUser]);

	return (
		<>
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
								type="number"
								name="effective"
								value={formData.effective?.toString() === "" ? 0 : Number(formData.effective)}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
								placeholder="0"
								disabled={isSubmitting}
								className={fieldErrors.effective ? "input-error" : ""}
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
												checked={formData.contractId === ct.contractTypeId}
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
											checked={formData.contractId === "other"}
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
								<FormLabel>Précision du contrat</FormLabel>
								<FormInput
									type="text"
									name="contractPrecision"
									value={formData.contractPrecision || ""}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
									placeholder="Ex : Temps partiel, intérim..."
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
							<FormFieldCell>
								<FormLabel>Durée</FormLabel>
								<FormInput
									type="number"
									name="monthDuration"
									value={
										formData.monthDuration === undefined || formData.monthDuration?.toString() === ""
											? 0
											: Number(formData.monthDuration)
									}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
									placeholder="Nombre de mois"
									disabled={isSubmitting}
									className={fieldErrors.monthDuration ? "input-error" : ""}
								/>
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

					{/* Rattachement du poste : 5 champs readonly + hidden applicantUserId */}
					<FormRow>
						<FormFieldCell colSpan={2}>
							<FormLabelRequired>Rattachement du poste</FormLabelRequired>
							<div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 8 }}>
								{/* Direction */}
								<div>
									<FormLabel>Direction</FormLabel>
									<FormInput
										type="text"
										name="direction"
										value={currentUser?.direction || ""}
										readOnly
										disabled
									/>
								</div>

								{/* Département */}
								<div>
									<FormLabel>Département</FormLabel>
									<FormInput
										type="text"
										name="department"
										value={currentUser?.department || ""}
										readOnly
										disabled
									/>
								</div>

								{/* Service */}
								<div style={{ gridColumn: "1 / -1" }}>
									<FormLabel>Service</FormLabel>
									<FormInput
										type="text"
										name="service"
										value={currentUser?.service || ""}
										readOnly
										disabled
									/>
								</div>

								{/* Supérieur */}
								<div style={{ gridColumn: "1 / -1" }}>
									<FormLabel>Supérieur</FormLabel>
									<FormInput
										type="text"
										name="managerName"
										value={currentUser?.managerName || ""}
										readOnly
										disabled
									/>
								</div>

								{/* Fonction du supérieur (à droite du Supérieur) */}
								<div style={{ gridColumn: "1 / -1" }}>
									<FormLabel>Fonction du supérieur</FormLabel>
									<FormInput
										type="text"
										name="managerFunction"
										value={currentUser?.managerFunction || ""}
										readOnly
										disabled
									/>
								</div>

								{/* hidden field for applicantUserId (kept in formData via handleInputChange on fetch) */}
								<FormInput
									type="hidden"
									name="applicantUserId"
									value={formData.applicantUserId || currentUser?.id || ""}
									onChange={() => {}}
								/>
							</div>

							{fieldErrors.applicantUserId && fieldErrors.applicantUserId.length > 0 && (
								<ErrorMessage>{fieldErrors.applicantUserId.join(", ")}</ErrorMessage>
							)}
						</FormFieldCell>
					</FormRow>
				</tbody>
			</FormTable>
		</>
	);
};

export default PostInformationStep;
