IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_direction_id')
    DROP SEQUENCE seq_direction_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_department_id')
    DROP SEQUENCE seq_department_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_service_id')
    DROP SEQUENCE seq_service_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_unit_id')
    DROP SEQUENCE seq_unit_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_site_id')
    DROP SEQUENCE seq_site_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_nationality_id')
    DROP SEQUENCE seq_nationality_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_gender_id')
    DROP SEQUENCE seq_gender_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_contract_type_id')
    DROP SEQUENCE seq_contract_type_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_employee_category_id')
    DROP SEQUENCE seq_employee_category_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_employee_id')
    DROP SEQUENCE seq_employee_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_user_id')
    DROP SEQUENCE seq_user_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_role_id')
    DROP SEQUENCE seq_role_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_habilitation_id')
    DROP SEQUENCE seq_habilitation_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_type_id')
    DROP SEQUENCE seq_expense_type_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_transport_id')
    DROP SEQUENCE seq_transport_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_compensation_scale_id')
    DROP SEQUENCE seq_compensation_scale_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_lieu_id')
    DROP SEQUENCE seq_lieu_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_id')
    DROP SEQUENCE seq_mission_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_assignation_id')
    DROP SEQUENCE seq_assignation_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_validation_id')
    DROP SEQUENCE seq_mission_validation_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_log_id')
    DROP SEQUENCE seq_log_id;
GO

CREATE SEQUENCE seq_direction_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_department_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_service_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_unit_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_site_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_nationality_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_gender_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_contract_type_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_employee_category_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_employee_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_user_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_role_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_habilitation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_expense_type_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_transport_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_compensation_scale_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_lieu_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_mission_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_assignation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_mission_validation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_log_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO