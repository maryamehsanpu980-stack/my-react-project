import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus("Please select an image first.");
      return;
    }

    try {
      setStatus("Uploading...");
      setResult(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || "Upload failed.");
      }

      setResult(data);
      setStatus("Upload completed successfully.");
    } catch (error) {
      setStatus(error.message || "Something went wrong.");
    }
  };

  return (
    <main style={{ maxWidth: "700px", margin: "60px auto", padding: "24px" }}>
      <h1>Upload Road Image</h1>

      <p>
        Upload a road image for pothole detection and verification.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <br />
        <br />

        <button type="submit">
          Upload Image
        </button>
      </form>

      {status && (
        <p style={{ marginTop: "20px", fontWeight: "600" }}>
          {status}
        </p>
      )}

      {result && (
        <pre
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "#f3f4f6",
            borderRadius: "8px",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}