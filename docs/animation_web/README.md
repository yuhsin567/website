# 國中物理動畫教學網站

這是一個部署到 GitHub Pages 的互動式教學網站，主題涵蓋：

- 牛頓第一定律
- 牛頓第二定律
- 牛頓第三定律
- 速度與平均速度
- 加速度
- 摩擦力
- 自由落體
- 拋體運動

網站使用 Vite + React + TypeScript 建置，採純前端單頁架構，避免 GitHub Pages 的伺服器限制。

## 開發環境

- Node.js 24 LTS 或相近版本
- npm 11 以上

## 安裝

第一次進專案時先安裝相依套件：

```bash
npm install
```

## 本機啟動

### Git Bash

如果你是在 Windows 的 Git Bash 裡執行，而且 Node.js 是剛安裝的，請先把 Node 路徑補進 PATH：

```bash
export PATH="/c/Program Files/nodejs:$PATH"
```

接著啟動開發伺服器：

```bash
npm run dev
```

### PowerShell

如果 PowerShell 開啟得比 Node.js 安裝時間還早，請先關掉終端再重開。若仍然抓不到 npm，可以先補 PATH：

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

然後啟動：

```powershell
npm run dev
```

啟動後，預設網址通常是：

```text
http://localhost:5173/
```

## 如何關閉開發伺服器

### 1. 正常關閉

如果你是在目前終端執行：

```bash
npm run dev
```

要關閉就直接按：

```text
Ctrl + C
```

如果終端回到可輸入狀態，而且顯示 Exit Code 130，通常表示你是手動中止成功。

### 2. 確認有沒有真的關乾淨

檢查 5173 這個埠是否還有程序在監聽：

```bash
netstat -ano | grep 5173
```

判讀方式：

- 如果沒有 LISTENING，表示 Vite 已經關乾淨。
- 如果還看到 127.0.0.1:5173 的 LISTENING，表示還有另一個程序活著。

也可以直接檢查本機頁面是否還有回應：

```bash
curl -I http://127.0.0.1:5173/
```

判讀方式：

- 如果連不上，表示伺服器真的關掉了。
- 如果還回 200 OK，表示仍然有程序在跑。

### 3. 沒關乾淨時的強制清理

先找出 5173 對應的 PID：

```bash
netstat -ano | grep 5173
```

假設看到：

```text
TCP    127.0.0.1:5173    ...    LISTENING    452
```

就可以直接關掉：

```bash
taskkill //PID 452 //F
```

然後再重新檢查一次：

```bash
netstat -ano | grep 5173
curl -I http://127.0.0.1:5173/
```

### 4. 建議流程

1. 在執行 npm run dev 的終端按 Ctrl + C。
2. 執行 netstat -ano | grep 5173。
3. 如果沒有 LISTENING，就表示已經關乾淨。
4. 如果還有 LISTENING，就記下 PID。
5. 執行 taskkill //PID <PID> //F。
6. 再用 netstat 或 curl 確認一次。

## 如何測試

### 1. 互動功能測試

啟動本機站後，逐一檢查這些互動：

- 速度模組：改變路程與時間，確認平均速度數值同步變化。
- 加速度模組：改變初速度、加速度、觀察時間，確認方塊位置和速度一起改變。
- 牛頓第一定律：改變摩擦影響，確認接近無摩擦與有摩擦的位移差異。
- 牛頓第二定律：改變推力與質量，確認加速度數值符合 F = ma 的直覺。
- 牛頓第三定律：改變左右質量，確認兩邊都會移動，但較輕者速度較大。
- 摩擦力模組：逐步增加施力，確認狀態會從尚未滑動切換到開始滑動。
- 自由落體：改變高度，確認落地時間與落地速度跟著變。
- 拋體運動：改變初速度與發射角，確認飛行時間、軌跡、射程改變。

### 2. 響應式測試

在瀏覽器開發者工具切換不同寬度，至少檢查：

- 手機寬度
- 平板寬度
- 桌機寬度

確認文字沒有擠壞、按鈕可點、滑桿可拖、每個模組都能完整顯示。

### 3. Lint 測試

檢查程式碼規則：

```bash
npm run lint
```

### 4. Build 測試

確認正式打包可成功輸出靜態檔：

```bash
npm run build
```

成功後會產生 dist 資料夾。這一步很重要，因為 GitHub Pages 只會部署靜態輸出。

### 5. Build 後預覽

先建置，再用預覽模式確認打包結果：

```bash
npm run build
npm run preview
```

重點檢查：

- 首頁是否正常載入
- 頁面錨點跳轉是否正常
- 所有動畫是否可運作
- 所有滑桿與數值是否正常更新

## GitHub Pages 部署

專案已包含 GitHub Actions 工作流，位置如下：

- .github/workflows/deploy.yml

推送到 main 分支後會自動：

1. 安裝相依套件
2. 執行 build
3. 發佈 dist 到 GitHub Pages

## GitHub Pages 注意事項

目前 Vite 的 production base path 設定為：

```ts
/animation_web/
```

如果你的 GitHub repository 名稱不是 animation_web，請同步修改 vite.config.ts 裡的 base 設定，不然部署後資產路徑會錯。

## 為什麼你可能不能執行 npm

這次在 Windows 環境裡，Node.js 是後裝的，而終端機不一定會自動拿到新的 PATH。這會造成幾種常見現象：

- npm: command not found
- node: command not found
- PowerShell 或 Git Bash 明明安裝了 Node，卻仍然找不到 npm

### 排查順序

1. 先關掉目前終端，重新開一個新的終端。
2. 執行 node -v 與 npm -v。
3. 如果 Git Bash 還是不行，先執行：

```bash
export PATH="/c/Program Files/nodejs:$PATH"
```

4. 如果 PowerShell 還是不行，先執行：

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

5. 再次執行：

```bash
npm run dev
```

## 補充說明

我先前說「已測試」是指我確實有跑過 lint 與 build，而且也成功把 dev server 啟起來；但那是在我先手動補 PATH 的終端環境中完成的。你本機終端直接執行失敗，代表我前一次回覆少講了這個前提，這點我更正：

- 我測試過的是「專案本身可跑」
- 你遇到的是「目前終端環境抓不到 Node/npm」

這兩件事不衝突，但我前面沒有把差異講清楚，這是我回覆不夠精確。
