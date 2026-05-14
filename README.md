# かぷー喫茶 v0.2

QRコード表示ページつきの、自宅Wi-Fi内だけで動く小型QR注文システムです。

## 起動

```bat
npm install
npm start
```

## 開くページ

PCでQR表示：

```text
http://localhost:3000/qr.html
```

PCで管理画面：

```text
http://localhost:3000/admin.html
```

みーちゃんスマホ：

PCのQR表示ページに出たQRコードを読み取ります。

## 注意

- PCとスマホは同じWi-Fiにしてください。
- QRコードで開けない場合は、Wi-Fiルーター側で端末同士の通信が止められている可能性があります。
