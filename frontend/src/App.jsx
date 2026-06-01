import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PortfolioProvider } from './context/PortfolioContext';
import Portfolio from './pages/Portfolio';
import MasterAdmin from './pages/MasterAdmin';
import RootAdmin from './pages/RootAdmin';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/master-admin" element={<MasterAdmin />} />
            <Route path="/root-admin" element={<RootAdmin />} />
            <Route path="/:username" element={<Portfolio />} />
          </Routes>
        </BrowserRouter>
      </PortfolioProvider>
    </ThemeProvider>
  );
}

export default App;
