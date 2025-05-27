CREATE TABLE language_(
   language_id VARCHAR(10) ,
   language_name VARCHAR(100)  NOT NULL,
   is_active BIT DEFAULT TRUE,
   PRIMARY KEY(language_id)
);

CREATE TABLE module_(
   module_id VARCHAR(50),
   module_name VARCHAR(100)  NOT NULL,
   description VARCHAR(max),
   PRIMARY KEY(module_id)
);

CREATE TABLE menu(
   menu_id VARCHAR(50),
   menu_key VARCHAR(50)  NOT NULL,
   icon VARCHAR(50) ,
   link VARCHAR(255) ,
   is_enabled BIT DEFAULT TRUE,
   position_ INT,
   module_id VARCHAR(50) ,
   PRIMARY KEY(menu_id),
   UNIQUE(menu_key),
   FOREIGN KEY(module_id) REFERENCES module_(module_id)
);

CREATE TABLE menu_hierarchy(
   hierarchy_id VARCHAR(50),
   parent_menu_id VARCHAR(50) ,
   menu_id VARCHAR(50)  NOT NULL,
   PRIMARY KEY(hierarchy_id),
   FOREIGN KEY(parent_menu_id) REFERENCES menu(menu_id),
   FOREIGN KEY(menu_id) REFERENCES menu(menu_id)
);

CREATE TABLE menu_translation(
   translation_id VARCHAR(50),
   label VARCHAR(100)  NOT NULL,
   language_id VARCHAR(10)  NOT NULL,
   menu_id VARCHAR(50)  NOT NULL,
   PRIMARY KEY(translation_id),
   UNIQUE(menu_id, language_id),
   FOREIGN KEY(language_id) REFERENCES language_(language_id),
   FOREIGN KEY(menu_id) REFERENCES menu(menu_id)
);
