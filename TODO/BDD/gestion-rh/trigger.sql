-- 1. ALTER ROLE pour l'utilisateur
ALTER ROLE db_owner ADD MEMBER user_test;
GO

-- 2. Procédure pour mettre à jour le statut des missions
CREATE OR ALTER PROCEDURE sp_update_all_mission_status
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Missions planifiées -> in progress
    UPDATE mission
    SET status = 'in progress',
        updated_at = GETDATE()
    WHERE status = 'planned'
      AND (departure_date < CAST(GETDATE() AS DATE)
           OR (departure_date = CAST(GETDATE() AS DATE) 
               AND (departure_time IS NULL OR departure_time <= CAST(GETDATE() AS TIME))));
    
    -- Missions in progress -> completed
    UPDATE mission
    SET status = 'completed',
        updated_at = GETDATE()
    WHERE status = 'in progress'
      AND (return_date < CAST(GETDATE() AS DATE)
           OR (return_date = CAST(GETDATE() AS DATE) 
               AND (return_time IS NULL OR return_time <= CAST(GETDATE() AS TIME))));
    
    SELECT @@ROWCOUNT AS [Nombre de missions mises à jour];
END;
GO

-- 3. Trigger pour mettre à jour le dernier statut des demandes
CREATE OR ALTER TRIGGER trg_UpdateLastStatus
ON requests_validations
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH LastVal AS (
        SELECT 
            rv.request_id,
            rs.status_name,
            rv.created_at,
            ROW_NUMBER() OVER (
                PARTITION BY rv.request_id 
                ORDER BY rv.created_at DESC
            ) AS rn
        FROM requests_validations rv
        JOIN requests_status rs ON rv.status_id = rs.status_id
        WHERE rv.request_id IN (SELECT DISTINCT request_id FROM inserted)
    )
    UPDATE rr
    SET rr.last_status = lv.status_name
    FROM recruitment_requests rr
    JOIN LastVal lv ON lv.request_id = rr.request_id
    WHERE lv.rn = 1;
END;
GO

-- 4. Procédure pour le Directeur Général
CREATE OR ALTER PROCEDURE sp_upsert_general_director
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @RowsAffected INT = 0;

    DECLARE @GeneralDirector TABLE (
        user_id UNIQUEIDENTIFIER,
        user_name VARCHAR(255),
        department VARCHAR(255),
        position VARCHAR(255)
    );
    
    INSERT INTO @GeneralDirector (user_id, user_name, department, position)
    SELECT 
        u.user_id,
        u.name,
        u.department,
        u.position
    FROM users u
    WHERE u.position IS NOT NULL 
      AND u.user_id IS NOT NULL
      AND (
          UPPER(u.position) LIKE '%DIRECTEUR GÉNÉRAL%'
          OR UPPER(u.position) LIKE '%DIRECTEUR GENERAL%'
          OR UPPER(u.position) LIKE '%DIRECTRICE GÉNÉRALE%'
          OR UPPER(u.position) LIKE '%DIRECTRICE GENERALE%'
          OR UPPER(u.position) LIKE '%GENERAL DIRECTOR%'
          OR UPPER(u.position) LIKE '%MANAGING DIRECTOR%'
          OR UPPER(u.position) = 'DG'
          OR UPPER(u.position) = 'CEO'
          OR UPPER(u.position) = 'PDG'
      );

    MERGE validators_flow AS target
    USING (
        SELECT 
            gd.user_id,
            'Directeur Général' AS validator_type,
            COALESCE(gd.department, 'Direction Générale') AS department,
            0 AS backup_order
        FROM @GeneralDirector gd
    ) AS source (user_id, validator_type, department, backup_order)
    ON target.user_id = source.user_id 
        AND target.validator_type = source.validator_type
        AND target.backup_order = source.backup_order
    WHEN NOT MATCHED THEN
        INSERT (validator_id, validator_type, user_id, department, backup_order, superior_id, created_at, updated_at)
        VALUES (NEWID(), source.validator_type, source.user_id, source.department, source.backup_order, NULL, GETDATE(), GETDATE())
    WHEN MATCHED THEN
        UPDATE SET 
            department = source.department,
            updated_at = GETDATE();

    SET @RowsAffected = @@ROWCOUNT;
    SELECT @RowsAffected AS [Nombre de Directeurs Généraux traités];
END;
GO

-- 5. Procédure pour les directeurs de département
CREATE OR ALTER PROCEDURE sp_upsert_department_directors
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RowsAffected INT = 0;

    DECLARE @DepartmentDirectors TABLE (
        user_id UNIQUEIDENTIFIER,
        user_name VARCHAR(255),
        department VARCHAR(255),
        position VARCHAR(255)
    );

    INSERT INTO @DepartmentDirectors (user_id, user_name, department, position)
    SELECT 
        u.user_id,
        u.name,
        u.department,
        u.position
    FROM users u
    WHERE u.position IS NOT NULL 
      AND u.user_id IS NOT NULL
      AND u.department IS NOT NULL
      AND u.department != 'DRH'
      AND NOT (
          UPPER(u.position) LIKE '%DIRECTEUR GÉNÉRAL%'
          OR UPPER(u.position) LIKE '%DIRECTEUR GENERAL%'
          OR UPPER(u.position) LIKE '%DIRECTRICE GÉNÉRALE%'
          OR UPPER(u.position) LIKE '%DIRECTRICE GENERALE%'
          OR UPPER(u.position) LIKE '%GENERAL DIRECTOR%'
          OR UPPER(u.position) LIKE '%MANAGING DIRECTOR%'
          OR UPPER(u.position) = 'DG'
          OR UPPER(u.position) = 'CEO'
          OR UPPER(u.position) = 'PDG'
      )
      AND (
          u.position LIKE '%Directeur%' 
          OR u.position LIKE '%Directrice%' 
          OR u.position LIKE '%Director%'
      );

    DECLARE @DgId UNIQUEIDENTIFIER;
    SELECT TOP 1 @DgId = user_id 
    FROM validators_flow 
    WHERE validator_type = 'Directeur Général' 
      AND backup_order = 0;

    MERGE validators_flow AS target
    USING (
        SELECT 
            d.user_id,
            'Directeur de tutelle' AS validator_type,
            d.department,
            0 AS backup_order,
            @DgId AS superior_id
        FROM @DepartmentDirectors d
    ) AS source (user_id, validator_type, department, backup_order, superior_id)
    ON target.user_id = source.user_id 
        AND target.validator_type = source.validator_type
        AND target.backup_order = source.backup_order
    WHEN NOT MATCHED THEN
        INSERT (validator_id, validator_type, user_id, department, backup_order, superior_id, created_at, updated_at)
        VALUES (NEWID(), source.validator_type, source.user_id, source.department, source.backup_order, source.superior_id, GETDATE(), GETDATE())
    WHEN MATCHED THEN
        UPDATE SET 
            department = source.department,
            superior_id = ISNULL(source.superior_id, target.superior_id),
            updated_at = GETDATE();

    SET @RowsAffected = @@ROWCOUNT;
    SELECT @RowsAffected AS [Nombre de directeurs de département traités];
END;
GO

-- 6. Procédure pour le DRH
CREATE OR ALTER PROCEDURE sp_upsert_drh
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RowsAffected INT = 0;

    DECLARE @Drh TABLE (
        user_id UNIQUEIDENTIFIER,
        user_name VARCHAR(255),
        department VARCHAR(255),
        position VARCHAR(255)
    );

    INSERT INTO @Drh (user_id, user_name, department, position)
    SELECT 
        u.user_id,
        u.name,
        u.department,
        u.position
    FROM users u
    WHERE u.department = 'DRH'
      AND u.position IS NOT NULL
      AND u.user_id IS NOT NULL
      AND (
          u.position = 'Directeur des Ressources Humaines'
          OR u.position = 'Directrice des Ressources Humaines'
          OR u.position = 'DRH'
          OR u.position LIKE '%Directeur RH%'
          OR u.position LIKE '%Directrice RH%'
      );

    DECLARE @DgId UNIQUEIDENTIFIER;
    SELECT TOP 1 @DgId = user_id 
    FROM validators_flow 
    WHERE validator_type = 'Directeur Général' 
      AND backup_order = 0;

    MERGE validators_flow AS target
    USING (
        SELECT 
            d.user_id,
            'DRH' AS validator_type,
            d.department,
            0 AS backup_order,
            @DgId AS superior_id
        FROM @Drh d
    ) AS source (user_id, validator_type, department, backup_order, superior_id)
    ON target.user_id = source.user_id 
        AND target.validator_type = source.validator_type
        AND target.backup_order = source.backup_order
    WHEN NOT MATCHED THEN
        INSERT (validator_id, validator_type, user_id, department, backup_order, superior_id, created_at, updated_at)
        VALUES (NEWID(), source.validator_type, source.user_id, source.department, source.backup_order, source.superior_id, GETDATE(), GETDATE())
    WHEN MATCHED THEN
        UPDATE SET 
            department = source.department,
            superior_id = ISNULL(source.superior_id, target.superior_id),
            updated_at = GETDATE();

    SET @RowsAffected = @@ROWCOUNT;
    SELECT @RowsAffected AS [Nombre de DRH traités];
END;
GO

-- 7. Procédure pour les chefs de département
CREATE OR ALTER PROCEDURE sp_upsert_department_chiefs
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RowsAffected INT = 0;

    DECLARE @DepartmentChiefs TABLE (
        user_id UNIQUEIDENTIFIER,
        user_name VARCHAR(255),
        department VARCHAR(255),
        position VARCHAR(255)
    );

    DECLARE @Superiors TABLE (
        user_id UNIQUEIDENTIFIER,
        department VARCHAR(255)
    );

    INSERT INTO @DepartmentChiefs (user_id, user_name, department, position)
    SELECT 
        u.user_id,
        u.name,
        u.department,
        u.position
    FROM users u
    WHERE u.position IS NOT NULL 
      AND u.user_id IS NOT NULL
      AND u.department IS NOT NULL
      AND (
          u.position LIKE '%Chef de département%' 
          OR u.position LIKE '%Cheffe de département%'
          OR u.position LIKE '%Chef de departement%'
          OR u.position LIKE '%Cheffe de departement%'
          OR u.position LIKE '%Head of Department%'
          OR u.position LIKE '%Department Head%'
          OR u.position LIKE '%Chef DRH%'
          OR u.position LIKE '%Cheffe DRH%'
          OR u.position LIKE '%Chef des Ressources Humaines%'
          OR u.position LIKE '%Cheffe des Ressources Humaines%'
      );

    INSERT INTO @Superiors (user_id, department)
    SELECT 
        vf.user_id,
        vf.department
    FROM validators_flow vf
    WHERE vf.validator_type = 'Directeur de tutelle'
      AND vf.backup_order = 0
      AND vf.department != 'DRH';

    INSERT INTO @Superiors (user_id, department)
    SELECT 
        vf.user_id,
        'DRH' AS department
    FROM validators_flow vf
    WHERE vf.validator_type = 'DRH'
      AND vf.backup_order = 0;

    MERGE validators_flow AS target
    USING (
        SELECT 
            c.user_id,
            'Chef de département' AS validator_type,
            c.department,
            1 AS backup_order,
            s.user_id AS superior_id
        FROM @DepartmentChiefs c
        LEFT JOIN @Superiors s ON c.department = s.department
    ) AS source (user_id, validator_type, department, backup_order, superior_id)
    ON target.user_id = source.user_id 
        AND target.validator_type = source.validator_type
        AND target.backup_order = source.backup_order
    WHEN NOT MATCHED THEN
        INSERT (validator_id, validator_type, user_id, department, backup_order, superior_id, created_at, updated_at)
        VALUES (NEWID(), source.validator_type, source.user_id, source.department, source.backup_order, source.superior_id, GETDATE(), GETDATE())
    WHEN MATCHED THEN
        UPDATE SET 
            department = source.department,
            superior_id = ISNULL(source.superior_id, target.superior_id),
            updated_at = GETDATE();

    SET @RowsAffected = @@ROWCOUNT;
    SELECT @RowsAffected AS [Nombre de chefs de département traités];
END;
GO

-- 8. Procédure principale pour mettre à jour tous les validateurs
CREATE OR ALTER PROCEDURE sp_upsert_all_validators_main
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalRowsAffected INT = 0;
    DECLARE @Result INT;

    PRINT 'Début de la mise à jour des validateurs...';

    -- Nettoyer les doublons
    WITH CTE_Duplicates AS (
        SELECT 
            validator_id,
            ROW_NUMBER() OVER (
                PARTITION BY user_id, validator_type, backup_order 
                ORDER BY created_at DESC
            ) AS rn
        FROM validators_flow
    )
    DELETE vf
    FROM validators_flow vf
    JOIN CTE_Duplicates cte ON vf.validator_id = cte.validator_id
    WHERE cte.rn > 1;

    PRINT 'Nettoyage des doublons existants effectué.';

    -- Traiter toutes les procédures
    EXEC sp_upsert_general_director;
    SELECT @Result = @@ROWCOUNT;
    SET @TotalRowsAffected += @Result;

    EXEC sp_upsert_department_directors;
    SELECT @Result = @@ROWCOUNT;
    SET @TotalRowsAffected += @Result;

    EXEC sp_upsert_drh;
    SELECT @Result = @@ROWCOUNT;
    SET @TotalRowsAffected += @Result;

    EXEC sp_upsert_department_chiefs;
    SELECT @Result = @@ROWCOUNT;
    SET @TotalRowsAffected += @Result;

    -- S'assurer que tous les directeurs ont le DG comme supérieur
    DECLARE @DgId UNIQUEIDENTIFIER;
    SELECT TOP 1 @DgId = user_id 
    FROM validators_flow 
    WHERE validator_type = 'Directeur Général' 
      AND backup_order = 0;

    IF @DgId IS NOT NULL
    BEGIN
        UPDATE vf
        SET vf.superior_id = @DgId,
            vf.updated_at = GETDATE()
        FROM validators_flow vf
        WHERE vf.validator_type IN ('Directeur de tutelle','DRH')
          AND vf.backup_order = 0
          AND (vf.superior_id IS NULL OR vf.superior_id != @DgId);
    END
    ELSE
    BEGIN
        PRINT 'ATTENTION: Aucun Directeur Général trouvé!';
    END

    SELECT @TotalRowsAffected AS [Nombre total de validateurs traités];
    PRINT 'Opération terminée.';
END;
GO

-- 9. Procédure pour réinitialiser validators_flow
CREATE OR ALTER PROCEDURE sp_reset_validators_flow
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RowsDeleted INT;
    DELETE FROM validators_flow;
    SET @RowsDeleted = @@ROWCOUNT;

    SELECT @RowsDeleted AS [Nombre de validateurs supprimés];
    PRINT 'Table validators_flow réinitialisée.';
END;
GO

-- 10. Exécution des procédures principales
EXEC sp_upsert_all_validators_main;
GO
EXEC sp_reset_validators_flow;
GO
