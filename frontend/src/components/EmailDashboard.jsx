import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmailDashboard.css';

const EmailDashboard = ({ group, setFiltro }) => {
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

  const contactados = stats.totalClientes - stats.sinContacto;

  const enviosOrdenados = Object.entries(stats.últimosEnvios || {}).sort(
    ([, a], [, b]) => new Date(b || 0) - new Date(a || 0)
  );

  const cardStyle = {
    cursor: 'pointer',
    transition: 'transform 0.2s',
  };

  return (
    <div className="email-dashboard">
      <h3>📊 Estadísticas del grupo: {group.replace(/_/g, " ")}</h3>

      <div className="dashboard-cards">
        <div
          className="card"
          style={cardStyle}
          onClick={() => setFiltro(null)}
          title="Ver todos"
        >
          👥 Total clientes: <strong>{stats.totalClientes}</strong>
        </div>
        <div
          className="card"
          style={cardStyle}
          onClick={() => setFiltro('contactados')}
          title="Filtrar contactados"
        >
          📨 Contactados: <strong>{contactados}</strong>
        </div>
        <div
          className="card"
          style={cardStyle}
          onClick={() => setFiltro('sinContacto')}
          title="Filtrar sin contactar"
        >
          🚫 Sin contacto: <strong>{stats.sinContacto}</strong>
        </div>
        <div className="card">
          ✉️ Correos enviados: <strong>{stats.enviados}</strong>
        </div>
      </div>

      <h4>📅 Últimos envíos:</h4>
      {enviosOrdenados.length > 0 ? (
        <ul>
          {enviosOrdenados.map(([email, date]) => (
            <li key={email}>
              {email} — {date ? new Date(date).toLocaleString() : "Nunca enviado"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay registros de envío recientes 📭</p>
      )}
    </div>
  );
};

export default EmailDashboard;