import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const DropManager = ({ onManualUpdate, onDropTransfer, group }) => {
  const [dropClients, setDropClients] = useState([]);
  const [email, setEmail] = useState("");

  const timeSince = (isoDate) => {
    if (!isoDate) return "No enviado aún";
    const diff = Date.now() - new Date(isoDate).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoy";
    if (days === 1) return "Hace 1 día";
    return `Hace ${days} días`;
  };

  const addDropClient = async () => {
    if (!email) return toast.error("Ingrese un correo válido ❗");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return toast.error("Correo inválido 😓");

    if (dropClients.find(c => c.email === email)) return toast.warn("Este correo ya está en la lista ⚠️");

    const newClient = { email, lastSent: null };
    const updated = [...dropClients, newClient];
    setDropClients(updated);
    onManualUpdate && onManualUpdate(updated);
    toast.success("Correo añadido ✉️");

    // ✅ Confirmar persistencia
    const confirmSave = window.confirm("¿Deseas agregar este correo también a la base de datos?");
    if (confirmSave && group !== "ninguno") {
      try {
        await axios.post(`http://localhost:5000/api/clients/${group}`, { email });
        toast.success("Guardado en la base de datos ✔️");
      } catch (err) {
        if (err.response?.status === 409) toast.info("Ya existe en la base de datos ⚠️");
        else toast.error("Error al guardar en DB ❌");
        console.error(err);
      }
    }

    setEmail("");
  };

  const deleteDropClient = (emailToDelete) => {
    const updated = dropClients.filter(c => c.email !== emailToDelete);
    setDropClients(updated);
    onManualUpdate && onManualUpdate(updated);
    toast.info("Correo eliminado ❌");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;

    try {
      const draggedClient = JSON.parse(data);
      if (!draggedClient?.email) return;

      if (dropClients.find(c => c.email === draggedClient.email)) {
        return toast.warn("Este correo ya está en DropManager ⚠️");
      }

      const updated = [...dropClients, { ...draggedClient, lastSent: null }];
      setDropClients(updated);
      onManualUpdate && onManualUpdate(updated);

      if (onDropTransfer) onDropTransfer(draggedClient.email);

      toast.success("Cliente movido a DropManager ✔️");
    } catch (err) {
      toast.error("Error al procesar el elemento arrastrado 😵");
      console.error(err);
    }
  };

  return (
    <div>
      <h3>📥 DropManager: Correos manuales</h3>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          padding: '20px',
          border: '2px dashed #888',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: '#fafafa',
          textAlign: 'center',
          color: '#555'
        }}
      >
        📤 Arrastra aquí desde ClientManager para mover correos
      </div>

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
        <button onClick={addDropClient} style={{ padding: '8px 12px' }}>
          Agregar
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {dropClients.map((client, idx) => (
          <div
            key={idx}
            style={{
              padding: '10px 14px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              minWidth: '260px',
              position: 'relative'
            }}
          >
            <div style={{ fontWeight: 500 }}>{client.email}</div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginBottom: 8 }}>
              Último envío: {timeSince(client.lastSent)}
            </div>
            <button
              onClick={() => deleteDropClient(client.email)}
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

export default DropManager;
