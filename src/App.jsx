import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation
} from 'react-router-dom';
import LandingPage from './components/LandingPage';
import BiomarkerInput from './components/BiomarkerInput';
import BiomarkerSelector from './components/BiomarkerSelector';
import PackageRecommendation from './components/PackageRecommendation';
import HakeemChat from './components/HakeemChat';
import { BiomarkerProvider } from './context/BiomarkerContext';
import { useEffect } from 'react';
import './index.css';

// Component to handle reload redirects
const ReloadHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('wasReloaded', 'true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const wasReloaded = sessionStorage.getItem('wasReloaded') === 'true';
    if (wasReloaded && location.pathname !== '/') {
      sessionStorage.removeItem('wasReloaded');
      navigate('/');
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate, location]);

  return children;
};

function App() {
  return (
    <BiomarkerProvider>
      <Router>
        <ReloadHandler>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/packages" element={<BiomarkerInput />} />
            <Route path="/packages/" element={<BiomarkerInput />} />
            <Route path="/packages/select" element={<BiomarkerSelector />} />
            <Route path="/packages/recommend" element={<PackageRecommendation />} />
            <Route path="/hakeem" element={<HakeemChat />} />
            <Route path="/hakeem/" element={<HakeemChat />} />
          </Routes>
        </ReloadHandler>
      </Router>
    </BiomarkerProvider>
  );
}

export default App;
