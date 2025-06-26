import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmailSender = ({ clients, template, group }) => {
  const handleSend = async () => {
    if (!template) {
      toast.error("No hay plantilla cargada ❌");
      return;
    }

    if (!clients || clients.length === 0) {
      toast.error("No hay clientes para enviar el email 😓");
      return;
    }

    const emails = clients.map(c => c.email);
    const formData = new FormData();
    formData.append('pdf', template.pdfFile);
    formData.append('text', template.text);
    formData.append('emails', JSON.stringify(emails));

    if (template.imageFile) {
      formData.append('image', template.imageFile);
    }

    try {
      const res = await axios.post('http://localhost:5000/send-email', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 200) {
        toast.success("Correos enviados con éxito 🎉");
        console.log("➡️ Correos enviados a:", emails);

        // Solo si el grupo existe en la DB se actualiza `lastSent`
        if (group !== 'ninguno') {
          console.log("📌 Actualizando grupo en DB:", group);
        } else {
          console.log("⚠️ Envío sin DB (DropManager)");
        }
      } else {
        toast.error("Ocurrió un error al enviar los correos ❗");
      }
    } catch (err) {
      toast.error("Fallo en la conexión con el servidor 😵");
      console.error(err);
    }
  };

  return (
    <div>
      <h3>🚀 Envío de Emails</h3>
      <button onClick={handleSend}>Enviar a Todos</button>
    </div>
  );
};

export default EmailSender;
