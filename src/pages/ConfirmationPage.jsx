import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function ConfirmationPage() {
  const { bookingRef } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  function load() {
    setLoading(true);
    api
      .getBookingByRef(bookingRef)
      .then(setBooking)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [bookingRef]);

  async function handleCancel() {
    if (!window.confirm('Cancel this booking? Seats will be released.')) return;
    setCancelling(true);
    setError('');
    try {
      const updated = await api.cancelBooking(bookingRef);
      setBooking(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <p className="status">Fetching booking from database…</p>;
  if (error && !booking) return <p className="error">{error}</p>;
  if (!booking) return null;

  return (
    <section className="confirm-page">
      <p className={`status-pill ${booking.status === 'CONFIRMED' ? 'ok' : 'cancelled'}`}>
        {booking.status}
      </p>
      <h1>Booking {booking.bookingRef}</h1>
      <p className="muted">Saved in PostgreSQL — reference this ID anytime.</p>

      <div className="ticket">
        <h2>{booking.show.movieTitle}</h2>
        <p>
          {booking.show.theaterName} · {booking.show.screenName}
        </p>
        <p>{new Date(booking.show.showTime).toLocaleString()}</p>
        <p>
          Seats: <strong>{booking.seats.join(', ')}</strong>
        </p>
        <p>
          Amount: <strong>₹{Number(booking.totalAmount).toFixed(0)}</strong>
        </p>
        <hr />
        <p>
          {booking.userName} · {booking.userEmail} · {booking.userPhone}
        </p>
        <p className="muted">Booked at {new Date(booking.bookingTime).toLocaleString()}</p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <Link to="/" className="btn secondary">
          Book another
        </Link>
        {booking.status === 'CONFIRMED' && (
          <button type="button" className="btn danger" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Cancel booking'}
          </button>
        )}
      </div>
    </section>
  );
}
