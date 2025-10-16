IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_direction_id')
    DROP SEQUENCE seq_direction_id;
GO
CREATE SEQUENCE seq_direction_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_department_id')
    DROP SEQUENCE seq_department_id;
GO
CREATE SEQUENCE seq_department_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_service_id')
    DROP SEQUENCE seq_service_id;
GO
CREATE SEQUENCE seq_service_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_site_id')
    DROP SEQUENCE seq_site_id;
GO
CREATE SEQUENCE seq_site_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_nationality_id')
    DROP SEQUENCE seq_nationality_id;
GO
CREATE SEQUENCE seq_nationality_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_marital_status_id')
    DROP SEQUENCE seq_marital_status_id;
GO
CREATE SEQUENCE seq_marital_status_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_gender_id')
    DROP SEQUENCE seq_gender_id;
GO
CREATE SEQUENCE seq_gender_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_contract_type_id')
    DROP SEQUENCE seq_contract_type_id;
GO
CREATE SEQUENCE seq_contract_type_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_employee_category_id')
    DROP SEQUENCE seq_employee_category_id;
GO

CREATE SEQUENCE seq_employee_category_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_working_time_type_id')
    DROP SEQUENCE seq_working_time_type_id;
GO
CREATE SEQUENCE seq_working_time_type_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_unit_id')
    DROP SEQUENCE seq_unit_id;
GO
CREATE SEQUENCE seq_unit_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_employee_id')
    DROP SEQUENCE seq_employee_id;
GO
CREATE SEQUENCE seq_employee_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_approval_flow_id')
    DROP SEQUENCE seq_approval_flow_id;
GO
CREATE SEQUENCE seq_approval_flow_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_user_id')
    DROP SEQUENCE seq_user_id;
GO
CREATE SEQUENCE seq_user_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_role_id')
    DROP SEQUENCE seq_role_id; -- Corrected: was seq_user_id
GO
CREATE SEQUENCE seq_role_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_habilitation_id')
    DROP SEQUENCE seq_habilitation_id; -- Corrected: was seq_user_id
GO
CREATE SEQUENCE seq_habilitation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_role_habilitation_id')
    DROP SEQUENCE seq_role_habilitation_id; -- Corrected: was seq_user_id
GO
CREATE SEQUENCE seq_role_habilitation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_lieu_id')
    DROP SEQUENCE seq_lieu_id;
GO
CREATE SEQUENCE seq_lieu_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_id')
    DROP SEQUENCE seq_mission_id;
GO
CREATE SEQUENCE seq_mission_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_type_id')
    DROP SEQUENCE seq_expense_type_id;
GO
CREATE SEQUENCE seq_expense_type_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_compensation_scale_id')
    DROP SEQUENCE seq_compensation_scale_id; -- Corrected: was seq_expense_type_id
GO
CREATE SEQUENCE seq_compensation_scale_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_transport_id')
    DROP SEQUENCE seq_transport_id;
GO
CREATE SEQUENCE seq_transport_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_assignation_id')
    DROP SEQUENCE seq_assignation_id; -- Corrected: was seq_transport_id
GO
CREATE SEQUENCE seq_assignation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_validation_id')
    DROP SEQUENCE seq_mission_validation_id;
GO
CREATE SEQUENCE seq_mission_validation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_budget_id')
    DROP SEQUENCE seq_mission_budget_id; -- Corrected: was seq_mission_validation_id
GO
CREATE SEQUENCE seq_mission_budget_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_report_type_id')
    DROP SEQUENCE seq_expense_report_type_id; -- Corrected: was seq_mission_validation_id
GO
CREATE SEQUENCE seq_expense_report_type_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_report_id')
    DROP SEQUENCE seq_expense_report_id; -- Corrected: was seq_mission_validation_id
GO
CREATE SEQUENCE seq_expense_report_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_report_id')
    DROP SEQUENCE seq_mission_report_id; -- Corrected: was seq_mission_validation_id
GO
CREATE SEQUENCE seq_mission_report_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_log_id')
    DROP SEQUENCE seq_log_id;
GO
CREATE SEQUENCE seq_log_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_comments_id')
    DROP SEQUENCE seq_comments_id;
GO
CREATE SEQUENCE seq_comments_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_notifications_id')
    DROP SEQUENCE seq_notifications_id;
GO
CREATE SEQUENCE seq_notifications_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_compensation_id')
    DROP SEQUENCE seq_compensation_id;
GO
CREATE SEQUENCE seq_compensation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_report')
    DROP SEQUENCE seq_expense_report;
GO
CREATE SEQUENCE seq_expense_report
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_report_attachment')
    DROP SEQUENCE seq_expense_report_attachment;
GO
CREATE SEQUENCE seq_expense_report_attachment
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_report')
    DROP SEQUENCE seq_mission_report;
GO
CREATE SEQUENCE seq_mission_report
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_group_id')
    DROP SEQUENCE seq_group_id;
GO
CREATE SEQUENCE seq_group_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO





