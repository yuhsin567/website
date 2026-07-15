![Routine deploy news](https://github.com/yuhsin567/website/actions/workflows/routine_fetch.yml/badge.svg)
![Deploy docs to gh-pages](https://github.com/yuhsin567/website/actions/workflows/deploy-gh-pages.yml/badge.svg)

# Yuhsin's Web Hub | 靜態網站整合入口

本專案是一個基於 GitHub Pages 託管的靜態網頁應用程式入口網站。透過一個 Repository 搭配子目錄結構，實現了多個獨立應用的無縫發佈與整合。

## 託管站點列表

1. **半導體整點新聞** ([`docs/semi-news/`](file:///d:/projects/website/docs/semi-news/))
   - **特色**：每小時整點自動從各大科技媒體 RSS 擷取，整理並呈現台灣半導體產業的五大最新要聞。
   - **機制**：透過 GitHub Actions 執行自動化擷取腳本，生成最新新聞資料。

2. **待辦事項 App** ([`docs/todo-app/`](file:///d:/projects/website/docs/todo-app/))
   - **特色**：現代質感的待辦事項管理器，支援任務分類過濾、進度條視覺化與 LocalStorage 瀏覽器本地儲存。

3. **RSVP 活動回覆頁** ([`docs/rsvp/`](file:///d:/projects/website/docs/rsvp/))
   - **特色**：採用 Google Form + Google Sheet 作為後端資料庫的邀請函回覆網頁，方便在 GitHub Pages 上直接提供安全且美觀的回覆入口。

4. **物理互動教室** ([`docs/animation_web/`](file:///d:/projects/website/docs/animation_web/))
   - **特色**：基於 **React + Vite + TypeScript** 開發的互動教室，將經典力學、牛頓三大運動定律、摩擦力與拋體運動轉化為生動直觀的互動動畫。
   - **開發與建置**：本子應用為一個獨立的 Vite 專案，在 GitHub Actions 部署流程中會被自動編譯，並將編譯結果輸出至 `docs/animation_web/dist/` 以供首頁載入。

---

## 本地開發與部署指引

### 1. 根目錄 (Portal) 與新聞擷取腳本

- **安裝依賴**：
  ```bash
  npm install
  ```
- **執行新聞擷取測試**：
  ```bash
  npm run fetch-news
  ```
- **編輯 RSS 來源**：編輯 `scripts/feeds.json`，加入想要的 RSS 清單。

### 2. 物理互動教室子專案 (Vite + React)

- **進入目錄**：
  ```bash
  cd docs/animation_web
  ```
- **安裝依賴**：
  ```bash
  npm install
  ```
- **啟動本地開發伺服器**：
  ```bash
  npm run dev
  ```
- **本地編譯測試**：
  ```bash
  npm run build
  ```

---

## 運維與自動部署

- **自動部署機制**：當推送到 `main`（或 `master`）分支時，GitHub Actions [Deploy docs to gh-pages](file:///d:/projects/website/.github/workflows/deploy-gh-pages.yml) 會自動啟動：
  1. 安裝根目錄與子專案的相依套件。
  2. 執行新聞擷取，更新 `docs/semi-news/news.json`。
  3. 編譯 `docs/animation_web` React 子應用，生成 `docs/animation_web/dist/`。
  4. 使用 `peaceiris/actions-gh-pages` 將整個 `docs/` 資料夾發佈至 `gh-pages` 分支。
- **新聞整點更新**：由 [Routine deploy news](file:///d:/projects/website/.github/workflows/routine_fetch.yml) 負責每小時自動擷取。

---

## 專案目錄結構說明

- `docs/` - 部署至 GitHub Pages 的所有靜態網頁內容
  - `index.html` - 入口首頁
  - `semi-news/` - 半導體整點新聞頁面
  - `todo-app/` - 待辦事項應用程式
  - `rsvp/` - RSVP 邀請函頁面
  - `animation_web/` - 物理互動教室源碼與設定
    - `src/` - React 應用程式原始碼
    - `dist/` - React 應用程式編譯輸出目錄 (由 CI 自動生成)
- `scripts/` - 自動化指令碼目錄
  - `fetch_news.js` - 新聞擷取主邏輯
  - `feeds.json` - RSS 新聞來源清單
