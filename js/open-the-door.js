/**
 * 全域開關：控制是否播放音效（可由 UI 切換）
 * true = 允許播放，false = 關閉播放
 */
let playSound = false;

// 每拍幾次門就換下一扇門（可調整以方便測試）
const DOOR_CHANGE_THRESHOLD = 100;

// 儲存所有門的資料（從 door-stages.json 載入）
let doorStages = [];

// 記錄上一次顯示的門 ID，避免連續重複
let lastDoorId = -1;

// 追踪已開過的門的 ID（包括所有門，初始時會加入 id=0）
let openedDoors = new Set();

// 首次開門時間
let firstDoorTime = null;

// 完成全部門的時間
let completedTime = null;

/**
 * 從 localStorage 載入已開門的記錄
 */
function loadDoorsProgress() {
    try {
        const saved = localStorage.getItem('openedDoors');
        if (saved) {
            openedDoors = new Set(JSON.parse(saved));
        }
        
        const firstTime = localStorage.getItem('firstDoorTime');
        if (firstTime) {
            firstDoorTime = firstTime;
        }
        
        const completeTime = localStorage.getItem('completedTime');
        if (completeTime) {
            completedTime = completeTime;
        }
    } catch (error) {
        console.error('載入門的進度失敗:', error);
    }
}

/**
 * 儲存已開門的記錄到 localStorage
 */
function saveDoorsProgress() {
    try {
        localStorage.setItem('openedDoors', JSON.stringify([...openedDoors]));
        
        if (firstDoorTime) {
            localStorage.setItem('firstDoorTime', firstDoorTime);
        } else {
            localStorage.removeItem('firstDoorTime');
        }
        
        if (completedTime) {
            localStorage.setItem('completedTime', completedTime);
        } else {
            localStorage.removeItem('completedTime');
        }
    } catch (error) {
        console.error('儲存門的進度失敗:', error);
    }
}

/**
 * 更新進度顯示
 */
function updateProgressDisplay() {
    const progressEl = document.getElementById('doors_progress');
    const firstTimeEl = document.getElementById('first_time');
    const completeTimeEl = document.getElementById('complete_time');
    
    // 計算總門數（包括所有門）
    const totalDoors = doorStages.length;
    
    if (progressEl) {
        progressEl.textContent = `已開啟：${openedDoors.size}/${totalDoors}`;
    }
    
    if (firstTimeEl) {
        if (firstDoorTime) {
            firstTimeEl.textContent = `首次開門：${new Date(firstDoorTime).toLocaleString('zh-TW')}`;
        } else {
            firstTimeEl.textContent = '';
        }
    }
    
    if (completeTimeEl) {
        if (completedTime) {
            completeTimeEl.textContent = `🎉 全部完成：${new Date(completedTime).toLocaleString('zh-TW')}`;
        } else {
            completeTimeEl.textContent = '';
        }
    }
}

/**
 * 從 door-stages.json 隨機選擇一扇 id > 0 的門來顯示，
 * 並確保不會與前一次選擇的門重複。
 *
 * @param {HTMLImageElement} img - 要更新的 <img> 元素
 * @param {number} count - 拍門次數
 */
function setDoorImage(img, count) {
    const defaultDoor = doorStages.find(door => door.id === 0);
    const availableDoors = doorStages.filter(door => door.id > 0);
    let characterImg = document.getElementById("door_character");

    if (availableDoors.length === 0) {
        console.error("沒有可用的門資料");
        return;
    }

    if (count == 0 && defaultDoor) {
        img.src = defaultDoor.image;
        lastDoorId = defaultDoor.id;
        return;
    }
    
    // 如果只有一扇門，直接使用
    if (availableDoors.length === 1) {
        const door = availableDoors[0];
        img.src = door.image;
        lastDoorId = door.id;
        return;
    }
    
    // 過濾掉上一次選擇的門
    let selectableDoors = availableDoors.filter(door => door.id !== lastDoorId);
    
    // 如果過濾後沒有門了（理論上不會發生），使用全部可用的門
    if (selectableDoors.length === 0) {
        selectableDoors = availableDoors;
    }
    
    // 隨機選擇一扇門
    const randomDoor = selectableDoors[Math.floor(Math.random() * selectableDoors.length)];
    img.src = randomDoor.image;
    lastDoorId = randomDoor.id;

    // 記錄這扇門已被開啟
    if (!openedDoors.has(randomDoor.id)) {
        openedDoors.add(randomDoor.id);
        
        // 如果是第一扇門（id=0），記錄首次時間
        if (openedDoors.size === 1 && !firstDoorTime) {
            firstDoorTime = new Date().toISOString();
        }
        
        // 檢查是否已開完所有門
        const totalDoors = doorStages.length;
        if (openedDoors.size === totalDoors && !completedTime) {
            completedTime = new Date().toISOString();
        }
        
        // 儲存進度並更新顯示
        saveDoorsProgress();
        updateProgressDisplay();
    }

    // 以 0.01 的機率顯示角色頭像在右下角（如果現在有顯示就隱藏，沒顯示才可能出現）
    if (characterImg.style.display === "block") {
        // 現在有顯示，就隱藏
        characterImg.style.display = "none";
    } else if (Math.random() < 0.001) {
        // 現在沒顯示，有 0.001 的機率顯示
        characterImg.style.display = "block";
    } else {
        // 現在沒顯示，這次也沒有符合機率，保持隱藏
        characterImg.style.display = "none";
    }
}

/**
 * 隨機選擇並播放音效。
 * 流程：
 * 1. 若全域 playSound 為 false，直接跳過播放。
 * 2. 有額外音效時，有 5% 機率隨機播放一個額外音效。
 * 3. 否則從音效類型中隨機選擇一個（wood、bigWood、iron），再從該類型中隨機選擇一個音效播放。
 *
 * @param {number} count - 拍門次數（保留參數以維持相容性）
 * @param {Object} soundConfig - 音效配置對象，包含 wood、bigWood、iron、extra 等陣列
 */
function playDoorSound(count, soundConfig) {
    if (!playSound) return; // 若被關閉則不播放任何音效

    // 有額外音效時，以 5% 機率播放其中一個（當作彩蛋）
    if (soundConfig.extra && soundConfig.extra.length > 0 && Math.random() < 0.005) {
        const randomPath = soundConfig.extra[Math.floor(Math.random() * soundConfig.extra.length)];
        const audio = new Audio(randomPath);
        audio.play();
        return;
    }

    // 從 soundConfig 中隨機選擇一個音效類型（排除 extra）
    const soundTypes = Object.keys(soundConfig).filter(key => key !== 'extra');
    if (soundTypes.length === 0) return;
    
    const randomType = soundTypes[Math.floor(Math.random() * soundTypes.length)];
    const soundPaths = soundConfig[randomType];

    // 從選定的陣列隨機挑一個播放
    if (soundPaths && soundPaths.length > 0) {
        const randomPath = soundPaths[Math.floor(Math.random() * soundPaths.length)];
        const audio = new Audio(randomPath);
        audio.play();
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
async function initOpenDoor() {
    // 載入門的資料
    try {
        const response = await fetch('door-stages.json');
        const data = await response.json();
        doorStages = data.stages;
    } catch (error) {
        console.error("無法載入門的資料:", error);
        return;
    }

    // 載入已開門的進度
    loadDoorsProgress();

    // 初始化時確保 id=0 的門已被記錄
    if (!openedDoors.has(0)) {
        openedDoors.add(0);
        // 如果這是第一次，記錄首次時間
        if (!firstDoorTime) {
            firstDoorTime = new Date().toISOString();
        }
        saveDoorsProgress();
    }

    // 載入音效配置
    let soundConfig;
    try {
        const response = await fetch('door-sounds.json');
        soundConfig = await response.json();
    } catch (error) {
        console.error("無法載入音效配置:", error);
        return;
    }

    // 設定參數與 UI 元素
    const img = document.getElementById("door_img");
    const counter = document.getElementById("open_times");
    const resetBtn = document.getElementById("reset_btn");
    const resetDoorsBtn = document.getElementById("reset_doors_btn");
    const soundToggle = document.getElementById("sound_toggle");
    let count = 0;

    // 設定初始畫面與顯示文字
    setDoorImage(img, count);
    counter.textContent = `拍門次數：${count}`;
    updateProgressDisplay();

    // 圖片點擊處理：增加計數、更新畫面、儲存並播放音效，並做震動動畫
    img.addEventListener("click", () => {
        count++;
        counter.textContent = `拍門次數：${count}`;

        // 每拍指定次數就換一扇門
        if (count % DOOR_CHANGE_THRESHOLD === 0) {
            setDoorImage(img);
        }

        playDoorSound(count, soundConfig);

        // 觸發一次 CSS 動畫（先移除再加回以確保能重複播放）
        img.classList.remove("shake");
        void img.offsetWidth; // 強制 reflow，讓動畫可以重新觸發
        img.classList.add("shake");
    });

    // 重置按鈕：把計數歸零並更新畫面與 localStorage
    resetBtn.addEventListener("click", () => {
        count = 0;

        counter.textContent = `拍門次數：${count}`;
        setDoorImage(img, count);
    });

    // 重置拍過的門按鈕：清除所有開門記錄（需要確認）
    resetDoorsBtn.addEventListener("click", () => {
        if (confirm("確定要重置所有拍過的門的記錄嗎？\n\n這將會清除：\n- 已開啟的門的數量\n- 首次開門時間\n- 完成時間\n\n此操作無法復原！")) {
            // 清除記錄
            openedDoors.clear();
            firstDoorTime = null;
            completedTime = null;
            
            // 重新加入 id=0（初始門）
            openedDoors.add(0);
            firstDoorTime = new Date().toISOString();
            
            // 儲存並更新顯示
            saveDoorsProgress();
            updateProgressDisplay();
            
            // 重置拍門次數
            count = 0;
            counter.textContent = `拍門次數：${count}`;
            setDoorImage(img, count);
            
            alert("已重置拍過的門的記錄！");
        }
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