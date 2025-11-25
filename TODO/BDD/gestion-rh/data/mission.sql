

INSERT INTO expense_type (expense_type_id, type, time_start, time_end, created_at, updated_at)
VALUES 
('exp001', 'Petit Déjeuner', '06:30:00', '08:00:00', GETDATE(), GETDATE()),
('exp002', 'Déjeuner',        '12:00:00', '13:30:00', GETDATE(), GETDATE()),
('exp003', 'Dinner',           '18:30:00', '20:00:00', GETDATE(), GETDATE()),
('exp004', 'Hébergement',     '21:00:00', '05:00:00', GETDATE(), GETDATE()),
('exp005', 'Communication',     NULL, NULL, GETDATE(), GETDATE()),
('exp006', 'Visa sur place',     NULL, NULL, GETDATE(), GETDATE()),
('exp007', 'Frais médicaux',     NULL, NULL, GETDATE(), GETDATE()),
('exp008', 'Taxes',     NULL, NULL, GETDATE(), GETDATE()),
('exp009', 'Transport',     NULL, NULL, GETDATE(), GETDATE());
  
INSERT INTO transport (transport_id, type, created_at, updated_at)
VALUES 
('tr001', 'Voiture', GETDATE(), GETDATE()),
('tr002', 'Avion', GETDATE(), GETDATE());

INSERT INTO compensation_scale (
  compensation_scale_id, amount, created_at, updated_at, 
  transport_id, expense_type_id
) VALUES 
('comp001', 15000.00, GETDATE(), GETDATE(), 'tr001', NULL),
('comp002', 50000.00, GETDATE(), GETDATE(), 'tr002', NULL),
('comp003', 25000.00, GETDATE(), GETDATE(), NULL, 'exp001'),
('comp004', 35000.00, GETDATE(), GETDATE(), NULL, 'exp002'),
('comp005', 35000.00, GETDATE(), GETDATE(), NULL, 'exp003'),
('comp006', 120000.00, GETDATE(), GETDATE(), NULL, 'exp004');



INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp009', 34.0, GETDATE(), GETDATE(), 'exp009', '1');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp010', 45.0, GETDATE(), GETDATE(), 'exp009', '2');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp011', 34.0, GETDATE(), GETDATE(), 'exp009', '3');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp012', 45.0, GETDATE(), GETDATE(), 'exp009', '4');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp013', 34.0, GETDATE(), GETDATE(), 'exp009', '5');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp014', 34.0, GETDATE(), GETDATE(), 'exp009', '6');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp015', 34.0, GETDATE(), GETDATE(), 'exp009', '7');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp016', 34.0, GETDATE(), GETDATE(), 'exp009', '8');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp017', 34.0, GETDATE(), GETDATE(), 'exp009', '9');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp018', 34.0, GETDATE(), GETDATE(), 'exp009', '10');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp019', 34.0, GETDATE(), GETDATE(), 'exp009', '11');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp020', 34.0, GETDATE(), GETDATE(), 'exp009', '12');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp021', 34.0, GETDATE(), GETDATE(), 'exp009', '13');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp022', 34.0, GETDATE(), GETDATE(), 'exp009', '14');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp023', 34.0, GETDATE(), GETDATE(), 'exp009', '15');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp024', 34.0, GETDATE(), GETDATE(), 'exp009', '16');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp025', 34.0, GETDATE(), GETDATE(), 'exp009', '17');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp026', 34.0, GETDATE(), GETDATE(), 'exp009', '18');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp027', 34.0, GETDATE(), GETDATE(), 'exp009', '19');

INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp028', 10.0, GETDATE(), GETDATE(), 'exp001', '1');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp029', 20.0, GETDATE(), GETDATE(), 'exp001', '2');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp030', 10.0, GETDATE(), GETDATE(), 'exp001', '3');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp031', 20.0, GETDATE(), GETDATE(), 'exp001', '4');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp032', 10.0, GETDATE(), GETDATE(), 'exp001', '5');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp033', 10.0, GETDATE(), GETDATE(), 'exp001', '6');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp034', 10.0, GETDATE(), GETDATE(), 'exp001', '7');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp035', 10.0, GETDATE(), GETDATE(), 'exp001', '8');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp036', 10.0, GETDATE(), GETDATE(), 'exp001', '9');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp037', 10.0, GETDATE(), GETDATE(), 'exp001', '10');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp038', 10.0, GETDATE(), GETDATE(), 'exp001', '11');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp039', 10.0, GETDATE(), GETDATE(), 'exp001', '12');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp040', 10.0, GETDATE(), GETDATE(), 'exp001', '13');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp041', 10.0, GETDATE(), GETDATE(), 'exp001', '14');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp042', 10.0, GETDATE(), GETDATE(), 'exp001', '15');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp043', 10.0, GETDATE(), GETDATE(), 'exp001', '16');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp044', 10.0, GETDATE(), GETDATE(), 'exp001', '17');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp045', 10.0, GETDATE(), GETDATE(), 'exp001', '18');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp046', 10.0, GETDATE(), GETDATE(), 'exp001', '19');

INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp047', 20.0, GETDATE(), GETDATE(), 'exp002', '1');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp048', 30.0, GETDATE(), GETDATE(), 'exp002', '2');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp049', 20.0, GETDATE(), GETDATE(), 'exp002', '3');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp050', 30.0, GETDATE(), GETDATE(), 'exp002', '4');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp051', 20.0, GETDATE(), GETDATE(), 'exp002', '5');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp052', 20.0, GETDATE(), GETDATE(), 'exp002', '6');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp053', 20.0, GETDATE(), GETDATE(), 'exp002', '7');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp054', 20.0, GETDATE(), GETDATE(), 'exp002', '8');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp055', 20.0, GETDATE(), GETDATE(), 'exp002', '9');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp056', 20.0, GETDATE(), GETDATE(), 'exp002', '10');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp057', 20.0, GETDATE(), GETDATE(), 'exp002', '11');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp058', 20.0, GETDATE(), GETDATE(), 'exp002', '12');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp059', 20.0, GETDATE(), GETDATE(), 'exp002', '13');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp060', 20.0, GETDATE(), GETDATE(), 'exp002', '14');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp061', 20.0, GETDATE(), GETDATE(), 'exp002', '15');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp062', 20.0, GETDATE(), GETDATE(), 'exp002', '16');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp063', 20.0, GETDATE(), GETDATE(), 'exp002', '17');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp064', 20.0, GETDATE(), GETDATE(), 'exp002', '18');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp065', 20.0, GETDATE(), GETDATE(), 'exp002', '19');

INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp066', 20.0, GETDATE(), GETDATE(), 'exp003', '1');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp067', 40.0, GETDATE(), GETDATE(), 'exp003', '2');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp068', 20.0, GETDATE(), GETDATE(), 'exp003', '3');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp069', 40.0, GETDATE(), GETDATE(), 'exp003', '4');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp070', 20.0, GETDATE(), GETDATE(), 'exp003', '5');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp071', 20.0, GETDATE(), GETDATE(), 'exp003', '6');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp072', 20.0, GETDATE(), GETDATE(), 'exp003', '7');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp073', 20.0, GETDATE(), GETDATE(), 'exp003', '8');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp074', 20.0, GETDATE(), GETDATE(), 'exp003', '9');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp075', 20.0, GETDATE(), GETDATE(), 'exp003', '10');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp076', 20.0, GETDATE(), GETDATE(), 'exp003', '11');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp077', 20.0, GETDATE(), GETDATE(), 'exp003', '12');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp078', 20.0, GETDATE(), GETDATE(), 'exp003', '13');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp079', 20.0, GETDATE(), GETDATE(), 'exp003', '14');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp080', 20.0, GETDATE(), GETDATE(), 'exp003', '15');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp081', 20.0, GETDATE(), GETDATE(), 'exp003', '16');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp082', 20.0, GETDATE(), GETDATE(), 'exp003', '17');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp083', 20.0, GETDATE(), GETDATE(), 'exp003', '18');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp084', 20.0, GETDATE(), GETDATE(), 'exp003', '19');

INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp085', 150.0, GETDATE(), GETDATE(), 'exp004', '1');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp086', 200.0, GETDATE(), GETDATE(), 'exp004', '2');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp087', 150.0, GETDATE(), GETDATE(), 'exp004', '3');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp088', 200.0, GETDATE(), GETDATE(), 'exp004', '4');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp089', 150.0, GETDATE(), GETDATE(), 'exp004', '5');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp090', 150.0, GETDATE(), GETDATE(), 'exp004', '6');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp091', 150.0, GETDATE(), GETDATE(), 'exp004', '7');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp092', 150.0, GETDATE(), GETDATE(), 'exp004', '8');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp093', 150.0, GETDATE(), GETDATE(), 'exp004', '9');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp094', 150.0, GETDATE(), GETDATE(), 'exp004', '10');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp095', 150.0, GETDATE(), GETDATE(), 'exp004', '11');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp096', 150.0, GETDATE(), GETDATE(), 'exp004', '12');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp097', 150.0, GETDATE(), GETDATE(), 'exp004', '13');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp098', 150.0, GETDATE(), GETDATE(), 'exp004', '14');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp099', 150.0, GETDATE(), GETDATE(), 'exp004', '15');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp100', 150.0, GETDATE(), GETDATE(), 'exp004', '16');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp101', 150.0, GETDATE(), GETDATE(), 'exp004', '17');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp102', 150.0, GETDATE(), GETDATE(), 'exp004', '18');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp103', 150.0, GETDATE(), GETDATE(), 'exp004', '19');

INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp104', 50.0, GETDATE(), GETDATE(), 'exp005', '1');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp105', 50.0, GETDATE(), GETDATE(), 'exp005', '2');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp106', 50.0, GETDATE(), GETDATE(), 'exp005', '3');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp107', 50.0, GETDATE(), GETDATE(), 'exp005', '4');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp108', 50.0, GETDATE(), GETDATE(), 'exp005', '5');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp109', 50.0, GETDATE(), GETDATE(), 'exp005', '6');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp110', 50.0, GETDATE(), GETDATE(), 'exp005', '7');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp111', 50.0, GETDATE(), GETDATE(), 'exp005', '8');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp112', 50.0, GETDATE(), GETDATE(), 'exp005', '9');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp113', 50.0, GETDATE(), GETDATE(), 'exp005', '10');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp114', 50.0, GETDATE(), GETDATE(), 'exp005', '11');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp115', 50.0, GETDATE(), GETDATE(), 'exp005', '12');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp116', 50.0, GETDATE(), GETDATE(), 'exp005', '13');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp117', 50.0, GETDATE(), GETDATE(), 'exp005', '14');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp118', 50.0, GETDATE(), GETDATE(), 'exp005', '15');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp119', 50.0, GETDATE(), GETDATE(), 'exp005', '16');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp120', 50.0, GETDATE(), GETDATE(), 'exp005', '17');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp121', 50.0, GETDATE(), GETDATE(), 'exp005', '18');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp122', 50.0, GETDATE(), GETDATE(), 'exp005', '19');

INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp123', 500.0, GETDATE(), GETDATE(), 'exp006', '1');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp124', 500.0, GETDATE(), GETDATE(), 'exp006', '2');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp125', 500.0, GETDATE(), GETDATE(), 'exp006', '3');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp126', 500.0, GETDATE(), GETDATE(), 'exp006', '4');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp127', 500.0, GETDATE(), GETDATE(), 'exp006', '5');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp128', 500.0, GETDATE(), GETDATE(), 'exp006', '6');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp129', 500.0, GETDATE(), GETDATE(), 'exp006', '7');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp130', 500.0, GETDATE(), GETDATE(), 'exp006', '8');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp131', 500.0, GETDATE(), GETDATE(), 'exp006', '9');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp132', 500.0, GETDATE(), GETDATE(), 'exp006', '10');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp133', 500.0, GETDATE(), GETDATE(), 'exp006', '11');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp134', 500.0, GETDATE(), GETDATE(), 'exp006', '12');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp135', 500.0, GETDATE(), GETDATE(), 'exp006', '13');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp136', 500.0, GETDATE(), GETDATE(), 'exp006', '14');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp137', 500.0, GETDATE(), GETDATE(), 'exp006', '15');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp138', 500.0, GETDATE(), GETDATE(), 'exp006', '16');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp139', 500.0, GETDATE(), GETDATE(), 'exp006', '17');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp140', 500.0, GETDATE(), GETDATE(), 'exp006', '18');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp141', 500.0, GETDATE(), GETDATE(), 'exp006', '19');

INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp142', 200.0, GETDATE(), GETDATE(), 'exp007', '1');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp143', 200.0, GETDATE(), GETDATE(), 'exp007', '2');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp144', 200.0, GETDATE(), GETDATE(), 'exp007', '3');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp145', 200.0, GETDATE(), GETDATE(), 'exp007', '4');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp146', 200.0, GETDATE(), GETDATE(), 'exp007', '5');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp147', 200.0, GETDATE(), GETDATE(), 'exp007', '6');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp148', 200.0, GETDATE(), GETDATE(), 'exp007', '7');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp149', 200.0, GETDATE(), GETDATE(), 'exp007', '8');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp150', 200.0, GETDATE(), GETDATE(), 'exp007', '9');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp151', 200.0, GETDATE(), GETDATE(), 'exp007', '10');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp152', 200.0, GETDATE(), GETDATE(), 'exp007', '11');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp153', 200.0, GETDATE(), GETDATE(), 'exp007', '12');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp154', 200.0, GETDATE(), GETDATE(), 'exp007', '13');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp155', 200.0, GETDATE(), GETDATE(), 'exp007', '14');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp156', 200.0, GETDATE(), GETDATE(), 'exp007', '15');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp157', 200.0, GETDATE(), GETDATE(), 'exp007', '16');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp158', 200.0, GETDATE(), GETDATE(), 'exp007', '17');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp159', 200.0, GETDATE(), GETDATE(), 'exp007', '18');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp160', 200.0, GETDATE(), GETDATE(), 'exp007', '19');


INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp161', 5.0, GETDATE(), GETDATE(), 'exp008', '1');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp162', 5.0, GETDATE(), GETDATE(), 'exp008', '2');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp163', 5.0, GETDATE(), GETDATE(), 'exp008', '3');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp164', 5.0, GETDATE(), GETDATE(), 'exp008', '4');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp165', 5.0, GETDATE(), GETDATE(), 'exp008', '5');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp166', 5.0, GETDATE(), GETDATE(), 'exp008', '6');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp167', 5.0, GETDATE(), GETDATE(), 'exp008', '7');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp168', 5.0, GETDATE(), GETDATE(), 'exp008', '8');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp169', 5.0, GETDATE(), GETDATE(), 'exp008', '9');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp170', 5.0, GETDATE(), GETDATE(), 'exp008', '10');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp171', 5.0, GETDATE(), GETDATE(), 'exp008', '11');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp172', 5.0, GETDATE(), GETDATE(), 'exp008', '12');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp173', 5.0, GETDATE(), GETDATE(), 'exp008', '13');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp174', 5.0, GETDATE(), GETDATE(), 'exp008', '14');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp175', 5.0, GETDATE(), GETDATE(), 'exp008', '15');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp176', 5.0, GETDATE(), GETDATE(), 'exp008', '16');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp177', 5.0, GETDATE(), GETDATE(), 'exp008', '17');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp178', 5.0, GETDATE(), GETDATE(), 'exp008', '18');
INSERT INTO expense_compensation_scale (expense_compensation_scale_id, amount, created_at, updated_at, expense_type_id, zone_id) VALUES ('ex_comp179', 5.0, GETDATE(), GETDATE(), 'exp008', '19');




INSERT INTO expense_report_type (expense_report_type_id, type) 
VALUES 
('ERT001', 'FRAIS DE TRANSPORT/MISSION'),
('ERT002', 'FRAIS DE RESTAURATION/RECEPTION'),
('ERT003', 'AUTRE DEPENSE');