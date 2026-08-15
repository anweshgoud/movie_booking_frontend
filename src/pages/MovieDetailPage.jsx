import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

function formatShowTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.getMovie(id), api.getShowsByMovie(id)])
      .then(([movieData, showData]) => {
        if (!active) return;
        setMovie(movieData);
        setShows(showData);
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
  }, [id]);

  if (loading) return <p className="status">Loading movie details…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!movie) return null;

  const grouped = shows.reduce((acc, show) => {
    const key = `${show.theaterName} · ${show.city}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(show);
    return acc;
  }, {});

  return (
    <section className="movie-detail">
      <Link to="/" className="back-link">
        ← All movies
      </Link>

      <div className="detail-layout">
        <div className="detail-poster">
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={movie.title} />
          ) : (
            <div className="poster-fallback large">{movie.title.charAt(0)}</div>
          )}
        </div>

        <div className="detail-body">
          <h1>{movie.title}</h1>
          <p className="detail-tags">
            {movie.genre} · {movie.language} · {movie.durationMins} min · ★{' '}
            {Number(movie.rating).toFixed(1)}
          </p>
          <p className="detail-desc">{movie.description}</p>

          <h2>Select a show</h2>
          {shows.length === 0 && <p className="status">No upcoming shows for this movie.</p>}

          {Object.entries(grouped).map(([theater, theaterShows]) => (
            <div key={theater} className="theater-block">
              <h3>{theater}</h3>
              <p className="muted">{theaterShows[0].theaterLocation}</p>
              <div className="show-times">
                {theaterShows.map((show) => (
                  <Link key={show.id} to={`/shows/${show.id}/seats`} className="show-chip">
                    <span>{formatShowTime(show.showTime)}</span>
                    <span className="price">₹{Number(show.ticketPrice).toFixed(0)}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
