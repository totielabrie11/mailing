import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ClientManager = ({ onClientsUpdate, group, setGroup }) => {
  const [clients, setClients] = useState([]);
  const [email, setEmail] = useState("");

  const timeSince = (isoDate) => {
    if (!isoDate) return "Nunca contactado";
    const diff = Date.now() - new Date(isoDate).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoy";
    if (days === 1) return "Hace 1 día";
    return `Hace ${days} días`;
  };

  const loadClients = useCallback(async (selectedGroup) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/clients/${selectedGroup}`);
      const formatted = (res.data || []).map((item) =>
        typeof item === 'string' ? { email: item, lastSent: null } : item
      );
      setClients(formatted);
      onClientsUpdate(formatted);
    } catch (err) {
      toast.error("Error al cargar clientes 😵");
      console.error(err);
    }
  }, [onClientsUpdate]);

  useEffect(() => {
    if (group === "ninguno") {
      setClients([]);
      onClientsUpdate([]);
    } else {
      loadClients(group);
    }
  }, [group, loadClients]);

  const addClient = async () => {
    if (!email) return toast.error("Debe ingresar un correo válido ❗");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return toast.error("Correo inválido 😓");

    if (clients.find(c => c.email === email)) return toast.warn("Este correo ya fue agregado ⚠️");

    try {
      const res = await axios.post(`http://localhost:5000/api/clients/${group}`, { email });
      const newClient = { ...res.data, lastSent: null };
      const updated = [...clients, newClient];
      setClients(updated);
      onClientsUpdate(updated);
      setEmail("");
      toast.success("Cliente agregado ✔️");
    } catch (err) {
      if (err.response?.status === 409) toast.warn("Este cliente ya está registrado ⚠️");
      else toast.error("Error al guardar en el servidor 😵");
      console.error(err);
    }
  };

  const deleteClient = async (emailToDelete) => {
    try {
      await axios.delete(`http://localhost:5000/api/clients/${group}/${encodeURIComponent(emailToDelete)}`);
      const updated = clients.filter(c => c.email !== emailToDelete);
      setClients(updated);
      onClientsUpdate(updated);
      toast.success("Correo eliminado ❌");
    } catch (err) {
      toast.error("No se pudo eliminar el correo");
      console.error(err);
    }
  };

  return (
    <div>
      <h3>📇 Lista de Clientes: {group.replace(/_/g, " ")}</h3>

      <select
        value={group}
        onChange={(e) => setGroup(e.target.value)}
        style={{
          marginBottom: 12,
          padding: '6px 10px',
          borderRadius: 4,
          border: '1px solid #ccc'
        }}
      >
        <option value="ninguno">Ninguno</option>
        <option value="nuevos">Nuevos</option>
        <option value="viejos">Viejos</option>
        <option value="compras_recientes">Compras recientes</option>
      </select>

      <div style={{ marginBottom: 12 }}>
        <input
          type="email"
          placeholder="email@cliente.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginRight: '8px',
            width: '260px'
          }}
        />
        <button onClick={addClient} style={{ padding: '8px 12px' }}>
          Agregar
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {clients.map((client, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", JSON.stringify(client));
              e.dataTransfer.effectAllowed = "move";
            }}
            style={{
              padding: '10px 14px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              minWidth: '260px',
              position: 'relative',
              cursor: 'grab'
            }}
          >
            <div style={{ fontWeight: 500 }}>{client.email}</div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginBottom: 8 }}>
              Último envío: {timeSince(client.lastSent)}
            </div>
            <button
              onClick={() => deleteClient(client.email)}
              style={{
                position: 'absolute',
                top: 8,
                right: 10,
                background: 'transparent',
                border: 'none',
                color: 'crimson',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientManager;
