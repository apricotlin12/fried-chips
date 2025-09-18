let playSound = true;

function setDoorImage(img, count) {
    switch (true) {
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

function playDoorSound(count, woodAudios, bigWoodAudios, ironAudios, extraAudios) {
    if (!playSound) return; // 控制是否撥放音效

    // 機率播放隨機音效，不看次數
    if (extraAudios && extraAudios.length > 0 && Math.random() < 0.05) {
        const randomExtra = extraAudios[Math.floor(Math.random() * extraAudios.length)];
        randomExtra.currentTime = 0;
        randomExtra.play();
        return;
    }

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
    if (audioArr.length > 0) {
        const randomAudio = audioArr[Math.floor(Math.random() * audioArr.length)];
        randomAudio.currentTime = 0;
        randomAudio.play();
    }
}

function initOpenDoor() {
    const img = document.getElementById("door_img");
    const counter = document.getElementById("open_times");
    const resetBtn = document.getElementById("reset_btn");
    const soundToggle = document.getElementById("sound_toggle");

    // 讀取 localStorage
    let count = parseInt(localStorage.getItem("doorCount")) || 0;
    let lastClickTime = parseInt(localStorage.getItem("lastClickTime")) || 0;

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // 如果超過一小時，重置
    if (now - lastClickTime > oneHour) {
        count = 0;
    }

    setDoorImage(img, count);
    counter.textContent = `拍門次數：${count}`;

    // 新增音效物件（多種音效）
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
    // 新增隨機音效
    const extraAudios = [
        new Audio("sound/快樂敲門.mp3")
    ];

    // 一開始依照 count 播放音效
    if (count > 0) {
        playDoorSound(count, woodAudios, bigWoodAudios, ironAudios, extraAudios);
    }

    img.addEventListener("click", () => {
        count++;
        counter.textContent = `拍門次數：${count}`;

        // 儲存到 localStorage
        localStorage.setItem("doorCount", count);
        localStorage.setItem("lastClickTime", Date.now());

        setDoorImage(img, count);

        playDoorSound(count, woodAudios, bigWoodAudios, ironAudios, extraAudios);

        // 觸發動畫
        img.classList.remove("shake");
        void img.offsetWidth; // 強制 reflow
        img.classList.add("shake");
    });

    resetBtn.addEventListener("click", () => {
        count = 0;
        localStorage.setItem("doorCount", count);
        localStorage.setItem("lastClickTime", Date.now());

        counter.textContent = `拍門次數：${count}`;
        setDoorImage(img, count);
    });

    // 音效開關
    soundToggle.addEventListener("change", (e) => {
        playSound = e.target.checked;
    });
}

if (document.getElementById("door_img")) {
  // 如果這頁是被直接打開，自己初始化
  initOpenDoor();
}