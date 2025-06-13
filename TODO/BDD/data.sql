-- Module 1 : Suivi du recrutement
INSERT INTO departments (department_id, department_name) VALUES
('DEP001', 'Ressources Humaines'),
('DEP002', 'Informatique'),
('DEP003', 'Marketing'),
('DEP004', 'Finance');

INSERT INTO contract_types (contract_type_id, contract_type_name) VALUES
('CT001', 'CDI'),
('CT002', 'CDD'),
('CT003', 'Stage');

INSERT INTO action_type (action_type_id, type) VALUES
('ACT001', 'Création'),
('ACT002', 'Modification'),
('ACT003', 'Suppression'),
('ACT004', 'Archivage');

INSERT INTO users (user_id, name, email, password, role, department_id) VALUES
('USR001', 'Claire Dubois', 'claire.dubois@entreprise.fr', 'motdepasse123', 'RH', 'DEP001'),
('USR002', 'Marc Leroy', 'marc.leroy@entreprise.fr', 'password456', 'Manager', 'DEP002'),
('USR003', 'Sophie Bernard', 'sophie.bernard@entreprise.fr', 'azerty789', 'Manager', 'DEP003'),
('USR004', 'Julien Moreau', 'julien.moreau@entreprise.fr', '123motdepasse', 'RH', 'DEP001');

INSERT INTO approval_flow (approval_flow_id, approval_order, department_id)
VALUES 
('AF001', 1, 'DEP001'),
('AF002', 2, 'DEP002'),
('AF003', 3, 'DEP003');
