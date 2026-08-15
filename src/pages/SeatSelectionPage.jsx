import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.getShow(showId), api.getSeats(showId)])
      .then(([showData, seatData]) => {
        if (!active) return;
        setShow(showData);
        setSeats(seatData);
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
  }, [showId]);

  const rows = useMemo(() => {
    const map = {};
    seats.forEach((seat) => {
      if (!map[seat.rowLabel]) map[seat.rowLabel] = [];
      map[seat.rowLabel].push(seat);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const total = useMemo(() => {
    if (!show) return 0;
    const base = Number(show.ticketPrice) * selected.length;
    const premiumExtra =
      selected.filter((id) => {
        const seat = seats.find((s) => s.id === id);
        return seat?.seatType === 'PREMIUM';
      }).length * 50;
    return base + premiumExtra;
  }, [show, selected, seats]);

  function toggleSeat(seat) {
    if (seat.booked) return;
    setSelected((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
    );
  }

  async function handleBook(e) {
    e.preventDefault();
    if (selected.length === 0) {
      setError('Select at least one seat');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const booking = await api.createBooking({
        showId: Number(showId),
        name: form.name,
        email: form.email,
        phone: form.phone,
        seatIds: selected,
      });
      navigate(`/booking/${booking.bookingRef}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="status">Loading seats from database…</p>;
  if (!show && error) return <p className="error">{error}</p>;
  if (!show) return null;

  return (
    <section className="seat-page">
      <Link to={`/movies/${show.movieId}`} className="back-link">
        ← Back to shows
      </Link>

      <div className="seat-header">
        <h1>{show.movieTitle}</h1>
        <p>
          {show.theaterName} · {show.screenName} ·{' '}
          {new Date(show.showTime).toLocaleString()}
        </p>
      </div>

      <div className="screen-label">SCREEN</div>

      <div className="seat-map">
        {rows.map(([row, rowSeats]) => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            <div className="seat-cells">
              {rowSeats.map((seat) => {
                const isSelected = selected.includes(seat.id);
                const classes = [
                  'seat',
                  seat.seatType === 'PREMIUM' ? 'premium' : 'regular',
                  seat.booked ? 'booked' : '',
                  isSelected ? 'selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <button
                    key={seat.id}
                    type="button"
                    className={classes}
                    disabled={seat.booked}
                    onClick={() => toggleSeat(seat)}
                    title={seat.label}
                  >
                    {seat.seatNumber}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="legend">
        <span>
          <i className="dot available" /> Available
        </span>
        <span>
          <i className="dot selected" /> Selected
        </span>
        <span>
          <i className="dot booked" /> Booked
        </span>
        <span>
          <i className="dot premium" /> Premium (+₹50)
        </span>
      </div>

      <form className="booking-form" onSubmit={handleBook}>
        <h2>Your details</h2>
        <div className="form-grid">
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Phone
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
        </div>

        <div className="checkout-bar">
          <div>
            <strong>{selected.length}</strong> seat(s) · Total{' '}
            <strong>₹{total.toFixed(0)}</strong>
          </div>
          <button type="submit" disabled={submitting || selected.length === 0}>
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </form>
    </section>
  );
}
