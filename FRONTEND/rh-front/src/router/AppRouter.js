import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Login from '../features/auth/Login';
import Dashboard from '../pages/Dashboard';
import Template from '../layouts/Template';
import RecruitmentRequestForm from '../pages/recruitment/recruitments_request/recruitment-request-form';
import RecruitmentRequestList from '../pages/recruitment/recruitments_request/recruitment-request-list';
import PDFViewer from '../pages/recruitment/recruitments_request/pdf/pdf-viewer';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Template><Outlet /></Template>}>
          <Route path="/recruitment/recruitment-request" element={<RecruitmentRequestList />} />
          <Route path="/recruitment/recruitment-request-form" element={<RecruitmentRequestForm />} />
          <Route path="/recruitment/recruitment-request/:recruitmentRequestId/files" element={<PDFViewer />} />
          <Route path="/admin/documents" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;