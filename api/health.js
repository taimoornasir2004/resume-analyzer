export default function handler(req, res) {
  res.status(200).json({ ok: true, aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
}
