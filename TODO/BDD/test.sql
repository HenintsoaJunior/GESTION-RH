INSERT INTO job_descriptions (
    description_id, title, description, attributions,
    required_education, required_experience, required_personal_qualities,
    required_skills, required_languages
) VALUES (
    'JD-0001',
    'Acheteur(se)',
    'Négocier des achats de biens et services demandés par les différents Services, Départements et Directions en application de la politique d''achat afin de répondre aux besoins de la Société.',
    'Analyser les besoins et demandes d''achat ; Obtenir des renseignements auprès des requérants ; Négocier avec les fournisseurs ; Gérer le stock et assurer le suivi des livraisons ; Préparer devis, bons de commande et demandes de soumission ; Créer et mettre à jour une base de données fournisseurs ; Effectuer travaux administratifs et rapports.',
    'Baccalauréat +2 en Gestion ou Logistique',
    'Minimum 2 ans d''expériences professionnelles à un poste similaire, idéalement dans une société d''envergure',
    'Rigueur, honnêteté, bonne présentation, langage soigné et poli, ponctualité, dynamisme, flexibilité horaire',
    'Maîtrise de MS Office, techniques de négociation, bonnes connaissances des produits et services, résistance au stress, autonomie, proactivité, esprit d''équipe',
    'Français (oral et écrit), anglais : un atout'
);

INSERT INTO job_offers (
    offer_id, status, publication_date, deadline_date, duration,
    description_id, recruitment_request_id
) VALUES (
    'OFF-0001',
    'Publié',
    '2025-09-17',
    '2025-10-01',
    12,
    'JD-0001',
    'REQ-000069'
);
