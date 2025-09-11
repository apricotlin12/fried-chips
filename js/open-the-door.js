function initOpenDoor() {
    const img = document.getElementById("door_img");
    const counter = document.getElementById("open_times");
    const resetBtn = document.getElementById("reset_btn");

    // 讀取 localStorage
    let count = parseInt(localStorage.getItem("doorCount")) || 0;
    let lastClickTime = parseInt(localStorage.getItem("lastClickTime")) || 0;

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // 如果超過一小時，重置
    if (now - lastClickTime > oneHour) {
        count = 0;
    }

    if (count >= 1000) {
    img.src = "img/iron_door.jpg";
    }

    if (count >= 10000) {
    img.src = "img/bank_vault_door.jpg";
    }

    counter.textContent = `拍門次數：${count}`;

    img.addEventListener("click", () => {
        count++;
        counter.textContent = `拍門次數：${count}`;

        // 儲存到 localStorage
        localStorage.setItem("doorCount", count);
        localStorage.setItem("lastClickTime", Date.now());

        if (count >= 1000) {
            img.src = "img/iron_door.jpg";
        }

        if (count >= 10000) {
            img.src = "img/bank_vault_door.jpg";
        }

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
        img.src = "img/main_pic_door.jpg";
    });
}

if (document.getElementById("door_img")) {
  // 如果這頁是被直接打開，自己初始化
  initOpenDoor();
}