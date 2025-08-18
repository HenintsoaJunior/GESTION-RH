CREATE TABLE role (
    role_id VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(250),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id)
);

CREATE TABLE users (
    user_id VARCHAR(50) NOT NULL,
    matricule VARCHAR(100) UNIQUE,
    email VARCHAR(150) NOT NULL,
    name VARCHAR(250),
    position VARCHAR(250),
    department VARCHAR(100),
    superior_id VARCHAR(150),
    superior_name VARCHAR(150),
    status VARCHAR(50),
    signature VARCHAR(250),
    user_type VARCHAR(50),
    refresh_token VARCHAR(MAX),
    refresh_token_expiry DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

CREATE TABLE user_role (
    user_id VARCHAR(50) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
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
