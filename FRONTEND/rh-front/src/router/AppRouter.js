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

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Template><Outlet /></Template>}>
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
