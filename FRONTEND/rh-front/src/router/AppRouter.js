import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Login from '../features/auth/Login';
import Dashboard from '../pages/Dashboard';
import Home from '../pages/Home';
import Candidature from '../pages/Condidature'
import Template from '../layouts/Template';
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Template><Outlet /></Template>}>
          <Route path="/recrutement/candidatures" element={<Candidature />} />
          <Route path="/recrutement/entretiens" element={<Home />} />
          <Route path="/admin/documents" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;