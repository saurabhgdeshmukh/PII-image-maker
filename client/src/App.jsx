import React, { useState } from 'react';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [maskedImage, setMaskedImage] = useState(null);
  const [pii, setPii] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
      setMaskedImage(null);
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMaskedImage(null);
    setPii([]);
    if (!file) {
      setError('Please select an image.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:8000/mask-pii', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to mask image');
      const data = await response.json();
      setMaskedImage(data.maskedImage);
      setPii(data.pii || []);
    } catch (err) {
      setError('Error processing image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2.5rem 2rem', maxWidth: 420, width: '100%' }}>
        <h1 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: '1.5rem', color: '#2563eb', letterSpacing: 1 }}>PII Image Masker</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              background: '#f9fafb',
              fontSize: '1rem',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              fontWeight: 600,
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
              boxShadow: '0 2px 8px rgba(37,99,235,0.08)'
            }}
            disabled={loading}
          >
            {loading ? 'Masking...' : 'Mask PII'}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
        {selectedImage && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#0e7490', marginBottom: '0.5rem' }}>Original Image</h2>
            <img
              src={selectedImage}
              alt="Selected"
              style={{
                maxWidth: '100%',
                maxHeight: 260,
                borderRadius: '1rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                border: '1px solid #e0e7ef',
                background: '#f1f5f9',
                marginBottom: '0.5rem',
              }}
            />
          </div>
        )}
        {maskedImage && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#0e7490', marginBottom: '0.5rem' }}>Masked Image</h2>
            <img
              src={maskedImage}
              alt="Masked"
              style={{
                maxWidth: '100%',
                maxHeight: 260,
                borderRadius: '1rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                border: '1px solid #e0e7ef',
                background: '#f1f5f9',
                marginBottom: '0.5rem',
              }}
            />
            <a
              href={maskedImage}
              download="masked-image.png"
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                background: 'linear-gradient(90deg, #06b6d4 0%, #2563eb 100%)',
                color: '#fff',
                padding: '0.6rem 1.2rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                transition: 'background 0.2s',
                cursor: 'pointer',
              }}
            >
              Download Masked Image
            </a>
            {pii.length > 0 && (
              <div style={{ marginTop: '2rem', textAlign: 'left', background: '#f0fdfa', borderRadius: '0.75rem', padding: '1.2rem', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <h3 style={{ color: '#2563eb', fontWeight: 600, marginBottom: '0.7rem', fontSize: '1.1rem' }}>Detected PII</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {pii.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem', fontSize: '1rem', color: '#0e7490' }}>
                      <strong>{item.type}:</strong> {item.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 