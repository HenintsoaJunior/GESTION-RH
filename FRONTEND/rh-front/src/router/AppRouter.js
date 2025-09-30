import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Login from 'features/auth/login';
import Template from 'layouts/template';
import DirectionForm from 'pages/direction/direction-form';
import DepartmentForm from 'pages/direction/department-form';
import ServiceForm from 'pages/direction/service-form';
import MissionForm from 'pages/mission/form/page';
import TransportForm from 'pages/transport/transport-form';
import DashboardHome from 'pages/dashboard';
import LieuForm from 'pages/lieu/lieu-form';
import MissionAssignationFormExcel from 'pages/mission/excel/mission-assign-form-excel';
import ShortcutsDashboard from 'pages/system/entite/shortcuts';
import EmployeeList from 'pages/employee/employee-list';
import EmployeeForm from 'pages/employee/employee-fom';
import CollaboratorMissionList from 'pages/mission/collaborator/list/page';
import MissionValidationPage from 'pages/mission/validation/page';
import ProfilePage from 'layouts/profil-page';
import UserList from 'pages/users/users-list';
import RoleList from 'pages/roles/roles-list';
import LogList from 'pages/logs/logs-list';
import Notifications from 'pages/notifications/page';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Template><Outlet /></Template>}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/profil-page" element={<ProfilePage />} />
          {/* logs */}
          <Route path="/logs" element={<LogList />} />
          {/* notifications */}
          <Route path="/notifications" element={<Notifications />} />

          {/* Utilisateur */}
          <Route path="/utilisateur" element={<UserList />} />
          <Route path="/role/list" element={<RoleList />} />
          
          {/* Employee */}
          <Route path="/employee/edit/:employeeId" element={<EmployeeForm />} />
          <Route path="/employee/list" element={<EmployeeList />} />
          <Route path="/employee/create" element={<EmployeeForm />} />

          <Route path="/direction/direction-form" element={<DirectionForm />} />
          <Route path="/direction/department-form" element={<DepartmentForm />} />
          <Route path="/direction/service-form" element={<ServiceForm />} />

          {/* Mission */}
          <Route path="/mission/form/:missionId" element={<MissionForm />} />
          <Route path="/mission/form" element={<MissionForm />} />
          <Route path="/mission/to-validate" element={<MissionValidationPage />} />
          <Route path="/assignments/excel" element={<MissionAssignationFormExcel />} />
          <Route path="/mission/collaborateur" element={<CollaboratorMissionList />} />

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
