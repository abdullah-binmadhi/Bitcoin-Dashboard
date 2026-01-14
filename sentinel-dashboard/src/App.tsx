import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Orbit } from '@/pages/Orbit';
import { Mechanic } from '@/pages/Mechanic';
import { RiskOfficer } from '@/pages/RiskOfficer';
import { Architect } from '@/pages/Architect';
import { Scanner } from '@/pages/Scanner';
import { Correlator } from '@/pages/Correlator';
import { Newsroom } from '@/pages/Newsroom';
import { WhaleWatcher } from '@/pages/WhaleWatcher';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Orbit />} />
          <Route path="/mechanic" element={<Mechanic />} />
          <Route path="/architect" element={<Architect />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/correlator" element={<Correlator />} />
          <Route path="/risk-officer" element={<RiskOfficer />} />
          <Route path="/newsroom" element={<Newsroom />} />
          <Route path="/whale-watcher" element={<WhaleWatcher />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
