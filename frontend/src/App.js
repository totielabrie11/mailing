import React, { useState } from 'react';
import ClientManager from './components/ClientManager';
import DropManager from './components/DropManager';
import EmailTemplateEditor from './components/EmailTemplateEditor';
import EmailSender from './components/EmailSender';
import EmailDashboard from './components/EmailDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [clients, setClients] = useState([]);          // Clientes cargados desde DB
  const [dropClients, setDropClients] = useState([]);  // Clientes manuales (drop)
  const [template, setTemplate] = useState(null);

  const [clientGroup, setClientGroup] = useState("nuevos");
  const [templateGroup, setTemplateGroup] = useState("nuevos");

  // 👇 Define la lista real de destinatarios
  const effectiveRecipients = clientGroup === "ninguno" ? dropClients : clients;

  // 👇 Se invoca cuando un email es arrastrado desde ClientManager hacia DropManager
  const handleDropTransfer = (emailToRemove) => {
    setClients(prev => prev.filter(c => c.email !== emailToRemove));
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>📬 React Mailing App</h1>

      <section style={{ marginBottom: 30 }}>
        <ClientManager
          group={clientGroup}
          setGroup={setClientGroup}
          onClientsUpdate={setClients}
        />
      </section>

      <section style={{ marginBottom: 30 }}>
        <EmailDashboard group={clientGroup} />
      </section>

      <section style={{ marginBottom: 30 }}>
        <DropManager
          onManualUpdate={setDropClients}
          onDropTransfer={handleDropTransfer}
          group={clientGroup}
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

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
    </div>
  );
};

export default App;