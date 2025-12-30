CREATE OR ALTER PROCEDURE sp_update_all_mission_status
AS
BEGIN
    SET NOCOUNT OFF;
    
    UPDATE mission
    SET status = 'in progress',
        updated_at = GETDATE()
    WHERE status = 'planned'
      AND (departure_date < CAST(GETDATE() AS DATE)
           OR (departure_date = CAST(GETDATE() AS DATE) 
               AND (departure_time IS NULL OR departure_time <= CAST(GETDATE() AS TIME))));
    
    UPDATE mission
    SET status = 'completed',
        updated_at = GETDATE()
    WHERE status = 'in progress'
      AND (return_date < CAST(GETDATE() AS DATE)
           OR (return_date = CAST(GETDATE() AS DATE) 
               AND (return_time IS NULL OR return_time <= CAST(GETDATE() AS TIME))));
    
    SELECT @@ROWCOUNT AS [Nombre de missions mises à jour];
END;

--1 Procédure pour identifier et insérer le Directeur Général
CREATE OR ALTER PROCEDURE sp_upsert_general_director
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @RowsAffected INT = 0;
    
    -- Table temporaire pour stocker le DG identifié
    DECLARE @GeneralDirector TABLE (
        user_id VARCHAR(250),
        user_name VARCHAR(255),
        department VARCHAR(255),
        position VARCHAR(255)
    );
    
    -- Identifier le Directeur Général
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
    
    -- Insérer/Mettre à jour dans validators_flow
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

--2
CREATE OR ALTER PROCEDURE sp_upsert_department_directors
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @RowsAffected INT = 0;
    
    -- Table temporaire pour stocker les directeurs identifiés
    DECLARE @DepartmentDirectors TABLE (
        user_id VARCHAR(250),
        user_name VARCHAR(255),
        department VARCHAR(255),
        position VARCHAR(255)
    );
    
    -- Identifier tous les directeurs de département (hors DG)
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
      -- Exclusion explicite du Directeur Général
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
      -- Inclusion des directeurs de département
      AND (
          (u.position LIKE '%Directeur%' 
           OR u.position LIKE '%Directrice%'
           OR u.position LIKE '%Director%')
          AND UPPER(u.position) NOT LIKE '%DIRECTEUR GÉNÉRAL%'
          AND UPPER(u.position) NOT LIKE '%DIRECTEUR GENERAL%'
      );
    
    -- Obtenir l'ID du Directeur Général
    DECLARE @DgId VARCHAR(250);
    SELECT TOP 1 @DgId = user_id 
    FROM validators_flow 
    WHERE validator_type = 'Directeur Général' 
      AND backup_order = 0;
    
    -- Insérer/Mettre à jour dans validators_flow avec backup_order = 0
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

-- 3. Procédure pour le DRH
CREATE OR ALTER PROCEDURE sp_upsert_drh
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @RowsAffected INT = 0;
    
    -- Table temporaire pour stocker le DRH identifié
    DECLARE @Drh TABLE (
        user_id VARCHAR(250),
        user_name VARCHAR(255),
        department VARCHAR(255),
        position VARCHAR(255)
    );
    
    -- Identifier le DRH
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
    
    -- Obtenir l'ID du Directeur Général
    DECLARE @DgId VARCHAR(250);
    SELECT TOP 1 @DgId = user_id 
    FROM validators_flow 
    WHERE validator_type = 'Directeur Général' 
      AND backup_order = 0;
    
    -- Insérer/Mettre à jour dans validators_flow
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


-- 4. Procédure pour les chefs de département (INCLUANT DRH)
CREATE OR ALTER PROCEDURE sp_upsert_department_chiefs
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @RowsAffected INT = 0;
    
    -- Table temporaire pour stocker les chefs de département
    DECLARE @DepartmentChiefs TABLE (
        user_id VARCHAR(250),
        user_name VARCHAR(255),
        department VARCHAR(255),
        position VARCHAR(255)
    );
    
    -- Table temporaire pour les supérieurs (directeurs)
    DECLARE @Superiors TABLE (
        user_id VARCHAR(250),
        department VARCHAR(255)
    );
    
    -- Identifier tous les chefs de département (INCLUANT DRH)
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
    
    -- Identifier les directeurs (supérieurs des chefs) pour tous les départements SAUF DRH
    INSERT INTO @Superiors (user_id, department)
    SELECT 
        vf.user_id,
        vf.department
    FROM validators_flow vf
    WHERE vf.validator_type = 'Directeur de tutelle'
      AND vf.backup_order = 0
      AND vf.department != 'DRH';
    
    -- Identifier le DRH comme supérieur pour le Chef de département DRH
    INSERT INTO @Superiors (user_id, department)
    SELECT 
        vf.user_id,
        'DRH' AS department
    FROM validators_flow vf
    WHERE vf.validator_type = 'DRH'
      AND vf.backup_order = 0;
    
    -- Insérer/Mettre à jour dans validators_flow avec backup_order = 1 et superior_id
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


-- 5. Procédure principale pour mettre à jour tous les validateurs
CREATE OR ALTER PROCEDURE sp_upsert_all_validators_main
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TotalRowsAffected INT = 0;
    DECLARE @Result INT;
    
    PRINT 'Début de la mise à jour des validateurs...';
    
    -- Nettoyer les doublons existants
    WITH CTE_Duplicates AS (
        SELECT 
            validator_id,
            ROW_NUMBER() OVER (
                PARTITION BY user_id, validator_type, backup_order 
                ORDER BY created_at DESC
            ) AS rn
        FROM validators_flow
    )
    DELETE FROM CTE_Duplicates WHERE rn > 1;
    
    PRINT 'Nettoyage des doublons existants effectué.';
    
    -- 1. Traiter le Directeur Général (DOIT ÊTRE LE PREMIER)
    EXEC sp_upsert_general_director;
    SELECT @Result = @@ROWCOUNT;
    SET @TotalRowsAffected = @TotalRowsAffected + @Result;
    PRINT 'Directeur Général traité: ' + CAST(@Result AS VARCHAR(10));
    
    -- 2. Traiter les directeurs de département (sans le DRH)
    EXEC sp_upsert_department_directors;
    SELECT @Result = @@ROWCOUNT;
    SET @TotalRowsAffected = @TotalRowsAffected + @Result;
    PRINT 'Directeurs de département traités: ' + CAST(@Result AS VARCHAR(10));

    -- 3. Traiter le DRH (doit être fait AVANT les chefs de département)
    EXEC sp_upsert_drh;
    SELECT @Result = @@ROWCOUNT;
    SET @TotalRowsAffected = @TotalRowsAffected + @Result;
    PRINT 'DRH traités: ' + CAST(@Result AS VARCHAR(10));

    -- 4. Traiter les chefs de département (INCLUANT DRH)
    EXEC sp_upsert_department_chiefs;
    SELECT @Result = @@ROWCOUNT;
    SET @TotalRowsAffected = @TotalRowsAffected + @Result;
    PRINT 'Chefs de département traités: ' + CAST(@Result AS VARCHAR(10));
    
    -- 5. S'assurer que tous les directeurs (tutelle et DRH) ont le DG comme supérieur
    DECLARE @DgId VARCHAR(250);
    SELECT TOP 1 @DgId = user_id 
    FROM validators_flow 
    WHERE validator_type = 'Directeur Général' 
      AND backup_order = 0;
    
    IF @DgId IS NOT NULL
    BEGIN
        -- Mettre à jour les supérieurs pour les Directeurs de tutelle
        UPDATE vf
        SET vf.superior_id = @DgId,
            vf.updated_at = GETDATE()
        FROM validators_flow vf
        WHERE vf.validator_type = 'Directeur de tutelle'
          AND vf.backup_order = 0
          AND (vf.superior_id IS NULL OR vf.superior_id != @DgId);
        
        PRINT 'Mise à jour des supérieurs pour les directeurs de tutelle effectuée.';
        
        -- Mettre à jour les supérieurs pour le DRH
        UPDATE vf
        SET vf.superior_id = @DgId,
            vf.updated_at = GETDATE()
        FROM validators_flow vf
        WHERE vf.validator_type = 'DRH'
          AND vf.backup_order = 0
          AND (vf.superior_id IS NULL OR vf.superior_id != @DgId);
        
        PRINT 'Mise à jour des supérieurs pour le DRH effectuée.';
    END
    ELSE
    BEGIN
        PRINT 'ATTENTION: Aucun Directeur Général trouvé!';
    END
    
    -- 6. Retourner le résultat total
    SELECT @TotalRowsAffected AS [Nombre total de validateurs traités];
    PRINT 'Opération terminée. Total: ' + CAST(@TotalRowsAffected AS VARCHAR(10)) + ' validateurs traités.';
END;

-- 6. Procédure pour réinitialiser
CREATE OR ALTER PROCEDURE sp_reset_validators_flow
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @RowsDeleted INT;
    
    -- Supprimer tous les enregistrements
    DELETE FROM validators_flow;
    SET @RowsDeleted = @@ROWCOUNT;
    
    SELECT @RowsDeleted AS [Nombre de validateurs supprimés];
    PRINT 'Table validators_flow réinitialisée. ' + CAST(@RowsDeleted AS VARCHAR(10)) + ' enregistrements supprimés.';
END;

EXEC sp_upsert_all_validators_main;

EXEC sp_reset_validators_flow;

