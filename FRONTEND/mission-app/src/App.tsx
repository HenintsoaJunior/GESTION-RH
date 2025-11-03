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
import DetailsMission from '@/pages/mission/collaborator/details/mission-details';
import MissionValidationPage from '@/pages/mission/validation';
import TresoPage from '@/pages/mission/treso';
import Compensation from '@/pages/mission/treso/components/compensation';
import ProtectedHabilitationList from '@/pages/access/habilitation';
import ImportPage from '@/pages/import';
import Referentiel from '@/pages/referentiel';
import DirectionList from '@/pages/referentiel/direction/list';
import DepartmentList from '@/pages/referentiel/department/list';
import ServiceList from '@/pages/referentiel/service/list';
import SiteList from '@/pages/referentiel/site/list';
import GenderList from '@/pages/referentiel/gender/list';
import ContractTypeList from './pages/referentiel/contract/list';
import UnitList from '@/pages/referentiel/unit/list';
import EmployeeList from '@/pages/referentiel/collaborateur/list';
import LieuList from '@/pages/referentiel/lieu/list';
import MissionListArchive from './pages/mission/collaborator/list/mission-list-archive';
import TransportList from '@/pages/referentiel/transport/list';
import GeoZoneList from '@/pages/referentiel/zone/list';
import CompensationScalesPage from '@/pages/referentiel/compensation-scale';
// import { useAuthSync } from '@/utils/use-auth-sync';
function App() {

  // useAuthSync();
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      
     

      
      <Route element={<Template><Outlet /></Template>}>
        {/* IMPORT */}
        <Route path="/import" element={<ImportPage />} />
        
        <Route path="/profil-page" element={<ProfilePage />} />
        {/* ADMIN */}
        
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/utilisateur" element={<UserList />} />
        <Route path="/logs" element={<LogList />} />
        <Route path="/access/list" element={<RoleList />} />
        <Route path="/habilitation" element={<ProtectedHabilitationList />} />
        <Route path="/referentiel" element={<Referentiel />} />
        <Route path="/referentiel/direction" element={<DirectionList />} />
        <Route path="/referentiel/department" element={<DepartmentList />} />
        <Route path="/referentiel/service" element={<ServiceList />} />
        <Route path="/referentiel/site" element={<SiteList />} />
        <Route path="/referentiel/genders" element={<GenderList />} />
        <Route path="/referentiel/contract" element={<ContractTypeList />} />
        <Route path="/referentiel/unit" element={<UnitList />} />
        <Route path="/referentiel/collaborator" element={<EmployeeList />} />
        <Route path="/referentiel/lieu" element={<LieuList />} />
        <Route path="/referentiel/transport" element={<TransportList />} />
        <Route path="/referentiel/compensation-scale" element={<CompensationScalesPage />} />
        <Route path="/referentiel/geo-zone" element={<GeoZoneList />} />
        

         {/* MISSION */}
        <Route path="/mission/list" element={<MissionList />} />
        <Route path="/mission/archived" element={<MissionListArchive />} /> 
        <Route path="/mission/collaborateur/:missionId/*" element={<DetailsMission />} />
        <Route path="/mission/to-validate" element={<MissionValidationPage />} />
        {/* TRESO */}
        <Route path="/treasury" element={<TresoPage />} />
        <Route path="/treasury/compensation" element={<Compensation />} />

        
        {/* ERROR */}
        <Route path="/403" element={<Error403Page />} />
      </Route>
    </Routes>
  );
}

export default App;