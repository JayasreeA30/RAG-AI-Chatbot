const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: form,
  });
  return res.json();
}

export async function chatMessage(message) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  return res.json();
}
