import React, { useState } from 'react';
import ClientManager from './components/ClientManager';
import EmailTemplateEditor from './components/EmailTemplateEditor';
import EmailSender from './components/EmailSender';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [clients, setClients] = useState([]);
  const [template, setTemplate] = useState(null);

  // Grupos independientes
  const [clientGroup, setClientGroup] = useState("nuevos");
  const [templateGroup, setTemplateGroup] = useState("nuevos");

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
        <EmailTemplateEditor
          group={templateGroup}
          setGroup={setTemplateGroup}
          onTemplateReady={setTemplate}
        />
      </section>

      <section style={{ marginBottom: 30 }}>
        <EmailSender clients={clients} template={template} />
      </section>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
    </div>
  );
};

export default App;
