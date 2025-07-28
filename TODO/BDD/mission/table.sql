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
   status VARCHAR(20) NOT NULL DEFAULT 'En Cours',
   lieu_id VARCHAR(50) NOT NULL,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY(mission_id),
   FOREIGN KEY(lieu_id) REFERENCES lieu(lieu_id)
);



CREATE TABLE mission_assignation(
   employee_id VARCHAR(50),
   mission_id VARCHAR(50),
   transport_id VARCHAR(50),
   departure_date DATE NOT NULL,
   departure_time TIME,
   return_date DATE,
   return_time TIME,
   duration INT,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY(employee_id, mission_id),
   FOREIGN KEY(employee_id) REFERENCES employees(employee_id),
   FOREIGN KEY(mission_id) REFERENCES mission(mission_id),
   FOREIGN KEY(transport_id) REFERENCES transport(transport_id)
);





