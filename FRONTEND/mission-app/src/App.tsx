import { Routes, Route, Outlet } from 'react-router-dom';
import LoginPage from '@/features/auth/login';
import Template from '@/layouts/template';
import UserList from '@/pages/users';
import LogList from '@/pages/logs';
import RoleList from '@/pages/access';
import Error403Page from '@/pages/error/403';
import ProfilePage from '@/layouts/profil-page';
import MissionList from '@/pages/mission/collaborator/list/index';
import DetailsMission from '@/pages/mission/collaborator/details/mission-details';
import MissionValidationPage from '@/pages/mission/validation';
import TresoPage from '@/pages/mission/treso';
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
import TransportList from '@/pages/referentiel/transport/list';
import GeoZoneList from '@/pages/referentiel/zone/list';
import CompensationScalesPage from '@/pages/referentiel/compensation-scale';
import CompensationMission from '@/pages/mission/treso/components/compensation_mission';
import Reimbursement from '@/pages/mission/treso/components/reimbursement';
import MissionsEnCoursMapPage from './pages/maps';
import Home from '@/pages/Home';
import RequestList from './pages/recruitment/request/request-list';
import ProtectedRequestDetails from './pages/recruitment/request/request-details';
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
        <Route path="/dashboard" element={<Home />} />
        {/* <Route path="/tableau-bord" element={<TableauBord />} /> */}
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
        <Route path="/mission/maps" element={<MissionsEnCoursMapPage />} />

        <Route path="/mission/collaborateur/:missionId/*" element={<DetailsMission />} />
        <Route path="/mission/to-validate" element={<MissionValidationPage />} />
        {/* TRESO */}
        <Route path="/treasury" element={<TresoPage />} />
        <Route path="/treasury/compensation" element={<CompensationMission />} />
        <Route path="/treasury/remboursement" element={<Reimbursement />} />

        <Route path="/recrutement/demandes/liste" element={<RequestList />} />
        <Route path="/recrutement/demandes/:id/details" element={<ProtectedRequestDetails />} />
        
        {/* ERROR */}
        <Route path="/403" element={<Error403Page />} />
      </Route>
    </Routes>
  );
}

export default App;