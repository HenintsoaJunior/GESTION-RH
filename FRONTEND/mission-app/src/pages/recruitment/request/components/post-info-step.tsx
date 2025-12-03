"use client";

import React from "react";
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
import { useEmployeeInformations, type UserPostInformation } from "@/api/users/services";


interface PostInformationsStepProps {
	formData: {
		post: string;
		effective: number | "";
		contractId: string;
		contractPrecision?: string;
		monthDuration?: number | "";
		applicantUserId: string;
	};
	fieldErrors: { [key: string]: string[] };
	isSubmitting: boolean;
	isLoading?: { [key: string]: boolean };
	suggestions: {
		applicant?: { displayName: string }[];
	};
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

const PostInformationsStep: React.FC<PostInformationsStepProps> = ({
	formData,
	fieldErrors,
	isSubmitting,
	handleInputChange,
}) => {
	const { data: contractsResponse, isLoading: contractsLoading } = useGetContractTypes();
	const { data: infosResponse } = useEmployeeInformations();
	const contracts: ContractType[] = contractsResponse?.data || [];

	// selected contract by code (same as request-list.tsx)
	const selectedContract = contracts.find((c) => c.code === formData.contractId) || null;
	// option "other" selected explicitly
	const isOther = formData.contractId === "other";
	// CDD detection (contract code equals "CDD" or label includes "CDD")
	const isCDD =
		Boolean(selectedContract) &&
		(
			(selectedContract?.code || "").toUpperCase() === "CDD" ||
			(selectedContract?.label || "").toUpperCase().includes("CDD")
		);

	// derive visibility
	const showPrecision = isOther && !isCDD; // precision only when "Autre" and not CDD
	const showDuration = isOther || isCDD; // duration when "Autre" OR when CDD

	// Normaliser les différentes formes de réponse et extraire l'objet employee
	// handle cases: infosResponse, infosResponse.data, infosResponse.data.data
	const payload = (infosResponse as any)?.data ?? infosResponse;
	const employee = (payload as any)?.data ?? payload;
	const currentUser: CurrentUser | null = employee
		? {
				// identifiant : prefer employeeId (ex: "EMP-000445")
				id: employee.employeeId ?? employee.id ?? employee.employeeCode ?? "",
				// direction : direction.directionName or directionName
				direction:
					employee.direction?.directionName ?? employee.directionName ?? employee.direction ?? "",
				// department : department.departmentName or departmentName
				department:
					employee.department?.departmentName ?? employee.departmentName ?? employee.department ?? "",
				// service : service.serviceName or serviceName
				service:
					employee.service?.serviceName ?? employee.serviceName ?? employee.service ?? "",
				// supérieur : try several possible property names
				managerName:
					employee.superiorName ??
					employee.managerName ??
					employee.supervisorName ??
					(employee.supervisor && (employee.supervisor.name ?? employee.supervisor.fullName)) ??
					"",
				managerFunction:
					employee.superiorPost ??
					employee.managerFunction ??
					employee.managerTitle ??
					(employee.supervisor && (employee.supervisor.function ?? employee.supervisor.title)) ??
					"",
		  }
		: null;

	console.log("Current User Info:", currentUser);

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
								value={formData.effective === "" ? "" : String(formData.effective)}
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
												value={ct.code}
												checked={formData.contractId === ct.code}
												onChange={() =>
													handleInputChange({ target: { name: "contractId", value: ct.code } })
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

					{/* Si Autre -> précision + durée ; Si CDD -> durée seulement */}
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
										formData.monthDuration === undefined || formData.monthDuration === ""
											? ""
											: String(formData.monthDuration)
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
								<div>
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
								<div>
									<FormLabel>Supérieur</FormLabel>
									<FormInput
										type="text"
										name="managerName"
										value={currentUser?.managerName || ""}
										readOnly
										disabled
									/>
								</div>

								{/* Fonction du supérieur (full width) */}
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

export default PostInformationsStep;