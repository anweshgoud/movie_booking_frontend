import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie.id}`} className="movie-card">
      <div className="poster-wrap">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={movie.title} loading="lazy" />
        ) : (
          <div className="poster-fallback">{movie.title.charAt(0)}</div>
        )}
        <span className="rating-badge">{Number(movie.rating).toFixed(1)}</span>
      </div>
      <div className="movie-meta">
        <h3>{movie.title}</h3>
        <p>
          {movie.genre} · {movie.language} · {movie.durationMins} min
        </p>
      </div>
    </Link>
  );
}
