import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../features/auth/Login';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/about" element={<About />} /> */}
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
