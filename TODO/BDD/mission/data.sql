INSERT INTO expense_type (expense_type_id, type, created_at, updated_at)
VALUES 
('exp001', 'Hébergement', GETDATE(), GETDATE()),
('exp002', 'Restauration', GETDATE(), GETDATE());


INSERT INTO transport (transport_id, type, created_at, updated_at)
VALUES 
('tr001', 'Voiture', GETDATE(), GETDATE()),
('tr002', 'Avion', GETDATE(), GETDATE());