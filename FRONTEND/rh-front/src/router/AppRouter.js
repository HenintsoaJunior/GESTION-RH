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

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Template><Outlet /></Template>}>
          <Route path="/recruitment/recruitment-request" element={<RecruitmentRequestList />} />
          <Route path="/recruitment/recruitment-request-form" element={<RecruitmentRequestForm />} />
          <Route path="/recruitment/recruitment-request-details/:recruitmentRequestId" element={<RecruitmentRequestDetails />} />
          <Route path="/recruitment/contract-type-form" element={<ContractTypeForm />} />
          <Route path="/direction/direction-form" element={<DirectionForm />} />
          <Route path="/direction/department-form" element={<DepartmentForm />} />
          <Route path="/direction/service-form" element={<ServiceForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;