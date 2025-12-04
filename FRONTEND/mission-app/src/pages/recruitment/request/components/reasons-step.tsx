"use client";

import React from "react";
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
import { useGetReplacementReasons, type DocumentDTO } from "@/api/recruitment/service";

export interface RecruitmentReasonForm {
	isReplacement: boolean;
	replacementReasonId?: string;
	replacementDate?: string;
	reasonPrecision?: string;
	lastTitularId?: string;
	beginningDate: string;
}

interface RecruitmentReasonStepProps {
	formData: RecruitmentReasonForm;
	fieldErrors?: { [key: string]: string[] };
	isSubmitting?: boolean;
	handleInputChange: (
		e:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLTextAreaElement>
			| React.ChangeEvent<HTMLSelectElement>
			| { target: { name: string; value: string } },
		section?: string
	) => void;
}

const RecruitmentReasonStep: React.FC<RecruitmentReasonStepProps> = ({
	formData,
	fieldErrors = {},
	isSubmitting = false,
	handleInputChange,
}) => {
	const { data: reasonsResponse, isLoading: reasonsLoading } = useGetReplacementReasons();
	const reasons: DocumentDTO[] = reasonsResponse?.data || [];
	const isOtherReason = formData.replacementReasonId === "other";

	return ( <>
		{/* Section 1: Remplacement */}
		<FormSectionTitle>Détails du remplacement</FormSectionTitle>
		<FormTable>
			<tbody>
				{/* Checkbox Remplacement */}
				<FormRow>
					<FormFieldCell colSpan={2}>
						<label style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start" }}>
							<FormInput
								type="checkbox"
								name="isReplacement"
								checked={formData.isReplacement || false}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									handleInputChange({
										target: { name: "isReplacement", value: e.target.checked ? "true" : "false" },
									});
								}}
								disabled={isSubmitting}
							/>
							<span style={{ fontWeight: 500 }}>Ceci est un remplacement</span>
						</label>
					</FormFieldCell>
				</FormRow>

				{/* Motifs de remplacement (visible si isReplacement coché) */}
				{formData.isReplacement && (
					<>
						<FormRow>
							<FormFieldCell colSpan={2}>
								<FormLabelRequired>Motif de remplacement</FormLabelRequired>
								<FormInput
									type="text"
									name="replacementReasonId"
									value={formData.replacementReasonId || ""}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
									placeholder="Chercher un motif..."
									disabled={isSubmitting || reasonsLoading}
									className={fieldErrors?.replacementReasonId ? "input-error" : ""}
									list="reasonSuggestions"
								/>
								<datalist id="reasonSuggestions">
									{reasons.map((reason) => (
										<option key={reason.id} value={reason.id}>
											{reason.name}
										</option>
									))}
									<option value="other">Autre</option>
								</datalist>
								{fieldErrors?.replacementReasonId && fieldErrors.replacementReasonId.length > 0 && (
									<ErrorMessage>{fieldErrors.replacementReasonId.join(", ")}</ErrorMessage>
								)}
							</FormFieldCell>
						</FormRow>

						{/* Date de remplacement */}
						<FormRow className="dual-field-row">
							<FormFieldCell>
								<FormLabelRequired>Date de remplacement</FormLabelRequired>
								<FormInput
									type="date"
									name="replacementDate"
									value={formData.replacementDate || ""}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
									disabled={isSubmitting}
									className={fieldErrors?.replacementDate ? "input-error" : ""}
								/>
								{fieldErrors?.replacementDate && fieldErrors.replacementDate.length > 0 && (
									<ErrorMessage>{fieldErrors.replacementDate.join(", ")}</ErrorMessage>
								)}
							</FormFieldCell>

							{/* Dernier titulaire */}
							<FormFieldCell>
								<FormLabel>Dernier titulaire</FormLabel>
								<FormInput
									type="text"
									name="lastTitularId"
									value={formData.lastTitularId || ""}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
									placeholder="À compléter..."
									disabled={isSubmitting}
									className={fieldErrors?.lastTitularId ? "input-error" : ""}
								/>
								{fieldErrors?.lastTitularId && fieldErrors.lastTitularId.length > 0 && (
									<ErrorMessage>{fieldErrors.lastTitularId.join(", ")}</ErrorMessage>
								)}
							</FormFieldCell>
						</FormRow>

						{/* Précision si "Autre" sélectionné */}
						{isOtherReason && (
							<FormRow>
								<FormFieldCell colSpan={2}>
									<FormLabelRequired>Précision du motif</FormLabelRequired>
									<FormInput
										type="text"
										name="reasonPrecision"
										value={formData.reasonPrecision || ""}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
										placeholder="Préciser le motif..."
										disabled={isSubmitting}
										className={fieldErrors?.reasonPrecision ? "input-error" : ""}
									/>
									{fieldErrors?.reasonPrecision && fieldErrors.reasonPrecision.length > 0 && (
										<ErrorMessage>{fieldErrors.reasonPrecision.join(", ")}</ErrorMessage>
									)}
								</FormFieldCell>
							</FormRow>
						)}
					</>
				)}
			</tbody>
		</FormTable>

		{/* Section 2: Date souhaitée */}
		<FormSectionTitle>Date souhaitée</FormSectionTitle>
		<FormTable>
			<tbody>
				<FormRow>
					<FormFieldCell colSpan={2}>
						<FormLabelRequired>Date de début souhaitée</FormLabelRequired>
						<FormInput
							type="date"
							name="beginningDate"
							value={formData.beginningDate || ""}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
							disabled={isSubmitting}
							className={fieldErrors?.beginningDate ? "input-error" : ""}
						/>
						{fieldErrors?.beginningDate && fieldErrors.beginningDate.length > 0 && (
							<ErrorMessage>{fieldErrors.beginningDate.join(", ")}</ErrorMessage>
						)}
					</FormFieldCell>
				</FormRow>
			</tbody>
		</FormTable>
	</> );
};

export default RecruitmentReasonStep;
