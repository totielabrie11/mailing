import React, { useState } from 'react';
import ClientManager from './components/ClientManager';
import DropManager from './components/DropManager';
import EmailTemplateEditor from './components/EmailTemplateEditor';
import EmailSender from './components/EmailSender';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [clients, setClients] = useState([]);
  const [dropClients, setDropClients] = useState([]);
  const [template, setTemplate] = useState(null);

  const [clientGroup, setClientGroup] = useState("nuevos");
  const [templateGroup, setTemplateGroup] = useState("nuevos");

  // Combinar los destinatarios si el grupo está en "ninguno"
  const effectiveRecipients = clientGroup === "ninguno" ? dropClients : clients;

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
        <DropManager onManualUpdate={setDropClients} />
      </section>

      <section style={{ marginBottom: 30 }}>
        <EmailTemplateEditor
          group={templateGroup}
          setGroup={setTemplateGroup}
          onTemplateReady={setTemplate}
        />
      </section>

      <section style={{ marginBottom: 30 }}>
        <EmailSender clients={effectiveRecipients} template={template} />
      </section>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
    </div>
  );
};

export default App;