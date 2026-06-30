GitHub Pages - 每日台灣半導體五大新聞

這個專案會使用 GitHub Pages 作為靜態網站承載，並透過 GitHub Actions 每日排程從 RSS 擷取新聞，產生 `docs/news.json`，由 `docs/index.html` 顯示「每日五大」列表。

快速開始

- 本地安裝相依套件並測試擷取腳本：

```bash
npm install
npm run fetch-news
```

- 變更 RSS 清單：編輯 `scripts/feeds.json`，加入想要的新聞 RSS。

- 部署：CI workflow 會生成 `docs/news.json`，並將 `docs/` 的內容部署到 `gh-pages` 分支。請在 GitHub Pages 設定中選擇 `gh-pages` 分支的根目錄作為來源。

注意事項

- 請確認 RSS/來源授權，僅顯示標題、摘要與來源連結，避免未授權全文轉載。
- 若需要更多頻繁更新或全文索引，建議改用付費 News API 或後端服務。

檔案說明

- `docs/index.html` - 前端顯示頁面
- `scripts/fetch_news.js` - 擷取 RSS 並生成 `docs/news.json`
- `scripts/feeds.json` - RSS URL 清單（可編輯）
- `.github/workflows/daily_fetch.yml` - GitHub Actions workflow，部署到 `gh-pages` 分支

如需我代為調整樣式或新增 RSS 範例清單，請告訴我要加入哪些新聞來源。
