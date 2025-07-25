PII Masking from Image – Node.js & Gemini 2.0 Flash

This project implements a privacy-focused backend service that detects and masks Personally Identifiable Information (PII) in uploaded images such as Aadhaar cards or other identity documents.

The application leverages:

    Tesseract.js for Optical Character Recognition (OCR)

    Gemini 2.0 Flash (via Vercel AI SDK) for LLM-based intelligent PII detection

    Jimp for pixel-based image manipulation

Features

    Accepts image uploads via API

    Uses Tesseract.js to extract text and bounding boxes

    Sends structured text blocks to Gemini 2.0 Flash for PII detection

    Masks detected PII directly in the image

    Returns a base64 image with redacted content

    Temporary image cleanup after processing

Tech Stack

    Backend Framework: Node.js with Express

    OCR: Tesseract.js

    PII Detection: Gemini 2.0 Flash via Google Generative Language API

    Image Processing: Jimp

    File Handling: Multer

    Environment Config: dotenv

    API Communication: Axios

    Hosting Ready: Deployable on Vercel, Render, or Railway

Setup Instructions
1. Clone the Repository

git clone https://github.com/your-username/pii-masker-node-gemini.git
cd pii-masker-node-gemini

2. Install Dependencies

npm install

3. Environment Variables

Create a .env file in the root directory and add your Gemini API key:

GEMINI_API_KEY=your_google_generative_api_key

4. Run the Application

node index.js

Server runs on: http://localhost:8000
API Endpoint
POST /mask-pii

Uploads an image, processes it for PII, and returns a masked version.
Request

    Form Data: file (image)

Response

{
  "maskedImage": "data:image/png;base64,...",
  "pii": [
    {
      "type": "Phone Number",
      "value": "9876543210",
      "blockIndex": 2
    }
  ]
}

Example Flow

    User uploads Aadhaar or similar ID image.

    OCR extracts text blocks and bounding boxes using Tesseract.

    Blocks are sent to Gemini with an optimized prompt asking to detect:

        Full Name

        Father's Name

        Address

        Date of Birth

        Aadhaar Number

        PAN Number

        Phone Number

        Email Address

    Gemini returns the PII types with corresponding line indexes.

    Jimp masks the bounding boxes related to PII.

    Final image (base64) is returned along with PII metadata.

Tools & Libraries Used

    Tesseract.js – OCR in JavaScript

    Jimp – Image manipulation

    Axios – HTTP requests

    Multer – File upload middleware

    Gemini Flash API – LLM for structured extraction

Folder Structure

├── uploads/                // Temporary image storage
├── .env                    // Environment variables
├── index.js                // Main server file
├── package.json
└── README.md

Future Improvements

    Support multiple image uploads

    Add frontend (React or Next.js) for drag-and-drop UI

    Add blur or red box options instead of just blacking out

    Add downloadable version of redacted image
