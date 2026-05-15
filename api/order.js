export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ ok: false, error: "Webhook URL is not set" });
  }

  const { menu, size, sugar, milk, note } = req.body;

  const content =
`☕ **新しい注文が入りました！**

**メニュー**：${menu || "未選択"}
**サイズ**：${size || "未選択"}
**砂糖**：${sugar || "未選択"}
**ミルク**：${milk || "未選択"}
**ひとこと**：${note || "なし"}`;

  const discordResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content })
  });

  if (!discordResponse.ok) {
    return res.status(500).json({ ok: false, error: "Failed to send to Discord" });
  }

  return res.status(200).json({ ok: true });
}
