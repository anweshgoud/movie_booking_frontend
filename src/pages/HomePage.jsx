import { useEffect, useState } from 'react';
import { api } from '../api/client';
import MovieCard from '../components/MovieCard';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getMovies(true)
      .then((data) => {
        if (active) setMovies(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="home">
      <div className="hero">
        <p className="eyebrow">Now showing</p>
        <h1>CineBook</h1>
        <p className="hero-sub">Pick a film. Choose seats. Book in seconds.</p>
      </div>

      {loading && <p className="status">Loading movies from database…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
          {movies.length === 0 && (
            <p className="status">No upcoming shows found. Seed the database and restart the API.</p>
          )}
        </div>
      )}
    </section>
  );
}
