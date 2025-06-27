const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'https://mailing-front-eight.vercel.app',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const documentPath = path.join(__dirname, 'document');
if (!fs.existsSync(documentPath)) {
  fs.mkdirSync(documentPath);
  console.log('📂 Carpeta "document" creada automáticamente');
}

const dbPath = path.join(__dirname, 'db');
const clientsFile = path.join(dbPath, 'clients.json');
const plantillaFile = path.join(dbPath, 'plantilla.json');

if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);
if (!fs.existsSync(clientsFile)) fs.writeFileSync(clientsFile, JSON.stringify({}, null, 2));
if (!fs.existsSync(plantillaFile)) fs.writeFileSync(plantillaFile, JSON.stringify({}, null, 2));

// Agregar cliente
app.post('/api/clients/:group', (req, res) => {
  const group = req.params.group;
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).send("Correo inválido");

  let data = {};
  try {
    data = fs.existsSync(clientsFile) ? JSON.parse(fs.readFileSync(clientsFile, 'utf-8')) : {};
  } catch {
    return res.status(500).send("Error leyendo la base de datos");
  }

  data[group] = data[group] || [];
  if (data[group].some(c => c.email === email)) return res.status(409).send("Cliente ya existe");

  data[group].push({ email, lastSent: null });

  try {
    fs.writeFileSync(clientsFile, JSON.stringify(data, null, 2));
    res.status(201).json({ email });
  } catch {
    res.status(500).send("Error al guardar cliente");
  }
});

// Función auxiliar para marcar inactivos
const marcarInactivos = (clientes, dias = 30) => {
  const ahora = Date.now();
  const msPorDia = 1000 * 60 * 60 * 24;
  return clientes.map(c => {
    const ultimaFecha = new Date(c.lastSent || 0).getTime();
    const inactivo = !c.lastSent || (ahora - ultimaFecha > dias * msPorDia);
    return { ...c, inactivo };
  });
};

// Obtener clientes
app.get('/api/clients/:group', (req, res) => {
  const group = req.params.group;
  try {
    const data = fs.existsSync(clientsFile)
      ? JSON.parse(fs.readFileSync(clientsFile, 'utf-8'))
      : {};

    const clientes = data[group] || [];
    const clientesConEstado = marcarInactivos(clientes, 30); // ⚠️ 30 días de inactividad

     // 👇 Acá lo imprimís completo en consola
    console.log(`[CLIENTES - ${group}]`, clientesConEstado);

    res.json(clientesConEstado);
  } catch (err) {
    console.error("Error al leer clients.json:", err);
    res.status(500).send("Error al obtener los clientes");
  }
});


// Eliminar cliente
app.delete('/api/clients/:group/:email', (req, res) => {
  const group = req.params.group;
  const target = decodeURIComponent(req.params.email);

  try {
    const data = JSON.parse(fs.readFileSync(clientsFile, 'utf-8'));
    if (!data[group]) return res.status(404).send("Grupo no encontrado");

    data[group] = data[group].filter(c => c.email !== target);
    fs.writeFileSync(clientsFile, JSON.stringify(data, null, 2));
    res.status(200).send("Cliente eliminado");
  } catch (err) {
    console.error("Error al eliminar cliente:", err);
    res.status(500).send("Error en eliminación");
  }
});

// Guardar plantilla
app.post('/api/plantillas/:group', (req, res) => {
  const group = req.params.group;
  const { text } = req.body;
  if (!text) return res.status(400).send("Texto requerido");

  let data = {};
  try {
    data = fs.existsSync(plantillaFile) ? JSON.parse(fs.readFileSync(plantillaFile, 'utf-8')) : {};
  } catch {
    return res.status(500).send("Error leyendo plantilla");
  }

  data[group] = { ...(data[group] || {}), text };

  try {
    fs.writeFileSync(plantillaFile, JSON.stringify(data, null, 2));
    res.status(200).json(data[group]);
  } catch {
    res.status(500).send("Error al guardar plantilla");
  }
});

// Obtener plantilla
app.get('/api/plantillas/:group', (req, res) => {
  const group = req.params.group;
  try {
    const data = fs.existsSync(plantillaFile) ? JSON.parse(fs.readFileSync(plantillaFile, 'utf-8')) : {};
    res.json(data[group] || { text: "" });
  } catch {
    res.status(500).send("Error al leer la plantilla");
  }
});

// Multer (PDF e imagen)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Envío de email
app.post('/send-email', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  const { text, emails } = req.body;
  const pdfFile = req.files['pdf']?.[0];
  const imageFile = req.files['image']?.[0] || null;

  if (!text || !emails || !pdfFile) return res.status(400).send("Datos incompletos");

  let parsedEmails;
  try {
    parsedEmails = JSON.parse(emails);
  } catch {
    return res.status(400).send("Error al parsear los correos");
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let htmlBody = text.replace(/\n/g, '<br>');
  if (imageFile) {
    htmlBody = `
      <div>
        <img src="cid:plantilla-image" style="max-width: 100%; margin-bottom: 20px;" />
        <div>${htmlBody}</div>
      </div>
    `;
  } else {
    htmlBody = `<p>${htmlBody}</p>`;
  }

  try {
    for (const email of parsedEmails) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Presentación personalizada',
        text,
        html: htmlBody,
        attachments: [
          { filename: pdfFile.originalname, path: pdfFile.path }
        ]
      };

      if (imageFile) {
        mailOptions.attachments.push({
          filename: imageFile.originalname,
          path: imageFile.path,
          cid: 'plantilla-image'
        });
      }

      await transporter.sendMail(mailOptions);
      console.log(`📨 Enviado a: ${email}`);
    }

    
// ✅ Actualizar lastSent y vecesContactado
const clientsData = JSON.parse(fs.readFileSync(clientsFile, 'utf-8'));
const now = new Date().toISOString();
for (const group in clientsData) {
  clientsData[group] = clientsData[group].map(c => {
    if (parsedEmails.includes(c.email)) {
      return {
        ...c,
        lastSent: now,
        vecesContactado: (c.vecesContactado || 0) + 1
      };
    }
        return c;
      });
    }
    fs.writeFileSync(clientsFile, JSON.stringify(clientsData, null, 2));

    fs.unlinkSync(pdfFile.path);
    if (imageFile) fs.unlinkSync(imageFile.path);

    res.status(200).send("Emails enviados correctamente ✔️");
  } catch (err) {
    console.error("Error enviando emails:", err);
    res.status(500).send("Fallo en el envío");
  }
});

// Estadísticas por grupo
app.get('/api/stats/:group', (req, res) => {
  const group = req.params.group;
  try {
    const data = fs.existsSync(clientsFile)
      ? JSON.parse(fs.readFileSync(clientsFile, 'utf-8'))
      : {};

    const groupClients = data[group] || [];

    const totalClientes = groupClients.length;
    const enviados = groupClients.filter(c => c.lastSent !== null).length;
    const sinContacto = totalClientes - enviados;

    const últimosEnvios = {};
    for (const client of groupClients) {
      últimosEnvios[client.email] = client.lastSent || null;
    }

    res.json({ totalClientes, enviados, sinContacto, últimosEnvios });
  } catch (err) {
    console.error("Error generando estadísticas:", err);
    res.status(500).send("Error al generar estadísticas");
  }
});

app.get('/api/envios/ranking', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(clientsFile, 'utf-8'));
    const contador = {};

    for (const grupo in data) {
      const clientes = data[grupo];

      for (const cliente of clientes) {
        const email = typeof cliente === 'string' ? cliente : cliente.email;
        const lastSent = typeof cliente === 'string' ? null : cliente.lastSent;

        if (lastSent) {
          contador[email] = (contador[email] || 0) + 1;
        }
      }
    }

    const ranking = Object.entries(contador)
      .map(([email, cantidad]) => ({ email, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    res.json(ranking);
  } catch (err) {
    console.error("Error al generar ranking:", err);
    res.status(500).send("Error al generar ranking");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Backend en marcha: http://localhost:${process.env.PORT}`);
});