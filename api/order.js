export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ ok: false, error: "Webhook URL is not set" });
  }

  const {
    orderId,
    item,
    temperature,
    latteArt,
    total,
    price,
    orderText,
    note
  } = req.body;

  const displayTotal = total || price || "未設定";
  const artLine = latteArt ? `\n**ラテ**：${latteArt}` : "";

  const content =
`☕ **注文入りました！**

**${item || "未選択"}**
**温度**：${temperature || "未選択"}${artLine}
**価格**：${displayTotal} TAMA
**番号**：${orderId || "番号なし"}
${note ? `**ひとこと**：${note}` : ""}`;

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
