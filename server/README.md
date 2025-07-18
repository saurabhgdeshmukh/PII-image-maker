# Backend - PII Masking Service

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up Gemini API Key:**
   - Create a `.env` file in the `server/` directory:
     ```env
     GEMINI_API_KEY=your-gemini-api-key-here
     ```

3. **Start the server:**
   ```bash
   node index.js
   ```

## API Endpoint

### `POST /mask-pii`
- **Description:** Upload an image (e.g., Aadhaar card). The server will detect and mask PII (Full Name, Address, DOB, Aadhaar Number, Phone, Email) using OCR and Gemini 2.0 Flash.
- **Form field:** `file` (image file)
- **Response:** Masked image (PNG)

#### Example (using curl):
```bash
curl -F "file=@/path/to/image.png" http://localhost:8000/mask-pii --output masked.png
```

## Notes
- Requires internet access for Gemini API.
- Temporary uploads are deleted after processing. 