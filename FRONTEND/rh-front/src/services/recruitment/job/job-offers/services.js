import { apiGet, apiPost } from "utils/apiUtils";

export const fetchJobOfferStatistics = async (
  setJobOfferStats,
  setIsLoading = () => {},
  onError = () => {}
) => {
  try {
    console.log("Fetching job offer statistics...");
    setIsLoading((prev) => ({ ...prev, stats: true }));
    const data = await apiGet("/api/JobOffer/statistics");
    console.log("API Response:", data);
    if (!data) {
      throw new Error("No statistics found");
    }
    const formattedStats = {
      total: data.total || 0,
      publiee: data.publiee || 0,
      enCours: data.enCours || 0,
      cloturee: data.cloturee || 0,
      annulee: data.annulee || 0,
    };
    console.log("Formatted Stats:", formattedStats);
    setJobOfferStats(formattedStats);
    return formattedStats;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques des offres d'emploi:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors de la récupération des statistiques: ${error.message}`,
    });
    setJobOfferStats(null);
    throw error;
  } finally {
    console.log("Resetting isLoading.stats to false");
    setIsLoading((prev) => ({ ...prev, stats: false }));
  }
};

export const fetchJobOfferById = async (
  offerId,
  setJobOffer,
  setIsLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
) => {
  try {
    if (!offerId) {
      throw new Error("Offer ID is required");
    }
    setIsLoading((prev) => ({ ...prev, jobOffer: true }));
    const data = await apiGet(`/api/JobOffer/${offerId}`);
    if (!data) {
      throw new Error("No job offer found");
    }
    const formattedJobOffer = {
      offerId: data.offerId || "Non spécifié",
      status: data.status || "Non spécifié",
      publicationDate: data.publicationDate || "Non spécifié",
      deadlineDate: data.deadlineDate || "Non spécifié",
      duration: data.duration || "N/A",
      title: data.jobDescription?.title || "Non spécifié",
      description: data.jobDescription?.description || "Non spécifié",
      attributions: data.jobDescription?.attributions || "Non spécifié",
      requiredEducation: data.jobDescription?.requiredEducation || "Non spécifié",
      requiredExperience: data.jobDescription?.requiredExperience || "Non spécifié",
      requiredPersonalQualities: data.jobDescription?.requiredPersonalQualities || "Non spécifié",
      requiredSkills: data.jobDescription?.requiredSkills || "Non spécifié",
      requiredLanguages: data.jobDescription?.requiredLanguages || "Non spécifié",
      createdAt: data.createdAt || "Non spécifié",
      updatedAt: data.updatedAt || null,
      recruitmentRequestId: data.recruitmentRequestId || "Non spécifié",
      requesterId: data.requesterId || "Non spécifié",
      requester: {
        userId: data.requester?.userId || "Non spécifié",
        name: data.requester?.name || "Non spécifié",
        email: data.requester?.email || "Non spécifié",
        position: data.requester?.position || "Non spécifié",
        department: data.requester?.department || "Non spécifié",
      },
      site: {
        siteId: data.recruitmentRequest?.site?.siteId || "Non spécifié",
        siteName: data.recruitmentRequest?.site?.siteName || "Non spécifié",
        code: data.recruitmentRequest?.site?.code || "Non spécifié",
      },
      contractType: {
        contractTypeId: data.recruitmentRequest?.contractType?.contractTypeId || "Non spécifié",
        code: data.recruitmentRequest?.contractType?.code || "Non spécifié",
        label: data.recruitmentRequest?.contractType?.label || "Non spécifié",
        createdAt: data.recruitmentRequest?.contractType?.createdAt || "Non spécifié",
        updatedAt: data.recruitmentRequest?.contractType?.updatedAt || null,
      },
    };
    setJobOffer(formattedJobOffer);
    onSuccess({
      isOpen: true,
      type: "success",
      message: "Offre d'emploi récupérée avec succès",
    });
    return formattedJobOffer;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'offre d'emploi:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors de la récupération de l'offre d'emploi: ${error.message}`,
    });
    setJobOffer(null);
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, jobOffer: false }));
  }
};

export const fetchJobOffers = async (
  setJobOffers,
  setIsLoading,
  setTotalEntries = () => {},
  onError,
  filters = {},
  page = 1,
  pageSize = 10
) => {
  try {
    setIsLoading((prev) => ({ ...prev, jobOffers: true }));

    // Prepare the request body based on the filters
    const requestBody = {
      status: filters.status || "",
      jobTitleKeyword: filters.jobTitleKeyword || "",
      publicationDateMin: filters.publicationDateMin || null,
      publicationDateMax: filters.publicationDateMax || null,
      siteId: filters.siteId || "",
      contractTypeId: filters.contractTypeId || "",
      // Add other filters if needed (e.g., directionId, departmentId, serviceId)
    };

    // Make the POST request
    const endpoint = `/api/JobOffer/search?page=${page}&pageSize=${pageSize}`;
    const response = await apiPost(endpoint, requestBody); // Assume apiPost is a helper function for POST requests

    // Handle the response data
    const jobOffersData = Array.isArray(response.data) ? response.data : [];
    const totalCount = response.totalCount || jobOffersData.length;

    const formattedJobOffers = jobOffersData.map((offer) => ({
      offerId: offer.offerId || "Non spécifié",
      status: offer.status || "Non spécifié",
      publicationDate: offer.publicationDate || "Non spécifié",
      deadlineDate: offer.deadlineDate || "Non spécifié",
      duration: offer.duration || "N/A",
      title: offer.jobDescription?.title || "Non spécifié",
      description: offer.jobDescription?.description || "Non spécifié",
      attributions: offer.jobDescription?.attributions || "Non spécifié",
      requiredEducation: offer.jobDescription?.requiredEducation || "Non spécifié",
      requiredExperience: offer.jobDescription?.requiredExperience || "Non spécifié",
      requiredPersonalQualities: offer.jobDescription?.requiredPersonalQualities || "Non spécifié",
      requiredSkills: offer.jobDescription?.requiredSkills || "Non spécifié",
      requiredLanguages: offer.jobDescription?.requiredLanguages || "Non spécifié",
      createdAt: offer.createdAt || "Non spécifié",
      updatedAt: offer.updatedAt || null,
      recruitmentRequestId: offer.recruitmentRequestId || "Non spécifié",
      siteId: offer.recruitmentRequest?.site?.siteId || "Non spécifié",
      site: {
        siteId: offer.recruitmentRequest?.site?.siteId || "Non spécifié",
        siteName: offer.recruitmentRequest?.site?.siteName || "Non spécifié",
        code: offer.recruitmentRequest?.site?.code || "Non spécifié",
      },
      requester: {
        userId: offer.requester?.userId || "Non spécifié",
        name: offer.requester?.name || "Non spécifié",
        email: offer.requester?.email || "Non spécifié",
        position: offer.requester?.position || "Non spécifié",
        department: offer.requester?.department || "Non spécifié",
      },
      contractType: {
        contractTypeId: offer.recruitmentRequest?.contractType?.contractTypeId || "Non spécifié",
        code: offer.recruitmentRequest?.contractType?.code || "Non spécifié",
        label: offer.recruitmentRequest?.contractType?.label || "Non spécifié",
        createdAt: offer.recruitmentRequest?.contractType?.createdAt || "Non spécifié",
        updatedAt: offer.recruitmentRequest?.contractType?.updatedAt || null,
      },
    }));

    setJobOffers(formattedJobOffers);
    setTotalEntries(totalCount);
  } catch (error) {
    console.error("Erreur lors du chargement des offres d'emploi:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des offres d'emploi: ${error.message}`,
    });
    setJobOffers([]);
  } finally {
    setIsLoading((prev) => ({ ...prev, jobOffers: false }));
  }
};

export const createJobOffer = async (
  jobOfferData,
  setJobOffers,
  setIsLoading = () => {},
  setTotalEntries = () => {},
  onSuccess,
  onError
) => {
  try {
    if (typeof setIsLoading === 'function') {
      setIsLoading((prev) => ({ ...prev, jobOffers: true }));
    }
    const payload = {
      offer: {
        status: jobOfferData.status || "publier",
        publicationDate: jobOfferData.publicationDate || new Date().toISOString(),
        deadlineDate: jobOfferData.deadlineDate || new Date().toISOString(),
        duration: jobOfferData.duration || 12,
        recruitmentRequestId: jobOfferData.recruitmentRequestId || "",
        requesterId: jobOfferData.requesterId || "",
      },
      description: {
        title: jobOfferData.title || "Non spécifié",
        description: jobOfferData.description || "Non spécifié",
        attributions: jobOfferData.attributions || "Non spécifié",
        requiredEducation: jobOfferData.requiredEducation || "Non spécifié",
        requiredExperience: jobOfferData.requiredExperience || "Non spécifié",
        requiredPersonalQualities: jobOfferData.requiredPersonalQualities || "Non spécifié",
        requiredSkills: jobOfferData.requiredSkills || "Non spécifié",
        requiredLanguages: jobOfferData.requiredLanguages || "Non spécifié",
        createdAt: jobOfferData.createdAt || new Date().toISOString(),
        updatedAt: jobOfferData.updatedAt || null,
      },
    };
    const response = await apiPost("/api/JobOffer", payload);
    const formattedJobOffer = {
      offerId: response.id || "Non spécifié",
      status: payload.offer.status,
      publicationDate: payload.offer.publicationDate,
      deadlineDate: payload.offer.deadlineDate,
      duration: payload.offer.duration,
      title: payload.description.title,
      description: payload.description.description,
      attributions: payload.description.attributions,
      requiredEducation: payload.description.requiredEducation,
      requiredExperience: payload.description.requiredExperience,
      requiredPersonalQualities: payload.description.requiredPersonalQualities,
      requiredSkills: payload.description.requiredSkills,
      requiredLanguages: payload.description.requiredLanguages,
      createdAt: payload.description.createdAt,
      updatedAt: payload.description.updatedAt,
      recruitmentRequestId: payload.offer.recruitmentRequestId,
    };
    if (typeof setJobOffers === 'function') {
      setJobOffers((prev) => [...prev, formattedJobOffer]);
    }
    if (typeof setTotalEntries === 'function') {
      setTotalEntries((prev) => prev + 1);
    }
    onSuccess({
      isOpen: true,
      type: "success",
      message: "Offre d'emploi créée avec succès",
    });
    return formattedJobOffer;
  } catch (error) {
    console.error("Erreur lors de la création de l'offre d'emploi:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors de la création de l'offre d'emploi: ${error.message}`,
    });
    throw error;
  } finally {
    if (typeof setIsLoading === 'function') {
      setIsLoading((prev) => ({ ...prev, jobOffers: false }));
    }
  }
};

export const fetchLastThreeNonClosedJobOffers = async (
  setJobOffers,
  setIsLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
) => {
  try {
    setIsLoading((prev) => ({ ...prev, lastThreeNonClosed: true }));
    const data = await apiGet("/api/JobOffer/last-three-non-closed");
    const jobOffersData = Array.isArray(data) ? data : [];
    if (!jobOffersData.length) {
      throw new Error("Aucune offre d'emploi non clôturée trouvée");
    }
    const formattedJobOffers = jobOffersData.map((offer) => ({
      offerId: offer.offerId || "Non spécifié",
      status: offer.status || "Non spécifié",
      publicationDate: offer.publicationDate || "Non spécifié",
      deadlineDate: offer.deadlineDate || "Non spécifié",
      duration: offer.duration || "N/A",
      title: offer.jobDescription?.title || "Non spécifié",
      description: offer.jobDescription?.description || "Non spécifié",
      attributions: offer.jobDescription?.attributions || "Non spécifié",
      requiredEducation: offer.jobDescription?.requiredEducation || "Non spécifié",
      requiredExperience: offer.jobDescription?.requiredExperience || "Non spécifié",
      requiredPersonalQualities: offer.jobDescription?.requiredPersonalQualities || "Non spécifié",
      requiredSkills: offer.jobDescription?.requiredSkills || "Non spécifié",
      requiredLanguages: offer.jobDescription?.requiredLanguages || "Non spécifié",
      createdAt: offer.createdAt || "Non spécifié",
      updatedAt: offer.updatedAt || null,
      recruitmentRequestId: offer.recruitmentRequestId || "Non spécifié",
      requesterId: offer.requesterId || "Non spécifié",
      requester: {
        userId: offer.requester?.userId || "Non spécifié",
        name: offer.requester?.name || "Non spécifié",
        email: offer.requester?.email || "Non spécifié",
        position: offer.requester?.position || "Non spécifié",
        department: offer.requester?.department || "Non spécifié",
      },
      site: {
        siteId: offer.recruitmentRequest?.site?.siteId || "Non spécifié",
        siteName: offer.recruitmentRequest?.site?.siteName || "Non spécifié",
        code: offer.recruitmentRequest?.site?.code || "Non spécifié",
      },
      contractType: {
        contractTypeId: offer.recruitmentRequest?.contractType?.contractTypeId || "Non spécifié",
        code: offer.recruitmentRequest?.contractType?.code || "Non spécifié",
        label: offer.recruitmentRequest?.contractType?.label || "Non spécifié",
        createdAt: offer.recruitmentRequest?.contractType?.createdAt || "Non spécifié",
        updatedAt: offer.recruitmentRequest?.contractType?.updatedAt || null,
      },
    }));
    setJobOffers(formattedJobOffers);
    onSuccess({
      isOpen: true,
      type: "success",
      message: "Dernières offres d'emploi non clôturées récupérées avec succès",
    });
    return formattedJobOffers;
  } catch (error) {
    console.error("Erreur lors de la récupération des dernières offres non clôturées:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors de la récupération des dernières offres non clôturées: ${error.message}`,
    });
    setJobOffers([]);
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, lastThreeNonClosed: false }));
  }
};