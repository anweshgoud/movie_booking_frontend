const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  getMovies: (upcomingOnly = true) =>
    request(`/movies?upcomingOnly=${upcomingOnly}`),

  getMovie: (id) => request(`/movies/${id}`),

  getShowsByMovie: (movieId) => request(`/shows/movie/${movieId}`),

  getShow: (id) => request(`/shows/${id}`),

  getSeats: (showId) => request(`/shows/${showId}/seats`),

  getTheaters: (city) =>
    request(city ? `/theaters?city=${encodeURIComponent(city)}` : '/theaters'),

  createBooking: (payload) =>
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getBookingByRef: (ref) => request(`/bookings/ref/${ref}`),

  cancelBooking: (ref) =>
    request(`/bookings/ref/${ref}/cancel`, { method: 'PUT' }),
};
