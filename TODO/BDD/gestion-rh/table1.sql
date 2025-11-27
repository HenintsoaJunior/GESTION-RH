CREATE TABLE direction(
   direction_id VARCHAR(50),
   direction_name VARCHAR(100) NOT NULL,
   acronym VARCHAR(20),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(direction_id)
);

CREATE TABLE department(
   department_id VARCHAR(50),
   department_name VARCHAR(255) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   direction_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(department_id),
   FOREIGN KEY(direction_id) REFERENCES direction(direction_id)
);

CREATE TABLE service(
   service_id VARCHAR(50),
   service_name VARCHAR(255) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   department_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(service_id),
   FOREIGN KEY(department_id) REFERENCES department(department_id)
);

CREATE TABLE units(
   unit_id VARCHAR(50),
   unit_name VARCHAR(100) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   service_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(unit_id),
   FOREIGN KEY(service_id) REFERENCES service(service_id)
);

CREATE TABLE site(
   site_id VARCHAR(50),
   site_name VARCHAR(255) NOT NULL,
   code VARCHAR(10),
   longitude DECIMAL(9,6),
   latitude DECIMAL(9,6),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(site_id)
);

CREATE TABLE nationalities(
   nationality_id VARCHAR(50),
   code VARCHAR(50) NOT NULL,
   name VARCHAR(100) NOT NULL,
   PRIMARY KEY(nationality_id),
   UNIQUE(code)
);

CREATE TABLE contract_types(
   contract_type_id VARCHAR(50),
   code VARCHAR(50) NOT NULL,
   label VARCHAR(50) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(contract_type_id),
   UNIQUE(code)
);


CREATE TABLE role (
    role_id VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(250),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id)
);


CREATE TABLE users (
    user_id VARCHAR(250) NOT NULL,
    matricule VARCHAR(100) UNIQUE,
    email VARCHAR(150) NOT NULL,
    name VARCHAR(250),
    position VARCHAR(250),
    department VARCHAR(100),
    superior_id VARCHAR(150),
    superior_name VARCHAR(150),
    status VARCHAR(50),
    signature VARCHAR(MAX),
    user_type INT,
    refresh_token VARCHAR(MAX),
    refresh_token_expiry DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);


CREATE TABLE user_role (
    user_id VARCHAR(250) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


CREATE TABLE habilitation_groups (
   group_id VARCHAR(50) PRIMARY KEY,
   label VARCHAR(100) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME
);


CREATE TABLE habilitations (
   habilitation_id VARCHAR(50) PRIMARY KEY,
   group_id VARCHAR(50),
   label VARCHAR(100) NOT NULL,
   description TEXT,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   FOREIGN KEY (group_id) REFERENCES habilitation_groups(group_id)
);

CREATE TABLE role_habilitation(
   habilitation_id VARCHAR(50),
   role_id VARCHAR(50),
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(habilitation_id, role_id),
   FOREIGN KEY(habilitation_id) REFERENCES habilitations(habilitation_id),
   FOREIGN KEY(role_id) REFERENCES role(role_id) ON DELETE CASCADE
);

CREATE TABLE user_habilitations (
  user_id VARCHAR(250),
  habilitation_id VARCHAR(50),
  PRIMARY KEY (user_id, habilitation_id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (habilitation_id) REFERENCES habilitations(habilitation_id)
);

CREATE TABLE logs(
   log_id VARCHAR(50),
   ip_address VARCHAR(50),
   action VARCHAR(100) NOT NULL,
   table_name VARCHAR(255),
   old_values TEXT,
   new_values TEXT,
   user_id VARCHAR(250) NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME,
   PRIMARY KEY(log_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id)
);


-- ============================
-- MENU DYNAMIQUE
-- ============================
CREATE TABLE module (
   module_id VARCHAR(50) PRIMARY KEY,
   module_name VARCHAR(100) NOT NULL,
   description VARCHAR(MAX),
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE menu (
   menu_id VARCHAR(50) PRIMARY KEY,
   menu_key VARCHAR(50) NOT NULL UNIQUE,
   icon VARCHAR(50),
   link VARCHAR(255),
   is_enabled BIT DEFAULT 1,
   position INT,
   module_id VARCHAR(50),
   section VARCHAR(50) NOT NULL,
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (module_id) REFERENCES module(module_id)
);

CREATE TABLE menu_role (
   menu_id VARCHAR(50) NOT NULL,
   role_id VARCHAR(50) NOT NULL,
   PRIMARY KEY (menu_id, role_id),
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE
);

CREATE TABLE menu_hierarchy (
   hierarchy_id VARCHAR(50) PRIMARY KEY,
   parent_menu_id VARCHAR(50),
   menu_id VARCHAR(50) NOT NULL,
   created_at DATETIME NOT NULL DEFAULT GETDATE(),
   updated_at DATETIME NOT NULL DEFAULT GETDATE(),
   FOREIGN KEY (parent_menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
);
