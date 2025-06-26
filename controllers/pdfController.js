const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const drive = google.drive('v3');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extname);
  },
});
const upload = multer({ storage });

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json', 
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});
 
const uploadToDrive = async (file) => {
  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  const fileMetadata = {
    name: file.originalname,
    parents: ['17jYQWmde6Z7kNFde9707c6_uj-vFUazP'], // ID de la carpeta de destino en Google Drive
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });

  fs.unlinkSync(file.path);

  return response.data.id;
};
const getPublicImageUrl = async (fileId) => {
  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  const response = await google.drive('v3').files.get({
    fileId: fileId,
    fields: 'webViewLink, webContentLink',
  });

  return response.data.webViewLink;
};
router.post('/upload-pdf', upload.single('Pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha proporcionado ningún archivo PDF' });
  }

  try {
    const fileId = await uploadToDrive(req.file);
    const pdfUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    const imageUrl = await getPublicImageUrl(fileId);
    res.status(200).json({ message: 'PDF subido correctamente', imageUrl });
  } catch (error) {
    console.error('Error al subir el PDF a Google Drive:', error);
    res.status(500).json({ error: 'Error al subir el PDF a Google Drive' });
  }
});

router.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha proporcionado ningún archivo PDF' });
  }

  try {
    const fileId = await uploadToDrive(req.file);
    const pdfUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    const imageUrl = await getPublicImageUrl(fileId);
    res.status(200).json({ message: 'imagen subido correctamente', imageUrl });
  } catch (error) {
    console.error('Error al subir el PDF a Google Drive:', error);
    res.status(500).json({ error: 'Error al subir el PDF a Google Drive' });
  }
});
module.exports = router;
