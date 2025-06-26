import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmailDashboard.css';

const EmailDashboard = ({ group }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!group || group === 'ninguno') return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/stats/${group}`);
        setStats(res.data);
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [group]);

  if (!group || group === 'ninguno') {
    return <p>Selecciona un grupo para ver estadísticas 📊</p>;
  }

  if (loading) {
    return <p>Cargando estadísticas...</p>;
  }

  if (!stats) {
    return <p>No hay datos disponibles para este grupo 😕</p>;
  }

  return (
    <div className="email-dashboard">
      <h3>📊 Estadísticas del grupo: {group.replace(/_/g, " ")}</h3>
      <div className="dashboard-cards">
        <div className="card">👥 Total clientes: <strong>{stats.totalClientes}</strong></div>
        <div className="card">✉️ Correos enviados: <strong>{stats.enviados}</strong></div>
        <div className="card">🚫 Sin contacto: <strong>{stats.sinContacto}</strong></div>
      </div>

      <h4>📅 Últimos envíos:</h4>
      <ul>
        {Object.entries(stats.últimosEnvios).map(([email, date]) => (
          <li key={email}>
            {email} — {date ? new Date(date).toLocaleDateString() : "Nunca"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmailDashboard;