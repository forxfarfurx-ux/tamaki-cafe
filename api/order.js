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
    englishName,
    temperature,
    latteArt,
    total,
    price,
    orderText,
    note,
    message
  } = req.body;

  const displayItem = item || "未選択";
  const displayTemperature = temperature || "未選択";
  const displayLatteArt = latteArt || "";
  const displayTotal = total || price || "未設定";
  const displayOrderId = orderId || "番号なし";
  const displayOrderText = orderText || [displayItem, displayTemperature, displayLatteArt]
    .filter(Boolean)
    .join(" / ");

  const effects = [
    "秘密の深夜補正",
    "店長ごきげん補正",
    "月明かり回復",
    "肉球監修済",
    "夜ふかし耐性 +1",
    "みーちゃん休憩推奨"
  ];

  const effect = effects[Math.floor(Math.random() * effects.length)];

  const content =
`☕ **新しい注文が入りました！**

**注文番号**：${displayOrderId}
**メニュー**：${displayItem}
**温度**：${displayTemperature}
${displayLatteArt ? `**ラテアート**：${displayLatteArt}\n` : ""}**価格**：${displayTotal} TAMA
**注文内容**：${displayOrderText}
**付与効果**：${effect}
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
