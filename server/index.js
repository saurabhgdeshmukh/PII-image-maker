import express from 'express';
import multer from 'multer';
import cors from 'cors';
import Tesseract from 'tesseract.js';
import Jimp from 'jimp';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// These two lines give you the equivalent of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());

function findPII(text) {
  const emailPattern = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
  const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  const emails = text.match(emailPattern) || [];
  const phones = text.match(phonePattern) || [];
  return { emails, phones };
}

// Utility to call Gemini 2.0 Flash API for PII detection
async function detectPIIWithGemini(textBlocks) {
  const apiKey = process.env.GEMINI_API_KEY;
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const prompt = `Detect all PII (Full Name, Address, Date of Birth, Aadhaar Number, Phone Number, Email Address) in the following OCR text blocks.
For each PII, return an object with "type", "value", and "blockIndex".
Respond ONLY with a JSON array of these objects, and nothing else.
${JSON.stringify(textBlocks)}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  const headers = { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey };
  try {
    const response = await axios.post(endpoint, body, { headers });
    // Expecting Gemini to return a JSON string with detected PII info
    let resultText = response.data.candidates[0].content.parts[0].text;
    // Remove Markdown code block markers if present
    resultText = resultText.replace(/```json|```/g, '').trim();
    return JSON.parse(resultText);
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return [];
  }
}

app.post('/mask-pii', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  const imagePath = req.file.path;
  try {
    const image = await Jimp.read(imagePath);
    const { data: { words, lines } } = await Tesseract.recognize(imagePath, 'eng', { logger: m => {} });
    // Prepare text blocks for Gemini (lines for better context)
    const textBlocks = lines.map((line, idx) => ({ index: idx, text: line.text, bbox: line.bbox }));
    const piiResults = await detectPIIWithGemini(textBlocks);
    piiResults.forEach(pii => {
      const block = textBlocks[pii.blockIndex];
      if (block && block.bbox) {
        image.scan(block.bbox.x0, block.bbox.y0, block.bbox.x1 - block.bbox.x0, block.bbox.y1 - block.bbox.y0, function(x, y, idx) {
          this.bitmap.data[idx + 0] = 0;
          this.bitmap.data[idx + 1] = 0;
          this.bitmap.data[idx + 2] = 0;
        });
      }
    });
    const outBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    const base64Image = `data:image/png;base64,${outBuffer.toString('base64')}`;
    res.json({ maskedImage: base64Image, pii: piiResults });
  } catch (err) {
    res.status(500).send('Error processing image');
  } finally {
    fs.unlinkSync(imagePath);
  }
});

app.listen(8000, () => {
  console.log('Server running on http://localhost:8000');
}); 