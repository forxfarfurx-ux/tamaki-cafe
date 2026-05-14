const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");
const QRCode = require("qrcode");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 8080;
const orders = [];

app.use(express.json());
app.use(express.static("public"));

function getLocalIPs() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

app.get("/api/info", (req, res) => {
  const ips = getLocalIPs();
  const urls = ips.map(ip => ({
    ip,
    orderUrl: `http://${ip}:${PORT}`,
    adminUrl: `http://${ip}:${PORT}/admin.html`,
    qrUrl: `http://${ip}:${PORT}/qr.html`
  }));
  res.json({ port: PORT, urls });
});

app.get("/api/qr", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("url is required");
  try {
    const png = await QRCode.toBuffer(url, {
      type: "png",
      width: 360,
      margin: 2
    });
    res.setHeader("Content-Type", "image/png");
    res.send(png);
  } catch (e) {
    res.status(500).send("QR generation failed");
  }
});

app.post("/api/order", (req, res) => {
  const order = {
    id: Date.now(),
    time: new Date().toLocaleString("ja-JP"),
    item: req.body.item || "未選択",
    size: req.body.size || "普通",
    sugar: req.body.sugar || "なし",
    milk: req.body.milk || "なし",
    note: req.body.note || "",
    status: "new"
  };

  orders.unshift(order);
  io.emit("new-order", order);
  res.json({ ok: true, order });
});

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders/:id/done", (req, res) => {
  const id = Number(req.params.id);
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = "done";
    io.emit("orders-updated", orders);
  }
  res.json({ ok: true });
});

app.post("/api/orders/clear", (req, res) => {
  orders.length = 0;
  io.emit("orders-updated", orders);
  res.json({ ok: true });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("☕ かぷー喫茶 v0.2 起動しました");
  console.log("-----------------------------------");
  console.log("PCで開く:");
  console.log(`  注文画面: http://localhost:${PORT}`);
  console.log(`  管理画面: http://localhost:${PORT}/admin.html`);
  console.log(`  QR表示:   http://localhost:${PORT}/qr.html`);
  console.log("");
  console.log("スマホで開く候補:");
  getLocalIPs().forEach(ip => {
    console.log(`  注文画面: http://${ip}:${PORT}`);
    console.log(`  管理画面: http://${ip}:${PORT}/admin.html`);
    console.log(`  QR表示:   http://${ip}:${PORT}/qr.html`);
  });
  console.log("-----------------------------------");
  console.log("PCで http://localhost:3000/qr.html を開くとQRコードが出ます。");
  console.log("");
});
