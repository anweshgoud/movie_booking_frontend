import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LookupPage() {
  const [ref, setRef] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!ref.trim()) return;
    navigate(`/booking/${ref.trim().toUpperCase()}`);
  }

  return (
    <section className="lookup-page">
      <h1>Find your booking</h1>
      <p className="muted">Enter the booking reference stored in the database.</p>
      <form onSubmit={handleSubmit} className="lookup-form">
        <input
          placeholder="e.g. BK-SAMPLE-001"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
        />
        <button type="submit">Lookup</button>
      </form>
    </section>
  );
}
