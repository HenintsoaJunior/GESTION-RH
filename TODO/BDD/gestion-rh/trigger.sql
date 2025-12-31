-- AVEC l'utilisateur sa, entrez : ALTER ROLE db_owner ADD MEMBER user_test;

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
GO

-- Statut de demande de recrutement
CREATE TRIGGER trg_UpdateLastStatus
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

