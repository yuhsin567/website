![Routine deploy news](https://github.com/yuhsin567/website/actions/workflows/routine_fetch.yml/badge.svg)

# GitHub Pages - 整點台灣半導體五大新聞

這個專案會使用 GitHub Pages 作為靜態網站承載，並透過 GitHub Actions 每小時整點排程從 RSS 擷取新聞，產生 `docs/news.json`，由 `docs/index.html` 顯示「整點五大」列表。

## 運維狀態

- 網站來源：`gh-pages` branch（根目錄）
- 自動更新時間：整點（UTC）
- 工作流程：`.github/workflows/routine_fetch.yml`
- 手動觸發：GitHub repo → `Actions` → `Routine deploy news` → `Run workflow`
- 監控：如果 workflow 失敗，請先檢查 `Actions` 日誌，再確認是否為 RSS 來源問題或 GitHub Pages 部署權限問題。

## 快速開始

- 本地安裝相依套件並測試擷取腳本：

```bash
npm install
npm run fetch-news
```

- 變更 RSS 清單：編輯 `scripts/feeds.json`，加入想要的新聞 RSS。

- 部署：CI workflow 會生成 `docs/news.json`，並將 `docs/` 的內容部署到 `gh-pages` 分支。請在 GitHub Pages 設定中選擇 `gh-pages` 分支的根目錄作為來源。

### 本機部署指引

如果你想從本地直接把 `docs/` 推到 `gh-pages`：

1. 產生 `news.json` 並檢查變更：

```bash
npm ci
npm run fetch-news
git add docs
git commit -m "chore(docs): update generated docs" || true
```

2. 使用 git subtree 推送到 `gh-pages`（若尚無 `gh-pages` 分支會建立）：

```bash
git subtree push --prefix docs origin gh-pages
```

或使用專案內建的部署腳本（Unix/macOS）：

```bash
npm run deploy-local
```

Windows 使用 PowerShell：

```powershell
.\scripts\deploy.ps1
```

注意事項

- 請確認 RSS/來源授權，僅顯示標題、摘要與來源連結，避免未授權全文轉載。
- 若需要更多頻繁更新或全文索引，建議改用付費 News API 或後端服務。

檔案說明

- `docs/index.html` - 前端顯示頁面
- `scripts/fetch_news.js` - 擷取 RSS 並生成 `docs/news.json`
- `scripts/feeds.json` - RSS URL 清單（可編輯）
- `.github/workflows/routine_fetch.yml` - GitHub Actions workflow，部署到 `gh-pages` 分支

如需我代為調整樣式或新增 RSS 範例清單，請告訴我要加入哪些新聞來源。
