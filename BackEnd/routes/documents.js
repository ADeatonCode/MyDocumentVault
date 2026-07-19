// This file handles saving, listing, and deleting documents.
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const Document = require('../models/Document');

const router = express.Router();

// Tell the app where to put uploaded files on the computer.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Make the upload tool ready to use.
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

// Show all documents that belong to the current user.
router.get('/', authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user._id }).sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load documents', error: error.message });
  }
});

// Save a new uploaded file and remember its details.
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'A file is required' });
    }

    const document = await Document.create({
      user: req.user._id,
      title: req.body.title || req.file.originalname,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      description: req.body.description || ''
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Remove a document and delete the matching file from storage.
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', document.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed', error: error.message });
  }
});

module.exports = router;
