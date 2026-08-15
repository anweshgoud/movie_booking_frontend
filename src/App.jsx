import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LookupPage from './pages/LookupPage';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/shows/:showId/seats" element={<SeatSelectionPage />} />
          <Route path="/booking/:bookingRef" element={<ConfirmationPage />} />
          <Route path="/lookup" element={<LookupPage />} />
        </Routes>
      </main>
    </div>
  );
}
