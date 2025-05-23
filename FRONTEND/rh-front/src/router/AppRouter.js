import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../features/auth/Login';
import Dashboard from '../pages/Dashboard';
import Home from '../pages/Home';
import Candidature from '../pages/Condidature';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        
        {<Route path="/new-candidates" element={<Candidature />} />}
        {<Route path="/all-candidates" element={<Home />} />}
        {<Route path="/dashboard" element={<Dashboard />} />}
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
