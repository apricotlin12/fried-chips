/**
 * 初始化材料區塊，根據 json 動態產生材料按鈕與數量
 * @param {string[]} materialNames 材料名稱陣列
 */
function renderMaterials(materialNames) {
  const materialsDiv = document.querySelector('.materials');
  materialsDiv.innerHTML = '';
  materialNames.forEach((mat, idx) => {
    const btn = document.createElement('button');
    btn.className = 'material';
    btn.type = 'button';
    btn.textContent = mat;
    const countDiv = document.createElement('div');
    countDiv.className = 'material-count';
    countDiv.id = `count${String.fromCharCode(65 + idx)}`; // countA, countB, ...
    countDiv.textContent = '0';
    materialsDiv.appendChild(btn);
    materialsDiv.appendChild(countDiv);
  });
}

/**
 * 初始化工人區塊，根據 json 動態產生工人按鈕、數量與材料需求
 * @param {Array} workerData 工人資料陣列
 * @param {string[]} materialNames 材料名稱陣列
 */
function renderWorkers(workerData, materialNames) {
  const workersDiv = document.querySelector('.workers');
  workersDiv.innerHTML = '';
  workerData.forEach((worker, idx) => {
    // 工人按鈕
    const btn = document.createElement('button');
    btn.className = 'worker';
    btn.type = 'button';
    btn.textContent = worker.name;

    // 工人數量
    const countDiv = document.createElement('div');
    countDiv.className = 'worker-count';
    countDiv.id = `countWorker${String.fromCharCode(65 + idx)}`;
    countDiv.textContent = '0';

    // 材料需求文字
    const needDiv = document.createElement('div');
    needDiv.className = 'worker-needs';
    needDiv.style.fontSize = '0.9em';
    needDiv.style.color = '#666';
    needDiv.style.marginTop = '4px';
    needDiv.textContent = materialNames.map(mat => `${mat}: ${worker.materials[mat]}`).join('　');

    // 工人按鈕和數量同一行
    const rowDiv = document.createElement('div');
    rowDiv.className = 'worker-row';
    rowDiv.appendChild(btn);
    rowDiv.appendChild(countDiv);

    // 包成一個工人區塊
    const workerBlock = document.createElement('div');
    workerBlock.className = 'worker-block';
    workerBlock.appendChild(rowDiv);
    workerBlock.appendChild(needDiv);

    workersDiv.appendChild(workerBlock);
  });
}

/**
 * 材料按鈕點擊：數量+1
 */
function bindMaterialClick() {
  document.querySelectorAll('.material').forEach((materialBtn) => {
    materialBtn.addEventListener('click', () => {
      const countDiv = materialBtn.nextElementSibling;
      let count = parseInt(countDiv.textContent, 10) || 0;
      countDiv.textContent = count + 1;
    });
  });
}

/**
 * 工人按鈕點擊：依照 json 中 workers 各工人設定的材料數字來扣除，工人數量+1
 */
function bindWorkerClick(workerData, materialNames) {
  document.querySelectorAll('.worker').forEach((workerBtn, idx) => {
    workerBtn.addEventListener('click', () => {
      // 取得這個工人的材料需求
      const workerInfo = workerData[idx];
      let canAddWorker = true;

      materialNames.forEach((mat, matIdx) => {
        const matId = `count${String.fromCharCode(65 + matIdx)}`;
        const matDiv = document.getElementById(matId);
        let matCount = parseInt(matDiv.textContent, 10) || 0;
        const need = workerInfo.materials[mat] || 0;
        if (matCount < need) canAddWorker = false;
      });

      if (!canAddWorker) {
        showTip('材料不足，無法增加工人！');
        return;
      }

      // 扣除材料
      materialNames.forEach((mat, matIdx) => {
        const matId = `count${String.fromCharCode(65 + matIdx)}`;
        const matDiv = document.getElementById(matId);
        let matCount = parseInt(matDiv.textContent, 10) || 0;
        const need = workerInfo.materials[mat] || 0;
        matDiv.textContent = matCount - need;
      });

      // 工人數量+1
      const workerCountDiv = workerBtn.nextElementSibling;
      let workerCount = parseInt(workerCountDiv.textContent, 10) || 0;
      workerCountDiv.textContent = workerCount + 1;
    });
  });
}

/**
 * 工人自動生產材料
 * @param {string} workerId 工人數量的元素ID
 * @param {string} materialId 材料數量的元素ID
 */
function produceMaterial(workerId, materialId) {
  const workerCount = parseInt(document.getElementById(workerId).textContent, 10) || 0;
  const materialDiv = document.getElementById(materialId);
  let materialCount = parseInt(materialDiv.textContent, 10) || 0;
  materialDiv.textContent = materialCount + workerCount;
}

/**
 * 每秒自動生產材料
 */
setInterval(() => {
  produceMaterial('countWorkerA', 'countA');
  produceMaterial('countWorkerB', 'countB');
  produceMaterial('countWorkerC', 'countC');
  produceMaterial('countWorkerD', 'countD');
}, 1000);

/**
 * 畫面浮出提示訊息
 * @param {string} msg 要顯示的訊息
 */
function showTip(msg) {
  let tip = document.getElementById('floating-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'floating-tip';
    tip.className = 'floating-tip';
    tip.style.display = 'none';
    document.body.appendChild(tip);
  }
  tip.textContent = msg;
  tip.style.display = 'block';
  setTimeout(() => {
    tip.style.display = 'none';
  }, 1500);
}

/**
 * 物品升級區塊初始化與升級邏輯
 */
document.addEventListener('DOMContentLoaded', () => {
  const itemsDiv = document.getElementById('items');

  fetch('items.json')
    .then(response => response.json())
    .then(data => {
      // 取得材料名稱（假設所有物品的材料欄位都一樣）
      const materialNames = Object.keys(data.items[0].materials);

      // 動態產生材料區塊
      renderMaterials(materialNames);

      // 動態產生工人區塊（含材料需求）
      renderWorkers(data.workers, materialNames);

      // 綁定材料按鈕點擊事件
      bindMaterialClick();

      // 動態綁定工人按鈕點擊事件，依 json 設定扣材料
      bindWorkerClick(data.workers, materialNames);

      // ...物品升級區塊（保持原本邏輯）...
      const headers = ['等級', '名稱', ...materialNames];
      headers.forEach(h => {
        const hDiv = document.createElement('div');
        hDiv.className = 'item';
        hDiv.style.background = '#f7f7f7';
        hDiv.style.fontWeight = 'normal';
        hDiv.textContent = h;
        itemsDiv.appendChild(hDiv);
      });

      data.items.forEach((item, idx) => {
        // Lv. 欄
        const lvDiv = document.createElement('div');
        lvDiv.className = 'item';
        lvDiv.id = `lv-${idx}`;
        lvDiv.textContent = 'Lv. 0';
        itemsDiv.appendChild(lvDiv);

        // 物品名稱（按鈕）
        const itemBtn = document.createElement('button');
        itemBtn.className = 'item';
        itemBtn.textContent = item.name;
        itemBtn.style.cursor = 'pointer';
        itemsDiv.appendChild(itemBtn);

        // 材料格子
        materialNames.forEach(mat => {
          const matDiv = document.createElement('div');
          matDiv.className = 'item';
          matDiv.textContent = item.materials[mat] !== undefined ? item.materials[mat] : '-';
          itemsDiv.appendChild(matDiv);
        });

        /**
         * 點擊物品按鈕：Lv+1 並扣材料
         */
        itemBtn.addEventListener('click', () => {
          // 檢查材料是否足夠
          let canUpgrade = true;
          materialNames.forEach(mat => {
            const matId = `count${String.fromCharCode(65 + materialNames.indexOf(mat))}`;
            const matDiv = document.getElementById(matId);
            let matCount = parseInt(matDiv.textContent, 10) || 0;
            const need = item.materials[mat] || 0;
            if (matCount < need) canUpgrade = false;
          });

          if (!canUpgrade) {
            showTip('材料不足，無法升級！');
            return;
          }

          // 扣材料
          materialNames.forEach(mat => {
            const matId = `count${String.fromCharCode(65 + materialNames.indexOf(mat))}`;
            const matDiv = document.getElementById(matId);
            let matCount = parseInt(matDiv.textContent, 10) || 0;
            const need = item.materials[mat] || 0;
            matDiv.textContent = matCount - need;
          });

          // Lv+1
          let lv = parseInt(lvDiv.textContent.replace('Lv. ', ''), 10) || 0;
          lvDiv.textContent = `Lv. ${lv + 1}`;
          showTip('升級成功！');
        });
      });
    });
});