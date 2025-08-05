import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Login from 'features/auth/login';
import Template from 'layouts/template';
import RecruitmentRequestForm from 'pages/recruitment/recruitments_request/recruitment-request-form';
import RecruitmentRequestList from 'pages/recruitment/recruitments_request/recruitment-request-list';
import RecruitmentRequestDetails from 'pages/recruitment/recruitments_request/recruitment-request-details';
import ContractTypeForm from 'pages/recruitment/contract/contract-type-form';
import DirectionForm from 'pages/direction/direction-form';
import DepartmentForm from 'pages/direction/department-form';
import ServiceForm from 'pages/direction/service-form';
import ProcessWorkflow from 'pages/recruitment/recruitments_request/process';
import MissionForm from 'pages/mission/mission-form';
import MissionList from 'pages/mission/mission-list';
import AssignMissionForm from 'pages/mission/mission-assign-form';
import AssignedPersonsList from 'pages/mission/mission-assign-list';
import AssignmentDetails from 'pages/mission/mission-assign-details';
import TransportForm from 'pages/transport/transport-form';
import DashboardHome from 'pages/dashboard';
import LieuForm from 'pages/lieu/lieu-form';
import MissionAssignationFormExcel from 'pages/mission/mission-assign-form-excel';
import ShortcutsDashboard from 'pages/system/entite/shortcuts';
import EmployeeList from 'pages/employee/employee-list';
import EmployeeForm from 'pages/employee/employee-fom';
import BeneficiaryMissionList from 'pages/mission/benificary-mission-list';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Template><Outlet /></Template>}>
          <Route path="/dashboard" element={<DashboardHome />} />
          
          {/* Employee */}
          <Route path="/employee/edit/:employeeId" element={<EmployeeForm />} />
          <Route path="/employee/list" element={<EmployeeList />} />
          <Route path="/employee/create" element={<EmployeeForm />} />
          

          {/* Recrutement */}
          <Route path="/recruitment/recruitment-request/list" element={<RecruitmentRequestList />} />
          <Route path="/recruitment/recruitment-request/create" element={<RecruitmentRequestForm />} />
          <Route path="/recruitment/recruitment-request/details/:recruitmentRequestId" element={<RecruitmentRequestDetails />} />
          <Route path="/recruitment/process/:recruitmentRequestId" element={<ProcessWorkflow />} />

          {/* Entite */}
          <Route path="/recruitment/contract-type-form" element={<ContractTypeForm />} />
          <Route path="/direction/direction-form" element={<DirectionForm />} />
          <Route path="/direction/department-form" element={<DepartmentForm />} />
          <Route path="/direction/service-form" element={<ServiceForm />} />

          {/* Mission */}
          <Route path="/mission/create" element={<MissionForm />} />
          <Route path="/mission/list" element={<MissionList />} />
          <Route path="/mission/assign" element={<AssignMissionForm />} />
          <Route path="/mission/assign-mission/:missionId" element={<AssignedPersonsList />} />
          <Route path="/assignments/details" element={<AssignmentDetails />} />
          <Route path="/assignments/excel" element={<MissionAssignationFormExcel />} />
          <Route path="/mission/beneficiary" element={<BeneficiaryMissionList />} />

          
          {/* Transport */}
          <Route path="/transport/create" element={<TransportForm />} />

          {/* Lieu */}
          <Route path="/lieu/create" element={<LieuForm />} />
          
          {/* ShortCuts */}
          <Route path="/entite" element={<ShortcutsDashboard />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
