import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("jpg");
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file || loading) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/convert-image?type=${format}`, {
        method: "POST",
        body: formData,
      });

      if (res.status === 403) {
        alert("Daily limit reached. Upgrade to Pro.");
        setLoading(false);
        return;
      }

      if (res.status === 413) {
        alert("File too large for free plan.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        alert("Conversion failed");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "converted." + format;
      a.click();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <div style={styles.logo}>File Converter</div>

        <a
          href="https://buymeacoffee.com/filechanger"
          target="_blank"
          rel="noreferrer"
          style={styles.donate}
        >
          Donate
        </a>
      </div>

      <div style={styles.card}>
        <h1 style={styles.title}>Convert Files</h1>

        <label style={styles.uploadBox}>
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <div>{file ? file.name : "Click or drop a file"}</div>
        </label>

        <select
          style={styles.select}
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <optgroup label="Images">
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WEBP</option>
            <option value="avif">AVIF</option>
            <option value="tiff">TIFF</option>
            <option value="gif">GIF</option>
          </optgroup>

          <optgroup label="Audio">
            <option value="mp3">MP3</option>
            <option value="wav">WAV</option>
            <option value="ogg">OGG</option>
            <option value="aac">AAC</option>
          </optgroup>

          <optgroup label="Video">
            <option value="mp4">MP4</option>
            <option value="webm">WEBM</option>
            <option value="avi">AVI</option>
            <option value="mov">MOV</option>
          </optgroup>
        </select>

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={upload}
        >
          {loading ? "Converting..." : "Convert"}
        </button>

        <p style={styles.note}>
          Free: 5 conversions/day • 10MB max
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "#0f172a",
    fontFamily: "sans-serif",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    background: "#111827",
    color: "white",
    borderBottom: "1px solid #1f2937",
  },
  logo: {
    fontWeight: "bold",
  },
  donate: {
    background: "#22c55e",
    padding: "8px 12px",
    borderRadius: "8px",
    color: "black",
    textDecoration: "none",
    fontWeight: "bold",
  },
  card: {
    width: "320px",
    margin: "60px auto",
    padding: "24px",
    background: "#111827",
    borderRadius: "12px",
    textAlign: "center",
    color: "white",
  },
  title: {
    marginBottom: "16px",
  },
  uploadBox: {
    display: "block",
    padding: "20px",
    border: "2px dashed #4b5563",
    borderRadius: "10px",
    marginBottom: "12px",
    cursor: "pointer",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold",
  },
  note: {
    fontSize: "12px",
    opacity: 0.6,
    marginTop: "10px",
  },
};