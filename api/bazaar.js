
export default async function handler(req, res) {
  try {
    const r = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
    const data = await r.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch bazaar" });
  }
}
