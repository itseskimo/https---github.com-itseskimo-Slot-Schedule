import './App.css';
import PhysioView from './pages/PhysioView/PhysioView';
import OperationsView from './pages/OperationsView/OperationsView';
import Auth from './pages/Auth/Auth';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PatientView from './pages/PatientView/PatientView';
function App() {



  return (
    <Router>
      <Routes>
        {/* --------------USER VIEW------------------ */}
        <Route path="/" element={<Auth />} />
        <Route path="/physio" element={<PhysioView />} />
        <Route path="/operations" element={<OperationsView />} />
        <Route path="/patient" element={<PatientView/>} />
      </Routes>
    </Router>
  );
}

export default App;
