DROP TABLE IF EXISTS mission_assignation;
DROP TABLE IF EXISTS compensation_scale;
DROP TABLE IF EXISTS mission;
DROP TABLE IF EXISTS transport;
DROP TABLE IF EXISTS expense_type;


CREATE TABLE expense_type(
   expense_type_id VARCHAR(50),
   type VARCHAR(255),
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
   transport_id VARCHAR(50) NOT NULL,
   expense_type_id VARCHAR(50) NOT NULL,
   employee_category_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(compensation_scale_id),
   FOREIGN KEY(transport_id) REFERENCES transport(transport_id),
   FOREIGN KEY(expense_type_id) REFERENCES expense_type(expense_type_id),
   FOREIGN KEY(employee_category_id) REFERENCES employee_categories(employee_category_id)
);



CREATE TABLE mission(
   mission_id VARCHAR(50),
   name VARCHAR(255),
   description TEXT,
   start_date DATE,
   status VARCHAR(20) NOT NULL DEFAULT 'En Cours',
   site VARCHAR(255) NOT NULL,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY(mission_id)
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
   PRIMARY KEY(employee_id, mission_id, transport_id),
   FOREIGN KEY(employee_id) REFERENCES employees(employee_id),
   FOREIGN KEY(mission_id) REFERENCES mission(mission_id),
   FOREIGN KEY(transport_id) REFERENCES transport(transport_id)
);





