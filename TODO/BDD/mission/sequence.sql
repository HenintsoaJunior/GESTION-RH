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