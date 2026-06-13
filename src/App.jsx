import { useState } from "react";

const API = "https://file-converter-2hjk.onrender.com";

export default function App() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("jpg");
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file || loading) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const isImage = ["jpg", "png", "webp"].includes(format);
    const endpoint = isImage ? "convert-image" : "convert-media";

    try {
      const res = await fetch(
        `${API}/${endpoint}?type=${format}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `converted.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Conversion failed");
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
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div>{file ? file.name : "Click or drop file"}</div>
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
          </optgroup>

          <optgroup label="Audio/Video">
            <option value="mp3">MP3</option>
            <option value="wav">WAV</option>
            <option value="mp4">MP4</option>
            <option value="avi">AVI</option>
            <option value="mkv">MKV</option>
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
};