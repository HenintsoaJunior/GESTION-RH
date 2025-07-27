INSERT INTO lieu (lieu_id, nom, adresse, ville, code_postal, pays, created_at, updated_at) VALUES
('1', 'Analamanga', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('2', 'Bongolava', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('3', 'Itasy', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('4', 'Vakinankaratra', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('5', 'Diana', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('6', 'Sava', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('7', 'Amoron''i Mania', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('8', 'Atsimo-Atsinanana', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('9', 'Haute Matsiatra', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('10', 'Ihorombe', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('11', 'Fitovinany', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('12', 'Vatovavy', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('13', 'Betsiboka', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('14', 'Boeny', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('15', 'Melaky', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('16', 'Sofia', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('17', 'Alaotra-Mangoro', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('18', 'Analanjirofo', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('19', 'Atsinanana', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('20', 'Androy', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('21', 'Anosy', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('22', 'Atsimo-Andrefana', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('23', 'Menabe', '', '', '', 'Madagascar', GETDATE(), GETDATE()),
('24', 'Nosy Be', '', '', '', 'Madagascar', GETDATE(), GETDATE());


INSERT INTO expense_type (expense_type_id, type, time_start, time_end, created_at, updated_at)
VALUES 
('exp001', 'Petit Déjeuner', '06:30:00', '08:00:00', GETDATE(), GETDATE()),
('exp002', 'Déjeuner',        '12:00:00', '13:30:00', GETDATE(), GETDATE()),
('exp003', 'Diner',           '18:30:00', '20:00:00', GETDATE(), GETDATE()),
('exp004', 'Hébergement',     '21:00:00', '06:00:00', GETDATE(), GETDATE());


INSERT INTO transport (transport_id, type, created_at, updated_at)
VALUES 
('tr001', 'Voiture', GETDATE(), GETDATE());

INSERT INTO compensation_scale (
  compensation_scale_id, amount, created_at, updated_at, 
  transport_id, expense_type_id, employee_category_id
) VALUES 
('comp001', 15000.00, GETDATE(), GETDATE(), 'tr001', NULL, 'EC_0001'),
/*('comp002', 50000.00, GETDATE(), GETDATE(), 'tr002', NULL, 'EC_0001'),*/
('comp003', 25000.00, GETDATE(), GETDATE(), NULL, 'exp001', 'EC_0001'),
('comp004', 35000.00, GETDATE(), GETDATE(), NULL, 'exp002', 'EC_0001'),
('comp005', 35000.00, GETDATE(), GETDATE(), NULL, 'exp003', 'EC_0001'),
('comp006', 120000.00, GETDATE(), GETDATE(), NULL, 'exp004', 'EC_0001');


INSERT INTO compensation_scale (
  compensation_scale_id, amount, created_at, updated_at, 
  transport_id, expense_type_id, employee_category_id
) VALUES 
('comp007', 15000.00, GETDATE(), GETDATE(), 'tr001', NULL, 'EC_0002'),
/*('comp008', 50000.00, GETDATE(), GETDATE(), 'tr002', NULL, 'EC_0002'),*/
('comp009', 25000.00, GETDATE(), GETDATE(), NULL, 'exp001', 'EC_0002'),
('comp0010', 35000.00, GETDATE(), GETDATE(), NULL, 'exp002', 'EC_0002'),
('comp0011', 35000.00, GETDATE(), GETDATE(), NULL, 'exp003', 'EC_0002'),
('comp0012', 120000.00, GETDATE(), GETDATE(), NULL, 'exp004', 'EC_0002');


INSERT INTO compensation_scale (
  compensation_scale_id, amount, created_at, updated_at, 
  transport_id, expense_type_id, employee_category_id
) VALUES 
('comp0013', 15000.00, GETDATE(), GETDATE(), 'tr001', NULL, 'EC_0003'),
/*('comp0014', 50000.00, GETDATE(), GETDATE(), 'tr002', NULL, 'EC_0003'),*/
('comp0015', 25000.00, GETDATE(), GETDATE(), NULL, 'exp001', 'EC_0003'),
('comp0016', 35000.00, GETDATE(), GETDATE(), NULL, 'exp002', 'EC_0003'),
('comp0017', 35000.00, GETDATE(), GETDATE(), NULL, 'exp003', 'EC_0003'),
('comp0018', 120000.00, GETDATE(), GETDATE(), NULL, 'exp004', 'EC_0003');



INSERT INTO mission (mission_id, name, description, start_date, status, lieu_id, created_at, updated_at)
VALUES
-- 1 à 120
('MIS001', 'Mission 1', 'Description de la mission 1', '2025-08-01', 'En Cours', '1', GETDATE(), GETDATE()),
('MIS002', 'Mission 2', 'Description de la mission 2', '2025-08-02', 'En Cours', '2', GETDATE(), GETDATE()),
('MIS003', 'Mission 3', 'Description de la mission 3', '2025-08-03', 'En Cours', '3', GETDATE(), GETDATE()),
('MIS004', 'Mission 4', 'Description de la mission 4', '2025-08-04', 'En Cours', '4', GETDATE(), GETDATE()),
('MIS005', 'Mission 5', 'Description de la mission 5', '2025-08-05', 'En Cours', '5', GETDATE(), GETDATE()),
('MIS006', 'Mission 6', 'Description de la mission 6', '2025-08-06', 'En Cours', '6', GETDATE(), GETDATE()),
('MIS007', 'Mission 7', 'Description de la mission 7', '2025-08-07', 'En Cours', '7', GETDATE(), GETDATE()),
('MIS008', 'Mission 8', 'Description de la mission 8', '2025-08-08', 'En Cours', '8', GETDATE(), GETDATE()),
('MIS009', 'Mission 9', 'Description de la mission 9', '2025-08-09', 'En Cours', '9', GETDATE(), GETDATE()),
('MIS010', 'Mission 10', 'Description de la mission 10', '2025-08-09', 'En Cours', '9', GETDATE(), GETDATE()),
('MIS011', 'Mission 11', 'Description de la mission 11', '2025-08-09', 'En Cours', '9', GETDATE(), GETDATE()),
('MIS012', 'Mission 12', 'Description de la mission 12', '2025-08-09', 'En Cours', '9', GETDATE(), GETDATE());
