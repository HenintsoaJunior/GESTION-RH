CREATE TABLE expense_type (
   expense_type_id VARCHAR(50),
   type VARCHAR(255),
   time_start TIME,
   time_end TIME,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY(expense_type_id)
);

CREATE TABLE transport(
   transport_id VARCHAR(50),
   type VARCHAR(50) NOT NULL,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY(transport_id)
);

CREATE TABLE compensation_scale(
   compensation_scale_id VARCHAR(50),
   amount DECIMAL(15,2),
   created_at DATETIME,
   updated_at DATETIME,
   transport_id VARCHAR(50),
   expense_type_id VARCHAR(50),
   employee_category_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(compensation_scale_id),
   FOREIGN KEY(transport_id) REFERENCES transport(transport_id),
   FOREIGN KEY(expense_type_id) REFERENCES expense_type(expense_type_id),
   FOREIGN KEY(employee_category_id) REFERENCES employee_categories(employee_category_id)
);

CREATE TABLE lieu (
   lieu_id VARCHAR(50) PRIMARY KEY,
   nom VARCHAR(255) NOT NULL,
   adresse VARCHAR(500),
   ville VARCHAR(255),
   code_postal VARCHAR(20),
   pays VARCHAR(255) NOT NULL,
   created_at DATETIME,
   updated_at DATETIME
);


CREATE TABLE mission (
   mission_id VARCHAR(50),
   name VARCHAR(255),
   description TEXT,
   start_date DATE,
   end_date DATE,
   status VARCHAR(20) NOT NULL DEFAULT 'En Cours',
   lieu_id VARCHAR(50) NOT NULL,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY(mission_id),
   FOREIGN KEY(lieu_id) REFERENCES lieu(lieu_id)
);

CREATE TABLE mission_assignation (
   assignation_id VARCHAR(50),
   departure_date DATE NOT NULL,
   departure_time TIME,
   return_date DATE,
   return_time TIME,
   duration INT,
   created_at DATETIME,
   updated_at DATETIME,
   transport_id VARCHAR(50),
   mission_id VARCHAR(50) NOT NULL,
   employee_id VARCHAR(50) NOT NULL,
   is_validated INT DEFAULT 0,
   PRIMARY KEY (assignation_id),
   FOREIGN KEY (transport_id) REFERENCES transport(transport_id),
   FOREIGN KEY (mission_id) REFERENCES mission(mission_id),
   FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- validation par circuit (collaborateur → manager → directeur de tutelle → RH)
CREATE TABLE mission_validation (
   mission_validation_id VARCHAR(50),
   mission_id VARCHAR(50) NOT NULL,
   mission_assignation_id VARCHAR(50) NOT NULL,
   mission_creator VARCHAR(50) NOT NULL,
   status VARCHAR(20) DEFAULT 'En Attente',
   to_whom VARCHAR(50),
   validation_date DATETIME,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY(mission_validation_id),
   FOREIGN KEY(mission_id) REFERENCES mission(mission_id),
   FOREIGN KEY(mission_assignation_id) REFERENCES mission_assignation(assignation_id),
   FOREIGN KEY(mission_creator) REFERENCES employees(employee_id)
);

-- logs
CREATE TABLE logs(
   log_id VARCHAR(50),
   action VARCHAR(100) NOT NULL,
   table_name VARCHAR(255),
   old_values TEXT,
   new_values TEXT,
   date_ DATETIME,
   user_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(log_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id)
);



