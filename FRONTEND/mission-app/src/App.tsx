import { Routes, Route, Outlet } from 'react-router-dom';
import LoginPage from '@/features/auth/login';
import Template from '@/layouts/template';
import HomePage from '@/pages/Home';
import UserList from '@/pages/users';
import LogList from '@/pages/logs';
import RoleList from '@/pages/access';
import Error403Page from '@/pages/error/403';
import ProfilePage from '@/layouts/profil-page';
import MissionList from '@/pages/mission/collaborator/list/mission-list';
import MissionValidationPage from '@/pages/mission/validation';

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<Template><Outlet /></Template>}>
      <Route path="/profil-page" element={<ProfilePage />} />
        {/* ADMIN */}
        
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/utilisateur" element={<UserList />} />
        <Route path="/logs" element={<LogList />} />
        <Route path="/access/list" element={<RoleList />} />
        
        {/* MISSION */}
        <Route path="/mission/collaborateur" element={<MissionList />} />
        <Route path="/mission/to-validate" element={<MissionValidationPage />} />
        
        {/* ERROR */}
        <Route path="/403" element={<Error403Page />} />

      </Route>
    </Routes>
  );
}

export default App;