CREATE TABLE replacement_reasons(
   replacement_reason_id VARCHAR(50) NOT NULL,
   reason_name VARCHAR(70)  NOT NULL,
   PRIMARY KEY(replacement_reason_id)
);
 
CREATE TABLE requests_status(
   status_id VARCHAR(50) NOT NULL,
   status_name VARCHAR(50)  NOT NULL,
   PRIMARY KEY(status_id)
);
 
CREATE TABLE job_descriptions_status(
   status_id VARCHAR(50) NOT NULL,
   status_name VARCHAR(50)  NOT NULL,
   PRIMARY KEY(status_id)
);
 
CREATE TABLE level_educations(
   level_education_id VARCHAR(50) NOT NULL,
   level_education_name VARCHAR(50)  NOT NULL,
   PRIMARY KEY(level_education_id)
);
 
CREATE TABLE educations(
   education_id VARCHAR(50) NOT NULL,
   education_name VARCHAR(50)  NOT NULL,
   PRIMARY KEY(education_id)
);
 
CREATE TABLE personnal_suitabilities(
   personnal_suitability_id VARCHAR(50) NOT NULL,
   personnal_suitability_name VARCHAR(50)  NOT NULL,
   PRIMARY KEY(personnal_suitability_id)
);
 
CREATE TABLE evaluation_types(
   evaluation_type_id VARCHAR(50) NOT NULL,
   evaluation_type_name VARCHAR(50)  NOT NULL,
   max_point DECIMAL(10,2)   NOT NULL,
   PRIMARY KEY(evaluation_type_id)
);
 
CREATE TABLE recruitment_requests(
   request_id VARCHAR(50) NOT NULL,
   post_name VARCHAR(70)  NOT NULL,
   effective SMALLINT NOT NULL,
   month_duration SMALLINT,
   contract_precision VARCHAR(70),
   is_replacement BIT NOT NULL,
   replacement_date DATE,
   begining_date DATE NOT NULL,
   is_deleted BIT NOT NULL DEFAULT 0,
   created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
   applicant_user VARCHAR(250) NOT NULL,
   replacement_reason_id VARCHAR(50),
   contract_type_id VARCHAR(50) NOT NULL,
   last_titular_user VARCHAR(250),
   PRIMARY KEY(request_id),
   FOREIGN KEY(applicant_user) REFERENCES users(user_id),
   FOREIGN KEY(replacement_reason_id) REFERENCES replacement_reasons(replacement_reason_id),
   FOREIGN KEY(contract_type_id) REFERENCES contract_types(contract_type_id),
   FOREIGN KEY(last_titular_user) REFERENCES users(user_id)
);

 
CREATE TABLE sites_requests(
   id_site_request VARCHAR(50) NOT NULL,
   site_id VARCHAR(50) NOT NULL,
   request_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(id_site_request),
   FOREIGN KEY(site_id) REFERENCES site(site_id),
   FOREIGN KEY(request_id) REFERENCES recruitment_requests(request_id)
);
 
CREATE TABLE requests_validations(
   request_validation_id VARCHAR(50) NOT NULL,
   created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
   signature_url VARCHAR(150)  NOT NULL,
   comments VARCHAR(max),
   user_id VARCHAR(250) NOT NULL,
   status_id VARCHAR(50) NOT NULL,
   request_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(request_validation_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id),
   FOREIGN KEY(status_id) REFERENCES requests_status(status_id),
   FOREIGN KEY(request_id) REFERENCES recruitment_requests(request_id)
);
 
CREATE TABLE job_descriptions(
   job_description_id VARCHAR(50) NOT NULL,
   created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
   mission VARCHAR(max) NOT NULL,
   request_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(job_description_id),
   UNIQUE(request_id),
   FOREIGN KEY(request_id) REFERENCES recruitment_requests(request_id)
);
 
CREATE TABLE Attributions(
   attribution_id VARCHAR(50) NOT NULL,
   attribution VARCHAR(150)  NOT NULL,
   job_description_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(attribution_id),
   FOREIGN KEY(job_description_id) REFERENCES job_descriptions(job_description_id)
);
 
CREATE TABLE jobs_validations(
   job_validation_id VARCHAR(50) NOT NULL,
   created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
   user_id VARCHAR(250) NOT NULL,
   status_id VARCHAR(50) NOT NULL,
   job_description_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(job_validation_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id),
   FOREIGN KEY(status_id) REFERENCES job_descriptions_status(status_id),
   FOREIGN KEY(job_description_id) REFERENCES job_descriptions(job_description_id)
);
 
CREATE TABLE formations(
   formation_id VARCHAR(50) NOT NULL,
   education_id VARCHAR(50) NOT NULL,
   job_description_id VARCHAR(50) NOT NULL,
   level_education_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(formation_id),
   FOREIGN KEY(education_id) REFERENCES educations(education_id),
   FOREIGN KEY(job_description_id) REFERENCES job_descriptions(job_description_id),
   FOREIGN KEY(level_education_id) REFERENCES level_educations(level_education_id)
);
 
CREATE TABLE experiences(
   experience_id VARCHAR(50) NOT NULL,
   experience_years SMALLINT NOT NULL DEFAULT 0,
   experience_post VARCHAR(50)  NOT NULL,
   job_description_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(experience_id),
   FOREIGN KEY(job_description_id) REFERENCES job_descriptions(job_description_id)
);
 
CREATE TABLE jobs_suitabilities(
   job_suitability_id VARCHAR(50) NOT NULL,
   job_description_id VARCHAR(50) NOT NULL,
   personnal_suitability_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(job_suitability_id),
   FOREIGN KEY(job_description_id) REFERENCES job_descriptions(job_description_id),
   FOREIGN KEY(personnal_suitability_id) REFERENCES personnal_suitabilities(personnal_suitability_id)
);
 
CREATE TABLE skills(
   skill_id VARCHAR(50) NOT NULL,
   job_description_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(skill_id),
   FOREIGN KEY(job_description_id) REFERENCES job_descriptions(job_description_id)
);
 
CREATE TABLE candidatures(
   candidature_id VARCHAR(50) NOT NULL,
   first_name VARCHAR(50)  NOT NULL,
   last_name VARCHAR(50)  NOT NULL,
   email_contact VARCHAR(50)  NOT NULL,
   cv_url VARCHAR(150)  NOT NULL,
   lm_url VARCHAR(150)  NOT NULL,
   created_at DATETIME2 NOT NULL,
   job_description_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(candidature_id),
   FOREIGN KEY(job_description_id) REFERENCES job_descriptions(job_description_id)
);
 
CREATE TABLE evaluations(
   evaluation_id VARCHAR(50) NOT NULL,
   obtained_point DECIMAL(10,2)   NOT NULL DEFAULT 0,
   candidature_id VARCHAR(50) NOT NULL,
   evaluation_type_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(evaluation_id),
   FOREIGN KEY(candidature_id) REFERENCES candidatures(candidature_id),
   FOREIGN KEY(evaluation_type_id) REFERENCES evaluation_types(evaluation_type_id)
);
 
CREATE TABLE tests(
   test_id VARCHAR(50) NOT NULL,
   test_datetime DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
   created_at DATETIME2 NOT NULL,
   is_passed BIT NOT NULL,
   user_id VARCHAR(250) NOT NULL,
   candidature_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(test_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id),
   FOREIGN KEY(candidature_id) REFERENCES candidatures(candidature_id)
);
 
CREATE TABLE comments_candidatures(
   comment_id VARCHAR(50) NOT NULL,
   comment VARCHAR(max) NOT NULL,
   created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
   user_id VARCHAR(250) NOT NULL,
   candidature_id VARCHAR(50) NOT NULL,
   PRIMARY KEY(comment_id),
   FOREIGN KEY(user_id) REFERENCES users(user_id),
   FOREIGN KEY(candidature_id) REFERENCES candidatures(candidature_id)
);
