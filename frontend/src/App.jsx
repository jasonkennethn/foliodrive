import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PortfolioProvider } from './context/PortfolioContext';
import Portfolio from './pages/Portfolio';
import MasterAdmin from './pages/MasterAdmin';
import RootAdmin from './pages/RootAdmin';
import LandingPage from './pages/LandingPage';
import ShowcaseResume from './pages/ShowcaseResume';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/showcase" element={<ShowcaseResume />} />
            <Route path="/master-admin" element={<MasterAdmin />} />
            <Route path="/root-admin" element={<RootAdmin />} />
            <Route path="/:username" element={<Portfolio />} />
            <Route path="/:username/showcase" element={<ShowcaseResume />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PortfolioProvider>
    </ThemeProvider>
  );
}

export default App;
