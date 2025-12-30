// types/validator.ts
export interface Remplaçant {
    id: string;
    nom: string;
    prenom: string;
    matricule: string;
    ordre: number;
    estActif: boolean;
}

export interface Validateur {
    id: string;
    nom: string;
    prenom: string;
    direction: string;
    poste: string;
    email: string;
    telephone: string;
    matricule: string;
    estActif: boolean;
    dateDebut: string;
    dateFin?: string;
    remplaçants: Remplaçant[];
}