import React, { useState } from 'react';
import ClientManager from './components/ClientManager';
import DropManager from './components/DropManager';
import EmailTemplateEditor from './components/EmailTemplateEditor';
import EmailSender from './components/EmailSender';
import EmailDashboard from './components/EmailDashboard';
import { ToastContainer } from 'react-toastify';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [clients, setClients] = useState([]);
  const [dropClients, setDropClients] = useState([]);
  const [template, setTemplate] = useState(null);

  const [clientGroup, setClientGroup] = useState("nuevos");
  const [templateGroup, setTemplateGroup] = useState("nuevos");

  const [filtro, setFiltro] = useState(null);
  const [mostrarDrag, setMostrarDrag] = useState(true);

  const effectiveRecipients = clientGroup === "ninguno" ? dropClients : clients;

  const handleDropTransfer = (emailToRemove) => {
    setClients(prev => prev.filter(c => c.email !== emailToRemove));
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif', position: 'relative' }}>
      <h1 style={{ marginLeft: mostrarDrag ? 320 : 20 }}>📬 React Mailing App</h1>

      {/* 🧲 Sidebar con scroll */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: mostrarDrag ? 0 : -320,
        width: 300,
        height: '100vh',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #ccc',
        boxShadow: '2px 0 6px rgba(0,0,0,0.1)',
        padding: 0,
        overflow: 'hidden',
        transition: 'left 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <DropManager
            onManualUpdate={setDropClients}
            onDropTransfer={handleDropTransfer}
            group={clientGroup}
          />
        </div>
      </div>

      {/* 🔘 Botón para abrir/cerrar sidebar */}
      <div style={{
        position: 'fixed',
        top: 20,
        left: mostrarDrag ? 300 : 0,
        zIndex: 1100,
        transition: 'left 0.3s ease'
      }}>
        <button
          onClick={() => setMostrarDrag(prev => !prev)}
          style={{
            padding: '6px 10px',
            borderRadius: mostrarDrag ? '0 6px 6px 0' : '6px',
            border: '1px solid #ccc',
            backgroundColor: '#f4f4f4',
            cursor: 'pointer',
            boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
          }}
        >
          {mostrarDrag ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      {/* 🔻 Contenido principal */}
      <div style={{ marginLeft: mostrarDrag ? 320 : 20, transition: 'margin-left 0.3s ease' }}>
        <section style={{ marginBottom: 30 }}>
          <ClientManager
            group={clientGroup}
            setGroup={setClientGroup}
            onClientsUpdate={setClients}
            filtro={filtro}
          />
        </section>

        <section style={{ marginBottom: 30 }}>
          <EmailDashboard
            group={clientGroup}
            setFiltro={setFiltro}
          />
        </section>

        <section style={{ marginBottom: 30 }}>
          <EmailTemplateEditor
            group={templateGroup}
            setGroup={setTemplateGroup}
            onTemplateReady={setTemplate}
          />
        </section>

        <section style={{ marginBottom: 30 }}>
          <EmailSender
            clients={effectiveRecipients}
            template={template}
            group={clientGroup}
          />
        </section>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
    </div>
  );
};

export default App;