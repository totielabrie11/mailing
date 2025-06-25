import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './EmailTemplateEditor.css';

const EmailTemplateEditor = ({ onTemplateReady, group, setGroup }) => {
  const [text, setText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/plantillas/${group}`);
        setText(res.data?.text || "");
      } catch (err) {
        toast.warn("No se pudo cargar la plantilla previa");
        console.error(err);
        setText("");
      }

      // Limpiar archivos previos al cambiar de grupo
      setPdfFile(null);
      setImageFile(null);
      setPdfPreviewUrl(null);
      setImagePreviewUrl(null);
    };
    fetchTemplate();
  }, [group]);

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfPreviewUrl(URL.createObjectURL(file));
    } else {
      toast.error("Archivo PDF inválido 📎");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      toast.error("Formato de imagen no válido 🖼️");
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("El cuerpo del mensaje no puede estar vacío ❗");
      return;
    }

    if (!pdfFile) {
      toast.error("Debes adjuntar un archivo PDF válido 📎");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/plantillas/${group}`, { text });
      toast.success("Texto de plantilla guardado ✔️");
      onTemplateReady({ text, pdfFile, imageFile });
    } catch (err) {
      toast.error("Error al guardar el texto en el servidor");
      console.error(err);
    }
  };

  return (
    <div className="email-editor">
      <h3>📝 Editor de Plantilla</h3>

      <label>Grupo de plantilla:</label>
      <select
        value={group}
        onChange={(e) => setGroup(e.target.value)}
        style={{ marginBottom: 10, padding: '6px', borderRadius: 4 }}
      >
        <option value="nuevos">Para nuevos clientes</option>
        <option value="viejos">Para antiguos clientes</option>
        <option value="activos">Para clientes activos</option>
      </select>

      <textarea
        rows={6}
        style={{ width: '100%', marginBottom: 10 }}
        placeholder="Escribe aquí el contenido del email..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <input
        type="file"
        accept="application/pdf"
        onChange={handlePdfChange}
        style={{ marginBottom: 10 }}
      />
      {pdfPreviewUrl && (
        <div style={{ marginBottom: 10 }}>
          <p>📄 Vista previa PDF:</p>
          <iframe
            src={pdfPreviewUrl}
            title="Vista previa PDF"
            width="100%"
            height="300px"
            style={{ border: "1px solid #ccc" }}
          ></iframe>
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleImageChange}
        style={{ marginBottom: 10 }}
      />
      {imagePreviewUrl && (
        <div style={{ marginBottom: 10 }}>
          <p>🖼 Vista previa imagen:</p>
          <img
            src={imagePreviewUrl}
            alt="Vista previa"
            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 8 }}
          />
        </div>
      )}

      <br />
      <button onClick={handleSubmit}>Guardar Plantilla</button>
    </div>
  );
};

export default EmailTemplateEditor;