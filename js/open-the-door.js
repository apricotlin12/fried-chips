/**
 * 全域開關：控制是否播放音效（可由 UI 切換）
 * true = 允許播放，false = 關閉播放
 */
let playSound = true;

/**
 * 根據拍門次數決定要顯示哪張門的圖片
 * - count >= 10000 -> 保險庫門
 * - count >= 1000  -> 鐵門
 * - default        -> 主圖（普通門）
 *
 * @param {HTMLImageElement} img - 要更新的 <img> 元素
 * @param {number} count - 拍門次數
 */
function setDoorImage(img, count) {
    switch (true) {
        case count >= 50000:
            img.src = "img/ohiroma.jpg";
            break;
        case count >= 10000:
            img.src = "img/bank_vault_door.jpg";
            break;
        case count >= 1000:
            img.src = "img/iron_door.jpg";
            break;
        default:
            img.src = "img/main_pic_door.jpg";
    }
}

/**
 * 根據拍門次數與機率來選擇並播放相對應的音效。
 * 流程：
 * 1. 若全域 playSound 為 false，直接跳過播放。
 * 2. 有額外音效 (extraAudios) 時，有 5% 機率隨機播放一個額外音效（不看次數）。
 * 3. 否則根據 count 選擇音效陣列（木門、小木門、大鐵門等）並隨機撥其中一個。
 *
 * 音效陣列參數說明：
 * - woodAudios: 一般木門聲
 * - bigWoodAudios: 力道較大的木門聲
 * - ironAudios: 鐵門/重門聲
 * - extraAudios: 額外的隨機彩蛋音效
 *
 * @param {number} count - 拍門次數
 * @param {HTMLAudioElement[]} woodAudios
 * @param {HTMLAudioElement[]} bigWoodAudios
 * @param {HTMLAudioElement[]} ironAudios
 * @param {HTMLAudioElement[]} extraAudios
 */
function playDoorSound(count, woodAudios, bigWoodAudios, ironAudios, extraAudios) {
    if (!playSound) return; // 若被關閉則不播放任何音效

    // 有額外音效時，以 5% 機率播放其中一個（當作彩蛋）
    if (extraAudios && extraAudios.length > 0 && Math.random() < 0.05) {
        const randomExtra = extraAudios[Math.floor(Math.random() * extraAudios.length)];
        randomExtra.currentTime = 0;
        randomExtra.play();
        return;
    }

    // 根據次數挑選音效陣列
    let audioArr;
    switch (true) {
        case count >= 10000:
            audioArr = ironAudios;
            break;
        case count >= 1000:
            audioArr = ironAudios;
            break;
        case count >= 200:
            audioArr = bigWoodAudios;
            break;
        default:
            audioArr = woodAudios;
    }

    // 從選定的陣列隨機挑一個撥放
    if (audioArr.length > 0) {
        const randomAudio = audioArr[Math.floor(Math.random() * audioArr.length)];
        randomAudio.currentTime = 0;
        randomAudio.play();
    }
}

/**
 * 初始化「拍門」互動區塊。
 * - 綁定圖片點擊事件（每次點擊計數、存 localStorage、換圖、播音效、觸發動畫）
 * - 綁定重置按鈕（重置計數並更新 localStorage）
 * - 建立多組音效物件（wood/bigWood/iron/extra）
 * - 每次載入依照 localStorage 的計數決定初始圖與是否播放一次音效
 * - 若距離上次點擊超過一小時，視為重置（count = 0）
 *
 * UI 元素（必須存在於 open-the-door.html）：
 * - #door_img: 圖片，點擊觸發拍門
 * - #open_times: 顯示次數的文字節點
 * - #reset_btn: 重置按鈕
 * - #sound_toggle: 音效開關（checkbox）
 */
function initOpenDoor() {
    const img = document.getElementById("door_img");
    const counter = document.getElementById("open_times");
    const resetBtn = document.getElementById("reset_btn");
    const soundToggle = document.getElementById("sound_toggle");

    // 讀取 localStorage 中的計數與最後點擊時間（如果沒有則預設 0）
    let count = parseInt(localStorage.getItem("doorCount")) || 0;
    let lastClickTime = parseInt(localStorage.getItem("lastClickTime")) || 0;

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // 如果距離上次點擊超過一小時，視為過期並重置計數
    if (now - lastClickTime > oneHour) {
        count = 0;
    }

    // 設定初始畫面與顯示文字
    setDoorImage(img, count);
    counter.textContent = `拍門次數：${count}`;

    // 建立各種音效陣列，對應不同力度/材質的門聲
    const woodAudios = [
        new Audio("sound/敲木門.mp3"),
        new Audio("sound/敲木門(大回音).mp3")
    ];
    const bigWoodAudios = [
        new Audio("sound/拍木門.mp3"),
        new Audio("sound/拍木門(回音).mp3")
    ];
    const ironAudios = [
        new Audio("sound/敲鐵門.mp3"),
        new Audio("sound/敲鐵門1.mp3"),
        new Audio("sound/拍鐵門.mp3")
    ];
    // 額外的隨機彩蛋音效
    const extraAudios = [
        new Audio("sound/快樂敲門.mp3"),
        new Audio("sound/皇后娘娘.mp3")
    ];

    // 如果已有次數，載入時先播放一次對應音效（模擬剛剛有人拍過）
    if (count > 0) {
        playDoorSound(count, woodAudios, bigWoodAudios, ironAudios, extraAudios);
    }

    // 圖片點擊處理：增加計數、更新畫面、儲存並播放音效，並做震動動畫
    img.addEventListener("click", () => {
        count++;
        counter.textContent = `拍門次數：${count}`;

        // 儲存到 localStorage（次數與最後點擊時間）
        localStorage.setItem("doorCount", count);
        localStorage.setItem("lastClickTime", Date.now());

        setDoorImage(img, count);

        playDoorSound(count, woodAudios, bigWoodAudios, ironAudios, extraAudios);

        // 觸發一次 CSS 動畫（先移除再加回以確保能重複播放）
        img.classList.remove("shake");
        void img.offsetWidth; // 強制 reflow，讓動畫可以重新觸發
        img.classList.add("shake");
    });

    // 重置按鈕：把計數歸零並更新畫面與 localStorage
    resetBtn.addEventListener("click", () => {
        count = 0;
        localStorage.setItem("doorCount", count);
        localStorage.setItem("lastClickTime", Date.now());

        counter.textContent = `拍門次數：${count}`;
        setDoorImage(img, count);
    });

    // 音效開關：切換全域 playSound 變數控制是否播放音效
    soundToggle.addEventListener("change", (e) => {
        playSound = e.target.checked;
    });
}

// 如果此 script 被直接載入於含有 #door_img 的頁面，則自動初始化。
// 這允許 open-the-door.html 被單獨打開時也可正常運作。
if (document.getElementById("door_img")) {
  initOpenDoor();
}