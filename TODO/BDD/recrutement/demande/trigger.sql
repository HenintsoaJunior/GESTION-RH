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

IF EXISTS (SELECT * FROM sys.sequences WHERE name = 'seq_approval_flow_id')
    DROP SEQUENCE seq_approval_flow_id;
GO

-- Drop triggers if they exist
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_direction' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_direction;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_department' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_department;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_service' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_service;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_site' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_site;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_nationalities' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_nationalities;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_marital_statuses' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_marital_statuses;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_genders' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_genders;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_contract_types' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_contract_types;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_employee_categories' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_employee_categories;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_working_time_types' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_working_time_types;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_units' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_units;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_recruitment_reasons' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_recruitment_reasons;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_replacement_reasons' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_replacement_reasons;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_recruitment_requests' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_recruitment_requests;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_employees' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_employees;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_recruitment_request_details' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_recruitment_request_details;
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_insert_approval_flow' AND parent_class_desc = 'OBJECT_OR_COLUMN')
    DROP TRIGGER trg_insert_approval_flow;
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

CREATE SEQUENCE seq_approval_flow_id
    AS INT
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO CYCLE
    CACHE 50;
GO

-- Create triggers
CREATE TRIGGER trg_insert_direction
ON direction
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO direction (direction_id, direction_name, acronym, created_at, updated_at)
    SELECT 
        'DR_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_direction_id AS VARCHAR(4)), 4),
        direction_name,
        acronym,
        ISNULL(created_at, CURRENT_TIMESTAMP),
        ISNULL(updated_at, CURRENT_TIMESTAMP)
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_department
ON department
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO department (department_id, department_name, created_at, updated_at, direction_id)
    SELECT 
        'DP_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_department_id AS VARCHAR(4)), 4),
        department_name,
        ISNULL(created_at, CURRENT_TIMESTAMP),
        ISNULL(updated_at, CURRENT_TIMESTAMP),
        direction_id
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_service
ON service
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO service (service_id, service_name, created_at, updated_at, department_id)
    SELECT 
        'SR_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_service_id AS VARCHAR(4)), 4),
        service_name,
        ISNULL(created_at, CURRENT_TIMESTAMP),
        ISNULL(updated_at, CURRENT_TIMESTAMP),
        department_id
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_site
ON site
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO site (site_id, site_name, code, longitude, latitude, created_at, updated_at)
    SELECT 
        'ST_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_site_id AS VARCHAR(4)), 4),
        site_name,
        code,
        longitude,
        latitude,
        ISNULL(created_at, CURRENT_TIMESTAMP),
        ISNULL(updated_at, CURRENT_TIMESTAMP)
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_nationalities
ON nationalities
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO nationalities (nationality_id, code, name)
    SELECT 
        'NAT_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_nationality_id AS VARCHAR(4)), 4),
        code,
        name
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_marital_statuses
ON marital_statuses
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO marital_statuses (marital_status_id, code, label)
    SELECT 
        'MS_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_marital_status_id AS VARCHAR(4)), 4),
        code,
        label
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_genders
ON genders
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO genders (gender_id, code, label)
    SELECT 
        'GEN_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_gender_id AS VARCHAR(4)), 4),
        code,
        label
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_contract_types
ON contract_types
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO contract_types (contract_type_id, code, label)
    SELECT 
        'CT_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_contract_type_id AS VARCHAR(4)), 4),
        code,
        label
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_employee_categories
ON employee_categories
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO employee_categories (employee_category_id, code, label)
    SELECT 
        'EC_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_employee_category_id AS VARCHAR(4)), 4),
        code,
        label
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_working_time_types
ON working_time_types
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO working_time_types (working_time_type_id, code, label)
    SELECT 
        'WTT_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_working_time_type_id AS VARCHAR(4)), 4),
        code,
        label
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_units
ON units
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO units (unit_id, unit_name, created_at, updated_at, service_id)
    SELECT 
        'UN_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_unit_id AS VARCHAR(4)), 4),
        unit_name,
        ISNULL(created_at, CURRENT_TIMESTAMP),
        ISNULL(updated_at, CURRENT_TIMESTAMP),
        service_id
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_recruitment_reasons
ON recruitment_reasons
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO recruitment_reasons (recruitment_reason_id, name, created_at, updated_at)
    SELECT 
        'RR_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_recruitment_reason_id AS VARCHAR(4)), 4),
        name,
        ISNULL(created_at, CURRENT_TIMESTAMP),
        ISNULL(updated_at, CURRENT_TIMESTAMP)
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_replacement_reasons
ON replacement_reasons
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO replacement_reasons (replacement_reason_id, name, created_at, updated_at)
    SELECT 
        'RPR_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_replacement_reason_id AS VARCHAR(4)), 4),
        name,
        ISNULL(created_at, CURRENT_TIMESTAMP),
        ISNULL(updated_at, CURRENT_TIMESTAMP)
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_recruitment_requests
ON recruitment_requests
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO recruitment_requests (
        recruitment_request_id,
        position_title,
        position_count,
        contract_duration,
        former_employee_name,
        replacement_date,
        new_position_explanation,
        desired_start_date,
        created_at,
        updated_at,
        status,
        files,
        recruitment_reason_id,
        site_id,
        contract_type_id
    )
    SELECT 
        'RRQ_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_recruitment_request_id AS VARCHAR(4)), 4),
        position_title,
        position_count,
        contract_duration,
        former_employee_name,
        replacement_date,
        new_position_explanation,
        desired_start_date,
        ISNULL(created_at, CURRENT_TIMESTAMP),
        ISNULL(updated_at, CURRENT_TIMESTAMP),
        status,
        files,
        recruitment_reason_id,
        site_id,
        contract_type_id
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_employees
ON employees
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO employees (
        employee_id,
        employee_code,
        last_name,
        first_name,
        birth_date,
        birth_place,
        children_count,
        cin_number,
        cin_date,
        cin_place,
        cnaPS_number,
        address,
        address_complement,
        bank_code,
        branch_code,
        account_number,
        rib_key,
        hire_date,
        job_title,
        grade,
        is_executive,
        contract_end_date,
        departure_date,
        departure_reason_code,
        departure_reason_title,
        headcount,
        birth_date_,
        status,
        created_at,
        updated_at,
        unit_id,
        service_id,
        department_id,
        direction_id,
        working_time_type_id,
        employee_category_id,
        contract_type_id,
        gender_id,
        marital_status_id,
        site_id
    )
    SELECT 
        'EMP_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_employee_id AS VARCHAR(4)), 4),
        employee_code,
        last_name,
        first_name,
        birth_date,
        birth_place,
        children_count,
        cin_number,
        cin_date,
        cin_place,
        cnaPS_number,
        address,
        address_complement,
        bank_code,
        branch_code,
        account_number,
        rib_key,
        hire_date,
        job_title,
        grade,
        is_executive,
        contract_end_date,
        departure_date,
        departure_reason_code,
        departure_reason_title,
        headcount,
        birth_date_,
        status,
        ISNULL(created_at, CURRENT_TIMESTAMP),
        ISNULL(updated_at, CURRENT_TIMESTAMP),
        unit_id,
        service_id,
        department_id,
        direction_id,
        working_time_type_id,
        employee_category_id,
        contract_type_id,
        gender_id,
        marital_status_id,
        site_id
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_recruitment_request_details
ON recruitment_request_details
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO recruitment_request_details (
        recruitment_request_detail_id,
        supervisor_position,
        created_at,
        updated_at,
        direct_supervisor_id,
        service_id,
        department_id,
        direction_id,
        recruitment_request_id
    )
    SELECT 
        'RRD_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_recruitment_request_detail_id AS VARCHAR(4)), 4),
        supervisor_position,
        ISNULL(created_at, CURRENT_TIMESTAMP),
        ISNULL(updated_at, CURRENT_TIMESTAMP),
        direct_supervisor_id,
        service_id,
        department_id,
        direction_id,
        recruitment_request_id
    FROM inserted;
END;
GO

CREATE TRIGGER trg_insert_approval_flow
ON approval_flow
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO approval_flow (
        approval_flow_id,
        approval_order,
        approver_role,
        created_at,
        updated_at,
        approver_id
    )
    SELECT 
        'AF_' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_approval_flow_id AS VARCHAR(4)), 4),
        approval_order,
        approver_role,
        ISNULL(created_at, CURRENT_TIMESTAMP),
        ISNULL(updated_at, CURRENT_TIMESTAMP),
        approver_id
    FROM inserted;
END;
GO
