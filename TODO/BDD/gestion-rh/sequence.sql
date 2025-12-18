IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_direction_id')
    DROP SEQUENCE seq_direction_id;

CREATE SEQUENCE seq_direction_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_department_id')
    DROP SEQUENCE seq_department_id;

CREATE SEQUENCE seq_department_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_service_id')
    DROP SEQUENCE seq_service_id;

CREATE SEQUENCE seq_service_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_site_id')
    DROP SEQUENCE seq_site_id;

CREATE SEQUENCE seq_site_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_nationality_id')
    DROP SEQUENCE seq_nationality_id;

CREATE SEQUENCE seq_nationality_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_marital_status_id')
    DROP SEQUENCE seq_marital_status_id;

CREATE SEQUENCE seq_marital_status_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_gender_id')
    DROP SEQUENCE seq_gender_id;

CREATE SEQUENCE seq_gender_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_contract_type_id')
    DROP SEQUENCE seq_contract_type_id;

CREATE SEQUENCE seq_contract_type_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_employee_category_id')
    DROP SEQUENCE seq_employee_category_id;


CREATE SEQUENCE seq_employee_category_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_working_time_type_id')
    DROP SEQUENCE seq_working_time_type_id;

CREATE SEQUENCE seq_working_time_type_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_unit_id')
    DROP SEQUENCE seq_unit_id;

CREATE SEQUENCE seq_unit_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_employee_id')
    DROP SEQUENCE seq_employee_id;

CREATE SEQUENCE seq_employee_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_approval_flow_id')
    DROP SEQUENCE seq_approval_flow_id;

CREATE SEQUENCE seq_approval_flow_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_user_id')
    DROP SEQUENCE seq_user_id;

CREATE SEQUENCE seq_user_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_role_id')
    DROP SEQUENCE seq_role_id; -- Corrected: was seq_user_id

CREATE SEQUENCE seq_role_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_habilitation_id')
    DROP SEQUENCE seq_habilitation_id; -- Corrected: was seq_user_id

CREATE SEQUENCE seq_habilitation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_role_habilitation_id')
    DROP SEQUENCE seq_role_habilitation_id; -- Corrected: was seq_user_id

CREATE SEQUENCE seq_role_habilitation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_lieu_id')
    DROP SEQUENCE seq_lieu_id;

CREATE SEQUENCE seq_lieu_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_geo_zone_id')
    DROP SEQUENCE seq_geo_zone_id;

CREATE SEQUENCE seq_geo_zone_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;




IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_id')
    DROP SEQUENCE seq_mission_id;

CREATE SEQUENCE seq_mission_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_type_id')
    DROP SEQUENCE seq_expense_type_id;

CREATE SEQUENCE seq_expense_type_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_compensation_scale_id')
    DROP SEQUENCE seq_compensation_scale_id; -- Corrected: was seq_expense_type_id

CREATE SEQUENCE seq_compensation_scale_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_transport_id')
    DROP SEQUENCE seq_transport_id;

CREATE SEQUENCE seq_transport_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_assignation_id')
    DROP SEQUENCE seq_assignation_id; -- Corrected: was seq_transport_id

CREATE SEQUENCE seq_assignation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_validation_id')
    DROP SEQUENCE seq_mission_validation_id;

CREATE SEQUENCE seq_mission_validation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_budget_id')
    DROP SEQUENCE seq_mission_budget_id; -- Corrected: was seq_mission_validation_id

CREATE SEQUENCE seq_mission_budget_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_report_type_id')
    DROP SEQUENCE seq_expense_report_type_id; -- Corrected: was seq_mission_validation_id

CREATE SEQUENCE seq_expense_report_type_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_report_id')
    DROP SEQUENCE seq_expense_report_id; -- Corrected: was seq_mission_validation_id

CREATE SEQUENCE seq_expense_report_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_report_id')
    DROP SEQUENCE seq_mission_report_id; -- Corrected: was seq_mission_validation_id

CREATE SEQUENCE seq_mission_report_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_log_id')
    DROP SEQUENCE seq_log_id;

CREATE SEQUENCE seq_log_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_comments_id')
    DROP SEQUENCE seq_comments_id;

CREATE SEQUENCE seq_comments_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_notifications_id')
    DROP SEQUENCE seq_notifications_id;

CREATE SEQUENCE seq_notifications_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_compensation_id')
    DROP SEQUENCE seq_compensation_id;

CREATE SEQUENCE seq_compensation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_report')
    DROP SEQUENCE seq_expense_report;

CREATE SEQUENCE seq_expense_report
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_report_attachment')
    DROP SEQUENCE seq_expense_report_attachment;

CREATE SEQUENCE seq_expense_report_attachment
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_report')
    DROP SEQUENCE seq_mission_report;

CREATE SEQUENCE seq_mission_report
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_group_id')
    DROP SEQUENCE seq_group_id;

CREATE SEQUENCE seq_group_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;


IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_prevision_id')
    DROP SEQUENCE seq_prevision_id;

CREATE SEQUENCE seq_prevision_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;




IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_mission_report_attachments')
    DROP SEQUENCE seq_mission_report_attachments;

CREATE SEQUENCE seq_mission_report_attachments
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;




IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_tmp_employee_id')
    DROP SEQUENCE seq_tmp_employee_id;

CREATE SEQUENCE seq_tmp_employee_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_expense_compensation_scale_id')
    DROP SEQUENCE seq_expense_compensation_scale_id;

CREATE SEQUENCE seq_expense_compensation_scale_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



-- RECRUTEMENT
IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_replacement_reason_id')
    DROP SEQUENCE seq_replacement_reason_id;

CREATE SEQUENCE seq_replacement_reason_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_req_status_id')
    DROP SEQUENCE seq_req_status_id;

CREATE SEQUENCE seq_req_status_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_job_status_id')
    DROP SEQUENCE seq_job_status_id;

CREATE SEQUENCE seq_job_status_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_level_education_id')
    DROP SEQUENCE seq_level_education_id;

CREATE SEQUENCE seq_level_education_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_education_id')
    DROP SEQUENCE seq_education_id;

CREATE SEQUENCE seq_education_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_soft_skill_id')
    DROP SEQUENCE seq_soft_skill_id;

CREATE SEQUENCE seq_soft_skill_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_evaluation_type_id')
    DROP SEQUENCE seq_evaluation_type_id;

CREATE SEQUENCE seq_evaluation_type_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_request_id')
    DROP SEQUENCE seq_request_id;

CREATE SEQUENCE seq_request_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_id_site_request')
    DROP SEQUENCE seq_id_site_request;

CREATE SEQUENCE seq_id_site_request
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_request_validation_id')
    DROP SEQUENCE seq_request_validation_id;

CREATE SEQUENCE seq_request_validation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_job_description_id')
    DROP SEQUENCE seq_job_description_id;

CREATE SEQUENCE seq_job_description_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_attribution_id')
    DROP SEQUENCE seq_attribution_id;

CREATE SEQUENCE seq_attribution_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_job_validation_id')
    DROP SEQUENCE seq_job_validation_id;

CREATE SEQUENCE seq_job_validation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_formation_id')
    DROP SEQUENCE seq_formation_id;

CREATE SEQUENCE seq_formation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_experience_id')
    DROP SEQUENCE seq_experience_id;

CREATE SEQUENCE seq_experience_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_job_suitability_id')
    DROP SEQUENCE seq_job_suitability_id;

CREATE SEQUENCE seq_job_suitability_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_skill_id')
    DROP SEQUENCE seq_skill_id;

CREATE SEQUENCE seq_skill_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_candidature_id')
    DROP SEQUENCE seq_candidature_id;

CREATE SEQUENCE seq_candidature_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_evaluation_id')
    DROP SEQUENCE seq_evaluation_id;

CREATE SEQUENCE seq_evaluation_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_test_id')
    DROP SEQUENCE seq_test_id;

CREATE SEQUENCE seq_test_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;



IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_comment_id')
    DROP SEQUENCE seq_comment_id;

CREATE SEQUENCE seq_comment_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;

