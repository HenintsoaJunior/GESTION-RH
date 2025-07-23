INSERT INTO expense_type (expense_type_id, type, created_at, updated_at)
VALUES 
('exp001', 'Dejeuner', GETDATE(), GETDATE()),
('exp002', 'Hebergement', GETDATE(), GETDATE());


INSERT INTO transport (transport_id, type, created_at, updated_at)
VALUES 
('tr001', 'Voiture', GETDATE(), GETDATE()),
('tr002', 'Avion', GETDATE(), GETDATE());

INSERT INTO compensation_scale (
  compensation_scale_id, amount, created_at, updated_at, 
  transport_id, expense_type_id, employee_category_id
) VALUES 
('comp001', 15000.00, GETDATE(), GETDATE(), 'tr001', 'exp001', 'EC_0003'),
('comp002', 20000.00, GETDATE(), GETDATE(), 'tr002', 'exp002', 'EC_0003'),
('comp003', 20000.00, GETDATE(), GETDATE(), 'tr002', 'exp002', 'EC_0003');
