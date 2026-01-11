import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Orbit } from '@/pages/Orbit';
import { Mechanic } from '@/pages/Mechanic';
import { RiskOfficer } from '@/pages/RiskOfficer';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Orbit />} />
          <Route path="/mechanic" element={<Mechanic />} />
          <Route path="/risk-officer" element={<RiskOfficer />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
