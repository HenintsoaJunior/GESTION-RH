DROP TABLE IF EXISTS menu_translation;
DROP TABLE IF EXISTS menu_hierarchy;
DROP TABLE IF EXISTS menu;
DROP TABLE IF EXISTS module;
DROP TABLE IF EXISTS language;

CREATE TABLE language (
   language_id VARCHAR(10) PRIMARY KEY,
   language_name VARCHAR(100) NOT NULL,
   abr VARCHAR(50) NOT NULL,
   is_active BIT DEFAULT 1
);

CREATE TABLE module (
   module_id VARCHAR(50) PRIMARY KEY,
   module_name VARCHAR(100) NOT NULL,
   description VARCHAR(MAX)
);

CREATE TABLE menu (
   menu_id VARCHAR(50) PRIMARY KEY,
   menu_key VARCHAR(50) NOT NULL UNIQUE,
   icon VARCHAR(50),
   link VARCHAR(255),
   is_enabled BIT DEFAULT 1,
   position INT,
   module_id VARCHAR(50),
   FOREIGN KEY (module_id) REFERENCES module(module_id)
);

CREATE TABLE menu_hierarchy (
   hierarchy_id VARCHAR(50) PRIMARY KEY,
   parent_menu_id VARCHAR(50),
   menu_id VARCHAR(50) NOT NULL,
   FOREIGN KEY (parent_menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
);

CREATE TABLE menu_translation (
   translation_id VARCHAR(50) PRIMARY KEY,
   label VARCHAR(100) NOT NULL,
   language_id VARCHAR(10) NOT NULL,
   menu_id VARCHAR(50) NOT NULL,
   UNIQUE (menu_id, language_id),
   FOREIGN KEY (language_id) REFERENCES language(language_id),
   FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
);
