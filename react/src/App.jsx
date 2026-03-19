import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Forsida from './pages/Forsida';
import BokaTima from './pages/BokaTima';
import Ferlid from './pages/Ferlid';
import AlgengarSpurningar from './pages/AlgengarSpurningar';
import Gjafabref from './pages/Gjafabref';
import Verdskra from './pages/Verdskra';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Forsida />} />
          <Route path="/boka-tima" element={<BokaTima />} />
          <Route path="/ferlid" element={<Ferlid />} />
          <Route path="/algengar-spurningar" element={<AlgengarSpurningar />} />
          <Route path="/gjafabref" element={<Gjafabref />} />
          <Route path="/verdskra" element={<Verdskra />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
