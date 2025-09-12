// 讀取 header.html
fetch('header.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;

  // 修改 h1
  const fileName = window.location.pathname.split('/').pop();
  let pageTitle = "活動倒數計時器";
  if (fileName === "fried-chips.html") {
    pageTitle = "倒薯計時器";
  } else if (fileName === "custom-chips.html") {
    pageTitle = "自訂倒數計時器";
  } // 可依需求繼續加

  const h1 = document.querySelector('#header-placeholder h1');
  if (h1) h1.textContent = pageTitle;

  // 設定 active class
  const currentPath = window.location.pathname.split('/').pop(); // 例如 index.html
  const links = document.querySelectorAll('#header-placeholder nav a');
  links.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
    if (currentPath === "" && linkPath === "index.html") {
      link.classList.add('active');
    }
  });
});

// 讀取 footer.html
fetch('footer.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('footer-placeholder').innerHTML = data;
  });
