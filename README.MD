-Tree BACKEND

📦MyApp.Api
 ┣ 📂Controllers
 ┃ ┣ 📂candidates
 ┃ ┣ 📂contract
 ┃ ┃ ┗ 📜ContractTypeController.cs
 ┃ ┣ 📂direction
 ┃ ┃ ┣ 📜DepartmentController.cs
 ┃ ┃ ┣ 📜DirectionController.cs
 ┃ ┃ ┣ 📜ServiceController.cs
 ┃ ┃ ┗ 📜UnitController.cs
 ┃ ┣ 📂employee
 ┃ ┃ ┣ 📜EmployeeController.cs
 ┃ ┃ ┣ 📜GenderController.cs
 ┃ ┃ ┣ 📜MaritalStatusController.cs
 ┃ ┃ ┗ 📜WorkingTimeTypeController.cs
 ┃ ┣ 📂ldap
 ┃ ┃ ┗ 📂user
 ┃ ┃ ┃ ┣ 📜AuthController.cs
 ┃ ┃ ┃ ┣ 📜LdapController.cs
 ┃ ┃ ┃ ┗ 📜ObjectClassController.cs
 ┃ ┣ 📂logs
 ┃ ┃ ┗ 📜LogController.cs
 ┃ ┣ 📂menu
 ┃ ┃ ┗ 📜MenuController .cs
 ┃ ┣ 📂mission
 ┃ ┃ ┣ 📜CompensationScaleController.cs
 ┃ ┃ ┣ 📜ExpenseReportController.cs
 ┃ ┃ ┣ 📜LieuController.cs
 ┃ ┃ ┣ 📜MissionAssignationController.cs
 ┃ ┃ ┣ 📜MissionBudgetController.cs
 ┃ ┃ ┣ 📜MissionController.cs
 ┃ ┃ ┣ 📜MissionPaiementController.cs
 ┃ ┃ ┣ 📜MissionReportController.cs
 ┃ ┃ ┣ 📜MissionValidationController.cs
 ┃ ┃ ┗ 📜TransportController.cs
 ┃ ┣ 📂pdf
 ┃ ┃ ┗ 📜CertificateController.cs
 ┃ ┣ 📂site
 ┃ ┃ ┗ 📜SiteController.cs
 ┃ ┗ 📂user
 ┃ ┃ ┣ 📜RoleController.cs
 ┃ ┃ ┣ 📜UserController.cs
 ┃ ┃ ┗ 📜UserRoleController.cs
 ┣ 📂Data
 ┃ ┗ 📜AppDbContext.cs
 ┣ 📂Entities
 ┃ ┣ 📂candidates
 ┃ ┣ 📂certificate
 ┃ ┃ ┣ 📜Cerfificate.cs
 ┃ ┃ ┣ 📜EmployeeCertificate.cs
 ┃ ┃ ┗ 📜HostingCertificate.cs
 ┃ ┣ 📂contract
 ┃ ┃ ┗ 📜ContractType.cs
 ┃ ┣ 📂direction
 ┃ ┃ ┣ 📜Department.cs
 ┃ ┃ ┣ 📜Direction.cs
 ┃ ┃ ┣ 📜Service.cs
 ┃ ┃ ┗ 📜Unit.cs
 ┃ ┣ 📂employee
 ┃ ┃ ┣ 📜ApprovalFlow.cs
 ┃ ┃ ┣ 📜ApprovalFlowEmployee.cs
 ┃ ┃ ┣ 📜CategoriesOfEmployee.cs
 ┃ ┃ ┣ 📜Employee.cs
 ┃ ┃ ┣ 📜EmployeeCategory.cs
 ┃ ┃ ┣ 📜EmployeeNationality.cs
 ┃ ┃ ┣ 📜Gender.cs
 ┃ ┃ ┣ 📜MaritalStatus.cs
 ┃ ┃ ┣ 📜Nationality.cs
 ┃ ┃ ┗ 📜WorkingTimeType.cs
 ┃ ┣ 📂logs
 ┃ ┃ ┗ 📜Log.cs
 ┃ ┣ 📂menu
 ┃ ┃ ┣ 📜Menu.cs
 ┃ ┃ ┣ 📜MenuHierarchy.cs
 ┃ ┃ ┣ 📜MenuRole.cs
 ┃ ┃ ┗ 📜Module.cs
 ┃ ┣ 📂mission
 ┃ ┃ ┣ 📜CompensationScale.cs
 ┃ ┃ ┣ 📜ExpenseReport.cs
 ┃ ┃ ┣ 📜ExpenseReportType.cs
 ┃ ┃ ┣ 📜ExpenseType.cs
 ┃ ┃ ┣ 📜Lieu.cs
 ┃ ┃ ┣ 📜Mission.cs
 ┃ ┃ ┣ 📜MissionAssignation.cs
 ┃ ┃ ┣ 📜MissionBudget.cs
 ┃ ┃ ┣ 📜MissionPaiement.cs
 ┃ ┃ ┣ 📜MissionReport.cs
 ┃ ┃ ┣ 📜MissionValidation.cs
 ┃ ┃ ┗ 📜Transport.cs
 ┃ ┣ 📂site
 ┃ ┃ ┗ 📜Site.cs
 ┃ ┣ 📂users
 ┃ ┃ ┣ 📜Habilitation.cs
 ┃ ┃ ┣ 📜Role.cs
 ┃ ┃ ┣ 📜RoleHabilitation.cs
 ┃ ┃ ┣ 📜User.cs
 ┃ ┃ ┗ 📜UserRole.cs
 ┃ ┣ 📜BaseEntity.cs
 ┃ ┣ 📜CodeLabel.cs
 ┃ ┣ 📜Reason.cs
 ┃ ┗ 📜Types.cs
 ┣ 📂Extensions
 ┃ ┗ 📜ServiceCollectionExtensions.cs
 ┣ 📂Models
 ┃ ┣ 📂classes
 ┃ ┃ ┣ 📂mission
 ┃ ┃ ┣ 📂objectclass
 ┃ ┃ ┃ ┣ 📜ObjectClassAd.cs
 ┃ ┃ ┃ ┗ 📜TableColumn.cs
 ┃ ┃ ┣ 📂recruitment
 ┃ ┃ ┃ ┗ 📜ApprovalFlowEmployeeKey.cs
 ┃ ┃ ┗ 📂user
 ┃ ┃ ┃ ┣ 📜RoleHabilitationDto.cs
 ┃ ┃ ┃ ┗ 📜UserDto.cs
 ┃ ┗ 📂dto
 ┃ ┃ ┣ 📂candidates
 ┃ ┃ ┣ 📂contract
 ┃ ┃ ┃ ┗ 📜ContractTypeDTOForm.cs
 ┃ ┃ ┣ 📂direction
 ┃ ┃ ┃ ┣ 📜DepartmentDTOForm.cs
 ┃ ┃ ┃ ┣ 📜DirectionDTOForm.cs
 ┃ ┃ ┃ ┗ 📜ServiceDTOForm.cs
 ┃ ┃ ┣ 📂employee
 ┃ ┃ ┃ ┣ 📜ApprovalFlowDTOForm.cs
 ┃ ┃ ┃ ┣ 📜ApprovalFlowEmployeeDTOForm.cs
 ┃ ┃ ┃ ┣ 📜CategoriesOfEmployeeDTOForm.cs
 ┃ ┃ ┃ ┗ 📜EmployeeFormDTO.cs
 ┃ ┃ ┣ 📂lieu
 ┃ ┃ ┃ ┗ 📜LieuDTOForm.cs
 ┃ ┃ ┣ 📂logs
 ┃ ┃ ┃ ┗ 📜LogDTO.cs
 ┃ ┃ ┣ 📂menu
 ┃ ┃ ┃ ┗ 📜MenuModels.cs
 ┃ ┃ ┣ 📂mission
 ┃ ┃ ┃ ┣ 📜CompensationScaleDTOForm.cs
 ┃ ┃ ┃ ┣ 📜ExpenseReportDTOForm.cs
 ┃ ┃ ┃ ┣ 📜GeneratePaiementDTO.cs
 ┃ ┃ ┃ ┣ 📜LieuDTOList.cs
 ┃ ┃ ┃ ┣ 📜MissionAssignationDTOForm.cs
 ┃ ┃ ┃ ┣ 📜MissionBudgetDTOForm.cs
 ┃ ┃ ┃ ┣ 📜MissionDTOForm.cs
 ┃ ┃ ┃ ┣ 📜MissionReportDTOForm.cs
 ┃ ┃ ┃ ┣ 📜MissionStats.cs
 ┃ ┃ ┃ ┗ 📜MissionValidationDTOs.cs
 ┃ ┃ ┣ 📂transport
 ┃ ┃ ┃ ┗ 📜TransportDTOForm.cs
 ┃ ┃ ┗ 📂users
 ┃ ┃ ┃ ┣ 📜HabilitationDTOForm.cs
 ┃ ┃ ┃ ┣ 📜LoginDto.cs
 ┃ ┃ ┃ ┣ 📜RoleDTOForm.cs
 ┃ ┃ ┃ ┣ 📜RoleHabilitationDTOForm.cs
 ┃ ┃ ┃ ┣ 📜UserDto.cs
 ┃ ┃ ┃ ┗ 📜UserRoleDTOForm.cs
 ┣ 📂Repositories
 ┃ ┣ 📂contract
 ┃ ┃ ┗ 📜ContractTypeRepository.cs
 ┃ ┣ 📂direction
 ┃ ┃ ┣ 📜DepartmentRepository.cs
 ┃ ┃ ┣ 📜DirectionRepository.cs
 ┃ ┃ ┣ 📜ServiceRepository.cs
 ┃ ┃ ┗ 📜UnitRepository.cs
 ┃ ┣ 📂employee
 ┃ ┃ ┣ 📜CategoriesOfEmployeeRepository.cs
 ┃ ┃ ┣ 📜EmployeeCategoryRepository.cs
 ┃ ┃ ┣ 📜EmployeeNationalityRepository.cs
 ┃ ┃ ┣ 📜EmployeeRepository.cs
 ┃ ┃ ┣ 📜GenderRepository.cs
 ┃ ┃ ┣ 📜MaritalStatusRepository.cs
 ┃ ┃ ┣ 📜NationalityRepository.cs
 ┃ ┃ ┗ 📜WorkingTimeTypeRepository.cs
 ┃ ┣ 📂logs
 ┃ ┃ ┗ 📜LogRepository.cs
 ┃ ┣ 📂menu
 ┃ ┃ ┗ 📜MenuRepository.cs
 ┃ ┣ 📂mission
 ┃ ┃ ┣ 📜CompensationScaleRepository.cs
 ┃ ┃ ┣ 📜ExpenseReportRepository.cs
 ┃ ┃ ┣ 📜ExpenseReportTypeRepository.cs
 ┃ ┃ ┣ 📜ExpenseTypeRepository.cs
 ┃ ┃ ┣ 📜LieuRepository.cs
 ┃ ┃ ┣ 📜MissionAssignationRepository.cs
 ┃ ┃ ┣ 📜MissionBudgetRepository.cs
 ┃ ┃ ┣ 📜MissionReportRepository.cs
 ┃ ┃ ┣ 📜MissionRepository.cs
 ┃ ┃ ┣ 📜MissionValidationRepository.cs
 ┃ ┃ ┗ 📜TransportRepository.cs
 ┃ ┣ 📂site
 ┃ ┃ ┗ 📜SiteRepository.cs
 ┃ ┗ 📂users
 ┃ ┃ ┣ 📜HabilitationRepository.cs
 ┃ ┃ ┣ 📜RoleHabilitationRepository.cs
 ┃ ┃ ┣ 📜RoleRepository.cs
 ┃ ┃ ┣ 📜UserRepository.cs
 ┃ ┃ ┗ 📜UserRoleRepository.cs
 ┣ 📂Services
 ┃ ┣ 📂candidates
 ┃ ┣ 📂contract
 ┃ ┃ ┗ 📜ContractTypeService.cs
 ┃ ┣ 📂direction
 ┃ ┃ ┣ 📜DepartmentService.cs
 ┃ ┃ ┣ 📜DirectionService.cs
 ┃ ┃ ┣ 📜ServiceService.cs
 ┃ ┃ ┗ 📜UnitService.cs
 ┃ ┣ 📂employee
 ┃ ┃ ┣ 📜CategoriesOfEmployeeService.cs
 ┃ ┃ ┣ 📜EmployeeCategoryService.cs
 ┃ ┃ ┣ 📜EmployeeNationalityService.cs
 ┃ ┃ ┣ 📜EmployeeService.cs
 ┃ ┃ ┣ 📜GenderService.cs
 ┃ ┃ ┣ 📜MaritalStatusService.cs
 ┃ ┃ ┣ 📜NationalityService.cs
 ┃ ┃ ┗ 📜WorkingTypeService.cs
 ┃ ┣ 📂ldap
 ┃ ┃ ┣ 📂objectclass
 ┃ ┃ ┃ ┗ 📜ObjectClassService.cs
 ┃ ┃ ┗ 📂user
 ┃ ┃ ┃ ┗ 📜LDAPService.cs
 ┃ ┣ 📂logs
 ┃ ┃ ┗ 📜LogService.cs
 ┃ ┣ 📂menu
 ┃ ┃ ┗ 📜MenuService.cs
 ┃ ┣ 📂mission
 ┃ ┃ ┣ 📜CompensationScaleService.cs
 ┃ ┃ ┣ 📜ExpenseReportService.cs
 ┃ ┃ ┣ 📜ExpenseReportTypeService.cs
 ┃ ┃ ┣ 📜ExpenseTypeService.cs
 ┃ ┃ ┣ 📜LieuService.cs
 ┃ ┃ ┣ 📜MissionAssignationService.cs
 ┃ ┃ ┣ 📜MissionBudgetService.cs
 ┃ ┃ ┣ 📜MissionReportService.cs
 ┃ ┃ ┣ 📜MissionService.cs
 ┃ ┃ ┣ 📜MissionValidationService.cs
 ┃ ┃ ┗ 📜TransportService.cs
 ┃ ┣ 📂site
 ┃ ┃ ┗ 📜SiteService.cs
 ┃ ┗ 📂users
 ┃ ┃ ┣ 📜AuthService.cs
 ┃ ┃ ┣ 📜HabilitationService.cs
 ┃ ┃ ┣ 📜RoleHabilitationService.cs
 ┃ ┃ ┣ 📜RoleService.cs
 ┃ ┃ ┣ 📜UserRoleService.cs
 ┃ ┃ ┗ 📜UserService.cs
 ┣ 📂Utils
 ┃ ┣ 📂csv
 ┃ ┃ ┗ 📜CSVReader.cs
 ┃ ┣ 📂cv
 ┃ ┃ ┗ 📜DistanceCalculator.cs
 ┃ ┣ 📂exception
 ┃ ┃ ┗ 📜CustomException.cs
 ┃ ┣ 📂generator
 ┃ ┃ ┗ 📜SequenceGenerator.cs
 ┃ ┗ 📂pdf
 ┃ ┃ ┗ 📜PDFGenerator.cs
 ┣ 📜appsettings.Development.json
 ┣ 📜appsettings.json
 ┣ 📜MyApp.Api.csproj
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┗ 📜Program.cs

Tree FRONTEND

📦src
 ┣ 📂assets
 ┃ ┗ 📂img
 ┃ ┃ ┣ 📜logo.jpg
 ┃ ┃ ┗ 📜R.png
 ┣ 📂components
 ┃ ┣ 📜alert.jsx
 ┃ ┣ 📜auto-complete-input.jsx
 ┃ ┣ 📜file-upload.jsx
 ┃ ┣ 📜generic-badge.jsx
 ┃ ┣ 📜generic-calendar.jsx
 ┃ ┣ 📜generic-form.jsx
 ┃ ┣ 📜generic-search.jsx
 ┃ ┣ 📜generic-stats.jsx
 ┃ ┣ 📜generic-table.jsx
 ┃ ┣ 📜modal.jsx
 ┃ ┣ 📜pagination.jsx
 ┃ ┗ 📜rich-text-editor.jsx
 ┣ 📂config
 ┃ ┗ 📜apiConfig.js
 ┣ 📂features
 ┃ ┗ 📂auth
 ┃ ┃ ┗ 📜login.jsx
 ┣ 📂layouts
 ┃ ┣ 📜profil-page.jsx
 ┃ ┗ 📜template.jsx
 ┣ 📂pages
 ┃ ┣ 📂direction
 ┃ ┃ ┣ 📜department-form.jsx
 ┃ ┃ ┣ 📜direction-form.jsx
 ┃ ┃ ┗ 📜service-form.jsx
 ┃ ┣ 📂employee
 ┃ ┃ ┣ 📜employee-fom.jsx
 ┃ ┃ ┗ 📜employee-list.jsx
 ┃ ┣ 📂habilitation
 ┃ ┃ ┗ 📜habilitation-assign.jsx
 ┃ ┣ 📂lieu
 ┃ ┃ ┗ 📜lieu-form.jsx
 ┃ ┣ 📂logs
 ┃ ┃ ┗ 📜logs-list.jsx
 ┃ ┣ 📂mission
 ┃ ┃ ┣ 📂collaborator
 ┃ ┃ ┃ ┣ 📂details
 ┃ ┃ ┃ ┃ ┗ 📜mission-details.jsx
 ┃ ┃ ┃ ┗ 📂list
 ┃ ┃ ┃ ┃ ┣ 📜collaborator-mission-list.jsx
 ┃ ┃ ┃ ┃ ┣ 📜mission-filters.jsx
 ┃ ┃ ┃ ┃ ┣ 📜mission-modals.jsx
 ┃ ┃ ┃ ┃ ┣ 📜mission-table.jsx
 ┃ ┃ ┃ ┃ ┣ 📜use-mission-data.jsx
 ┃ ┃ ┃ ┃ ┗ 📜validation-stepper.jsx
 ┃ ┃ ┣ 📂excel
 ┃ ┃ ┃ ┗ 📜mission-assign-form-excel.jsx
 ┃ ┃ ┣ 📂form
 ┃ ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┃ ┣ 📜collaborator-step.jsx
 ┃ ┃ ┃ ┃ ┣ 📜compensation-step.jsx
 ┃ ┃ ┃ ┃ ┗ 📜mission-info-step.jsx
 ┃ ┃ ┃ ┣ 📂hooks
 ┃ ┃ ┃ ┃ ┗ 📜use-mission-form.js
 ┃ ┃ ┃ ┗ 📜page.jsx
 ┃ ┃ ┣ 📂list
 ┃ ┃ ┃ ┣ 📜mission-assign-details.jsx
 ┃ ┃ ┃ ┣ 📜mission-assign-list.jsx
 ┃ ┃ ┃ ┣ 📜mission-details.jsx
 ┃ ┃ ┃ ┗ 📜mission-list.jsx
 ┃ ┃ ┗ 📂validation
 ┃ ┃ ┃ ┣ 📜mission-cards.jsx
 ┃ ┃ ┃ ┣ 📜mission-filters.jsx
 ┃ ┃ ┃ ┣ 📜mission-modals.jsx
 ┃ ┃ ┃ ┣ 📜mission-validation.jsx
 ┃ ┃ ┃ ┣ 📜use-mission-validation-data.jsx
 ┃ ┃ ┃ ┗ 📜validation-stepper.jsx
 ┃ ┣ 📂roles
 ┃ ┃ ┣ 📜role-form.jsx
 ┃ ┃ ┣ 📜roles-list.jsx
 ┃ ┃ ┗ 📜user-form.jsx
 ┃ ┣ 📂system
 ┃ ┃ ┗ 📂entite
 ┃ ┃ ┃ ┗ 📜shortcuts.jsx
 ┃ ┣ 📂transport
 ┃ ┃ ┗ 📜transport-form.jsx
 ┃ ┣ 📂users
 ┃ ┃ ┗ 📜users-list.jsx
 ┃ ┗ 📜dashboard.jsx
 ┣ 📂router
 ┃ ┗ 📜AppRouter.js
 ┣ 📂services
 ┃ ┣ 📂auth
 ┃ ┃ ┗ 📜user.js
 ┃ ┣ 📂contract
 ┃ ┃ ┗ 📜contract-type.js
 ┃ ┣ 📂direction
 ┃ ┃ ┣ 📜department.js
 ┃ ┃ ┣ 📜direction.js
 ┃ ┃ ┣ 📜service.js
 ┃ ┃ ┗ 📜unit.js
 ┃ ┣ 📂employee
 ┃ ┃ ┣ 📜employee.js
 ┃ ┃ ┣ 📜gender.js
 ┃ ┃ ┣ 📜marital-status.js
 ┃ ┃ ┗ 📜working-time-type.js
 ┃ ┣ 📂lieu
 ┃ ┃ ┗ 📜lieu.js
 ┃ ┣ 📂logs
 ┃ ┃ ┗ 📜logs.js
 ┃ ┣ 📂mission
 ┃ ┃ ┣ 📜mission.js
 ┃ ┃ ┗ 📜validator-utils.js
 ┃ ┣ 📂site
 ┃ ┃ ┗ 📜site.js
 ┃ ┣ 📂transport
 ┃ ┃ ┗ 📜transport.js
 ┃ ┗ 📂users
 ┃ ┃ ┣ 📜habilitation.js
 ┃ ┃ ┣ 📜roles.js
 ┃ ┃ ┣ 📜role_habilitation.js
 ┃ ┃ ┣ 📜users.js
 ┃ ┃ ┗ 📜user_role.js
 ┣ 📂styles
 ┃ ┣ 📂generaliser
 ┃ ┃ ┣ 📜card-container.js
 ┃ ┃ ┣ 📜details-mission-container.js
 ┃ ┃ ┣ 📜form-container.js
 ┃ ┃ ┣ 📜modal.js
 ┃ ┃ ┣ 📜popup-container.js
 ┃ ┃ ┣ 📜process-container.js
 ┃ ┃ ┣ 📜profil-container.js
 ┃ ┃ ┣ 📜table-container.js
 ┃ ┃ ┣ 📜validation-container.js
 ┃ ┃ ┗ 📜validation-stepper-container.js
 ┃ ┣ 📂mission
 ┃ ┃ ┣ 📜assignment-details-styles.css
 ┃ ┃ ┣ 📜beneficiary-details-popup.css
 ┃ ┃ ┗ 📜beneficiary-popup.css
 ┃ ┣ 📂recruitment
 ┃ ┃ ┣ 📜process.css
 ┃ ┃ ┗ 📜recruitment-request-details.css
 ┃ ┣ 📜alert.css
 ┃ ┣ 📜dashboard.css
 ┃ ┣ 📜generic-calendar-styles.css
 ┃ ┣ 📜generic-form-styles.css
 ┃ ┣ 📜generic-table-styles.css
 ┃ ┣ 📜login.css
 ┃ ┣ 📜popup-styles.css
 ┃ ┣ 📜quill.snow.css
 ┃ ┣ 📜shortcuts.css
 ┃ ┗ 📜template.css
 ┣ 📂utils
 ┃ ┣ 📜apiUtils.js
 ┃ ┣ 📜authUtils.js
 ┃ ┣ 📜dateConverter.js
 ┃ ┣ 📜initials.js
 ┃ ┣ 📜pagination.js
 ┃ ┣ 📜stringUtils.js
 ┃ ┗ 📜validation.js
 ┣ 📜App.css
 ┣ 📜App.js
 ┣ 📜App.test.js
 ┣ 📜index.css
 ┣ 📜index.js
 ┣ 📜logo.svg
 ┣ 📜reportWebVitals.js
 ┗ 📜setupTests.js





 ## 🏗️ Architecture

Le projet suit une architecture microservices avec :

- **Frontend**: React JSX
- **Backend**: Deux microservices .NET Core distincts
  - **UserService**: Gestion de l'authentification et des utilisateurs
  - **EvaluationService**: Gestion des formulaires et évaluations
- **Base de données**: SQL Server Express
- **Communication**: API REST avec authentification JWT