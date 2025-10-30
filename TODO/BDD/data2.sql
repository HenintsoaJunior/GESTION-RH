INSERT INTO employees (employee_id, employee_code, last_name, first_name, phone_number, hire_date, job_title, contract_end_date, site_id, gender_id, contract_type_id, direction_id, department_id, service_id, unit_id)
VALUES 
    ('EMP_400', 'ST154', 'RAKOTOARIMANANA', 'Miantsafitia', '038 89 499 77', '2025-05-01', 'Stagiaire RH', '2025-12-31', 'SITE-000001', 'GEN-000001', 'CT-000001', 'DIR-000001', 'DEPT-000001', 'SRV-000001', 'UNT-000001');


INSERT INTO categories_of_employee (employee_id, employee_category_id, created_at, updated_at)
VALUES 
    ('EMP_400', 'EC-000001', '2023-01-10', NULL);


INSERT INTO expense_type (expense_type_id, type, time_start, time_end, created_at, updated_at)
VALUES 
('exp001', 'Petit Déjeuner', '06:30:00', '08:00:00', GETDATE(), GETDATE()),
('exp002', 'Déjeuner',        '12:00:00', '13:30:00', GETDATE(), GETDATE()),
('exp003', 'Dinner',           '18:30:00', '20:00:00', GETDATE(), GETDATE()),
('exp004', 'Hébergement',     '21:00:00', '05:00:00', GETDATE(), GETDATE());

INSERT INTO transport (transport_id, type, created_at, updated_at)
VALUES 
('tr001', 'Voiture', GETDATE(), GETDATE()),
('tr002', 'Avion', GETDATE(), GETDATE());

INSERT INTO compensation_scale (
  compensation_scale_id, amount, created_at, updated_at, 
  transport_id, expense_type_id, employee_category_id
) VALUES 
('comp001', 15000.00, GETDATE(), GETDATE(), 'tr001', NULL, 'EC-000001'),
('comp002', 50000.00, GETDATE(), GETDATE(), 'tr002', NULL, 'EC-000001'),
('comp003', 25000.00, GETDATE(), GETDATE(), NULL, 'exp001', 'EC-000001'),
('comp004', 35000.00, GETDATE(), GETDATE(), NULL, 'exp002', 'EC-000001'),
('comp005', 35000.00, GETDATE(), GETDATE(), NULL, 'exp003', 'EC-000001'),
('comp006', 120000.00, GETDATE(), GETDATE(), NULL, 'exp004', 'EC-000001');
INSERT INTO compensation_scale (
  compensation_scale_id, amount, created_at, updated_at, 
  transport_id, expense_type_id, employee_category_id
) VALUES 
('comp007', 15000.00, GETDATE(), GETDATE(), 'tr001', NULL, 'EC-000002'),
('comp008', 50000.00, GETDATE(), GETDATE(), 'tr002', NULL, 'EC-000002'),
('comp009', 25000.00, GETDATE(), GETDATE(), NULL, 'exp001', 'EC-000002'),
('comp0010', 35000.00, GETDATE(), GETDATE(), NULL, 'exp002', 'EC-000002'),
('comp0011', 35000.00, GETDATE(), GETDATE(), NULL, 'exp003', 'EC-000002'),
('comp0012', 120000.00, GETDATE(), GETDATE(), NULL, 'exp004', 'EC-000002');
INSERT INTO compensation_scale (
  compensation_scale_id, amount, created_at, updated_at, 
  transport_id, expense_type_id, employee_category_id
) VALUES 
('comp0013', 15000.00, GETDATE(), GETDATE(), 'tr001', NULL, 'EC-000003'),
('comp0014', 50000.00, GETDATE(), GETDATE(), 'tr002', NULL, 'EC-000003'),
('comp0015', 25000.00, GETDATE(), GETDATE(), NULL, 'exp001', 'EC-000003'),
('comp0016', 35000.00, GETDATE(), GETDATE(), NULL, 'exp002', 'EC-000003'),
('comp0017', 35000.00, GETDATE(), GETDATE(), NULL, 'exp003', 'EC-000003'),
('comp0018', 120000.00, GETDATE(), GETDATE(), NULL, 'exp004', 'EC-000003');


INSERT INTO expense_report_type (expense_report_type_id, type) 
VALUES 
('ERT001', 'FRAIS DE TRANSPORT/MISSION'),
('ERT002', 'FRAIS DE RESTAURATION/RECEPTION'),
('ERT003', 'AUTRE DEPENSE');