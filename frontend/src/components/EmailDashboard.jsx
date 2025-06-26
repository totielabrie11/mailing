import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmailDashboard.css';

const EmailDashboard = ({ group, setFiltro }) => {
  const [stats, setStats] = useState(null);
  const [rankingPorGrupo, setRankingPorGrupo] = useState({});
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

  useEffect(() => {
    const fetchRankingPorGrupo = async () => {
      const grupos = ['nuevos', 'viejos', 'compras_recientes'];
      const resultado = {};

      try {
        for (const g of grupos) {
          const res = await axios.get(`http://localhost:5000/api/clients/${g}`);
          const clientes = res.data;

          const formateados = clientes
            .filter(c => typeof c !== 'string' && c.vecesContactado > 0)
            .map(c => ({
              email: c.email,
              veces: c.vecesContactado || 0
            }))
            .sort((a, b) => b.veces - a.veces);

          if (formateados.length > 0) {
            resultado[g] = formateados;
          }
        }

        setRankingPorGrupo(resultado);
      } catch (err) {
        console.error("Error al obtener ranking por grupo:", err);
      }
    };

    fetchRankingPorGrupo();
  }, []);

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
        <div className="card" style={cardStyle} onClick={() => setFiltro(null)}>
          👥 Total clientes: <strong>{stats.totalClientes}</strong>
        </div>
        <div className="card" style={cardStyle} onClick={() => setFiltro('contactados')}>
          📨 Contactados: <strong>{contactados}</strong>
        </div>
        <div className="card" style={cardStyle} onClick={() => setFiltro('sinContacto')}>
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

      <h4 style={{ marginTop: 20 }}>🏆 Actividad por grupo:</h4>
      {Object.keys(rankingPorGrupo).length > 0 ? (
        Object.entries(rankingPorGrupo).map(([grupo, clientes]) => (
          <div key={grupo} style={{ marginBottom: 16 }}>
            <strong style={{ textTransform: 'capitalize' }}>
              🔹 {grupo.replace(/_/g, ' ')}:
            </strong>
            <ul style={{ marginTop: 6 }}>
              {clientes.map((c, idx) => (
                <li key={idx}>
                  {c.email} — <strong>{c.veces}</strong> {c.veces === 1 ? 'vez' : 'veces'}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No hay actividad registrada aún 🕵️</p>
      )}
    </div>
  );
};

export default EmailDashboard;