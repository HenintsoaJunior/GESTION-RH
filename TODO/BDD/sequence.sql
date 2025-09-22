-- Drop sequences if they exist
IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_direction_id')
    DROP SEQUENCE seq_direction_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_department_id')
    DROP SEQUENCE seq_department_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_service_id')
    DROP SEQUENCE seq_service_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_site_id')
    DROP SEQUENCE seq_site_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_nationality_id')
    DROP SEQUENCE seq_nationality_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_marital_status_id')
    DROP SEQUENCE seq_marital_status_id;
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

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_working_time_type_id')
    DROP SEQUENCE seq_working_time_type_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_unit_id')
    DROP SEQUENCE seq_unit_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_recruitment_reason_id')
    DROP SEQUENCE seq_recruitment_reason_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_replacement_reason_id')
    DROP SEQUENCE seq_replacement_reason_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_recruitment_request_id')
    DROP SEQUENCE seq_recruitment_request_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_employee_id')
    DROP SEQUENCE seq_employee_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_recruitment_request_detail_id')
    DROP SEQUENCE seq_recruitment_request_detail_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_recruitment_validation_id')
    DROP SEQUENCE seq_recruitment_validation_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_approval_flow_id')
    DROP SEQUENCE seq_approval_flow_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_user_id')
    DROP SEQUENCE seq_user_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_role_id')
    DROP SEQUENCE seq_user_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_habilitation_id')
    DROP SEQUENCE seq_user_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_role_habilitation_id')
    DROP SEQUENCE seq_user_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_candidate_id')
    DROP SEQUENCE seq_user_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_job_description_id')
    DROP SEQUENCE seq_user_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_job_offer_id')
    DROP SEQUENCE seq_user_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_application_id')
    DROP SEQUENCE seq_user_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_application_comment_id')
    DROP SEQUENCE seq_user_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_comments_id')
    DROP SEQUENCE seq_user_id;
GO
    

-- Create sequences
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

CREATE SEQUENCE seq_marital_status_id
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

CREATE SEQUENCE seq_working_time_type_id
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

CREATE SEQUENCE seq_recruitment_reason_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_replacement_reason_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_recruitment_request_id
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

CREATE SEQUENCE seq_recruitment_request_detail_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_recruitment_validation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO


CREATE SEQUENCE seq_comments_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO
 

CREATE SEQUENCE seq_approval_flow_id
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

CREATE SEQUENCE seq_role_habilitation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_candidate_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_job_description_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_job_offer_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_application_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_application_comment_id
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

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_id')
    DROP SEQUENCE seq_mission_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_type_id')
    DROP SEQUENCE seq_expense_type_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_compensation_scale_id')
    DROP SEQUENCE seq_expense_type_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_transport_id')
    DROP SEQUENCE seq_transport_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_assignation_id')
    DROP SEQUENCE seq_transport_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_validation_id')
    DROP SEQUENCE seq_mission_validation_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_budget_id')
    DROP SEQUENCE seq_mission_validation_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_report_type_id')
    DROP SEQUENCE seq_mission_validation_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_report_id')
    DROP SEQUENCE seq_mission_validation_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_report_id')
    DROP SEQUENCE seq_mission_validation_id;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_log_id')
    DROP SEQUENCE seq_log_id;
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



CREATE SEQUENCE seq_expense_type_id
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

CREATE SEQUENCE seq_transport_id
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

CREATE SEQUENCE seq_mission_budget_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_expense_report_type_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_expense_report_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

CREATE SEQUENCE seq_mission_report_id
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



-- ============================
-- User Simple
-- ============================

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_user_simple_id')
    DROP SEQUENCE seq_user_simple_id;
GO


CREATE SEQUENCE seq_user_simple_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_education_id')
    DROP SEQUENCE seq_education_id;
GO


CREATE SEQUENCE seq_education_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_experience_id')
    DROP SEQUENCE seq_experience_id;
GO


CREATE SEQUENCE seq_experience_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_skill_id')
    DROP SEQUENCE seq_skill_id;
GO


CREATE SEQUENCE seq_skill_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_quality_id')
    DROP SEQUENCE seq_quality_id;
GO


CREATE SEQUENCE seq_quality_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_language_id')
    DROP SEQUENCE seq_language_id;
GO


CREATE SEQUENCE seq_language_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO