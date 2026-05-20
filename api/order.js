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
    items = [],
    total,
    orderText,
    item,
    menu,
    temperature,
    latteArt,
    option,
    price,
    note
  } = req.body;

  const safeOrderId = orderId || `TAMA-${Date.now()}`;

  let content = "";

  // 新おぼんシステム用
  if (Array.isArray(items) && items.length > 0) {
    const lines = items.map((orderItem, index) => {
      const name = orderItem.orderText || orderItem.name || "未選択";
      const itemPrice = orderItem.price ? `${orderItem.price} TAMA` : "価格未設定";
      return `**${index + 1}. ${name}**\n価格：${itemPrice}`;
    }).join("\n\n");

    const totalPrice = total || items.reduce((sum, orderItem) => {
      return sum + Number(orderItem.price || 0);
    }, 0);

    content =
`☕ **注文入りました！**

**注文番号**：${safeOrderId}

${lines}

**合計**：${totalPrice} TAMA
**ひとこと**：${note || "なし"}`;

  } else {
    // 古い単品注文にも一応対応
    const name = orderText || menu || item || "未選択";

    content =
`☕ **注文入りました！**

**注文番号**：${safeOrderId}
**メニュー**：${name}
**温度**：${temperature || "なし"}
**ラテアート**：${latteArt || "なし"}
**オプション**：${option || "なし"}
**価格**：${price || total || "未設定"} TAMA
**ひとこと**：${note || "なし"}`;
  }

  const discordResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content })
  });

  if (!discordResponse.ok) {
    return res.status(500).json({
      ok: false,
      error: "Failed to send to Discord"
    });
  }

  return res.status(200).json({ ok: true });
}
