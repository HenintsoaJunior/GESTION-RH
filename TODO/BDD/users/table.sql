CREATE TABLE role(
   role_id VARCHAR(50),
   name VARCHAR(50),
   description VARCHAR(50),
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY(role_id)
);


CREATE TABLE users(
   user_id VARCHAR(50),
   matricule VARCHAR(100) NOT NULL,
   email VARCHAR(150) NOT NULL,
   name VARCHAR(50),
   position_ VARCHAR(250),
   department VARCHAR(100),
   superior_id VARCHAR(150),
   superior_name VARCHAR(150),
   status VARCHAR(50),
   signature VARCHAR(250),
   user_type VARCHAR(50),
   refresh_token TEXT,
   refresh_token_expiry DATETIME,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   role_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(user_id),
   UNIQUE(matricule),
   UNIQUE(email),
   FOREIGN KEY(role_id) REFERENCES role(role_id)
);

CREATE TABLE habilitations(
   habilitation_id VARCHAR(50),
   label VARCHAR(50),
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY(habilitation_id)
);

CREATE TABLE role_habilitation(
   habilitation_id VARCHAR(50),
   role_id VARCHAR(50),
   PRIMARY KEY(habilitation_id, role_id),
   FOREIGN KEY(habilitation_id) REFERENCES habilitations(habilitation_id),
   FOREIGN KEY(role_id) REFERENCES role(role_id)
);
