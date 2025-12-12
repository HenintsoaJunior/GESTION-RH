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