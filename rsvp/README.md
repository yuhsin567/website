# RSVP Page (自訂 UI + Google Form + Google Sheet)

這個版本已改成「自訂前端表單 + Google Form 後端收件 + Google Sheet 統計」，適合部署在 GitHub Pages。

## 你會得到什麼

- 與主站一致的深色玻璃風格
- 可直接在 GitHub Pages 上開啟的 RSVP 頁面
- 自訂表單欄位與活動頁視覺風格
- 提交後由 Google Form 自動寫入 Google Sheet
- 不需要暴露 Apps Script endpoint

## 1) 先準備 Google Form

1. 建立一份 Google Form
2. 在「回應」頁面把它連到 Google Sheet
3. 取得 Google Form 的公開網址（例如 `https://forms.gle/...`）
4. 取得 Google Form 的 response endpoint（通常是 `https://docs.google.com/forms/d/e/<form-id>/formResponse`）

## 2) 設定本專案

打開 [docs/rsvp/config.js](docs/rsvp/config.js) 並填入：

- `googleFormUrl`: 你的 Google Form 公開連結
- `googleFormResponseUrl`: 你的 Google Form response endpoint
- `googleSheetUrl`: Google Sheet 的共用連結（可選）
- `formBzx`: Google Form 頁面中的 `fbzx` 隱藏欄位值
- `fieldIds`: 你的 Google Form 問題對應欄位 ID

如果你的 Google Form 欄位名稱與目前不同，請更新 `fieldIds` 的對應值。

## 3) 這個頁面如何運作

- 使用者在 RSVP 頁面填寫自訂表單
- 前端將資料整理成 Google Form 需要的 `application/x-www-form-urlencoded` 內容
- 送到 Google Form 的 `formResponse` endpoint
- Google Form 會把資料寫入連結的 Google Sheet

## 4) 本地測試

在專案根目錄執行：

```bash
python -m http.server 8000
```

然後開啟：

```text
http://127.0.0.1:8000/docs/rsvp/index.html
```

## 5) 部署到 GitHub Pages

這個專案已經提供部署腳本：

```bash
bash scripts/deploy.sh
```

它會把 [docs](docs) 內容部署到 `gh-pages` 分支，供 GitHub Pages 使用。

## 6) 常見問題

- 表單送出後沒有進 Sheet：確認 `googleFormResponseUrl` 與 `formBzx` 是否正確。
- 你的 Google Form 欄位不同：更新 [docs/rsvp/config.js](docs/rsvp/config.js) 裡的 `fieldIds`。
- 想要把欄位名稱改成自己的：同時更新 HTML 表單與 Google Form 的問題標題即可。
