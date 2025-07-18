"use client";

import { BASE_URL } from "config/apiConfig";

export const fetchRecruitmentReasons = async (setRecruitmentReasons, setIsLoading, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, recruitmentReasons: true }));
    const response = await fetch(`${BASE_URL}/api/RecruitmentReason`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des motifs de recrutement: ${response.statusText}`);
    }

    const data = await response.json();
    setRecruitmentReasons(data);
  } catch (error) {
    console.error("Erreur lors du chargement des motifs de recrutement:", error);
    onError({ isOpen: true, type: "error", message: `Erreur lors du chargement des motifs de recrutement: ${error.message}` });
  } finally {
    setIsLoading((prev) => ({ ...prev, recruitmentReasons: false }));
  }
};

export const getRecruitmentReasonId = (motive, recruitmentReasons) =>
  recruitmentReasons.find((reason) => reason.name === motive)?.recruitmentReasonId || "";