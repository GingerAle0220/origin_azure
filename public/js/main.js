"use strict";

// ===== OPENING ANIMATION =====
(function runOpening() {
  const lines    = document.querySelectorAll('.op-line');
  const subtitle = document.querySelector('.op-subtitle');
  const overlay  = document.getElementById('opening-overlay');
  const mainSite = document.getElementById('main-site');

  // 各ラインを順番にスライドイン
  lines.forEach((line, i) => {
    setTimeout(() => {
      line.classList.add('slide-in');
    }, i * 650 + 200);
  });

  // サブタイトルをフェードイン
  setTimeout(() => {
    subtitle.classList.add('fade-in');
  }, lines.length * 650 + 400);

  // オープニング終了 → メインサイトへ
  const totalTime = lines.length * 650 + 1800;
  setTimeout(() => {
    overlay.style.transition = 'opacity 0.7s ease';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.classList.add('hidden');
      mainSite.classList.remove('hidden');
      initCoin();
    }, 700);
  }, totalTime);
})();


// ===== COIN LOGIC =====
function initCoin() {
  const coinImg        = document.getElementById('coin-img');
  const container      = document.getElementById('coin-container');
  const hint           = document.getElementById('coin-hint');
  const badge          = document.getElementById('result-badge');
  const bookSection    = document.getElementById('book-section');
  const horrorSection  = document.getElementById('horror-section');
  const pachinkoSection = document.getElementById('pachinko-section');

  // コイン画像パス
  const COIN_SUN    = '/images/coin_sun.png';
  const COIN_MOON   = '/images/coin_moon.png';
  const COIN_LEGEND = '/images/coin_regend.png';

  let isSpinning = false;
  let currentFace = 'sun'; // 初期は表(sun)

  container.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;

    // セクション・バッジを隠す
    bookSection.classList.add('hidden');
    horrorSection.classList.add('hidden');
    pachinkoSection.classList.add('hidden');
    badge.classList.add('hidden');
    badge.className = 'hidden';
    coinImg.classList.remove('legend-glow');

    hint.textContent = '回転中...';

    // 結果を先に決定
    //ここの値を変更することで確率を操作できるよ１までの値の割合
    const rand = Math.random();
    let result;
    if (rand < 0.1)        result = 'legend';// レジェンド→ぱちんこ
    else if (rand < 0.55)  result = 'sun';   // 表 → 本
    else                   result = 'moon';  // 裏 → ホラー

    // --- アニメーション制御 ---
    // 交互に切り替える画像シーケンスを作る（6回フリップ）
    const FLIP_COUNT = 6;   // 途中の高速フリップ回数
    const FLIP_INTERVAL = 130; // ms
    const faces = ['sun', 'moon']; // 高速中は sun↔moon を交互に
    let flipIdx = 0;

    // Phase1: パラパラ高速フリップ
    coinImg.classList.add('flip-flicker');

    const flickerInterval = setInterval(() => {
      // flickerアニメ中に画像を切り替えてパラパラ感を演出
      // scaleXが0に近いタイミングで入れ替える（半分の周期）
      flipIdx++;
      coinImg.src = faces[flipIdx % 2] === 'sun' ? COIN_SUN : COIN_MOON;
    }, FLIP_INTERVAL / 2);

    // Phase1終了後: 最終フリップで結果の面を出す
    setTimeout(() => {
      clearInterval(flickerInterval);
      coinImg.classList.remove('flip-flicker');

      // flipOut（現在の面を潰す）
      coinImg.classList.add('flip-out');
      coinImg.addEventListener('animationend', function onOut() {
        coinImg.removeEventListener('animationend', onOut);
        coinImg.classList.remove('flip-out');

        // 画像を結果に差し替え
        if (result === 'sun')         coinImg.src = COIN_SUN;
        else if (result === 'moon')   coinImg.src = COIN_MOON;
        else                          coinImg.src = COIN_LEGEND;

        // flipIn（新しい面を広げる）
        coinImg.classList.add('flip-in');
        coinImg.addEventListener('animationend', function onIn() {
          coinImg.removeEventListener('animationend', onIn);
          coinImg.classList.remove('flip-in');

          // レジェンドならグロー開始
          if (result === 'legend') coinImg.classList.add('legend-glow');

          // 結果表示
          showResult(result);
          isSpinning = false;
        });
      });
    }, FLIP_INTERVAL * FLIP_COUNT);
  });

  function showResult(type) {
    badge.classList.remove('hidden');

    if (type === 'sun') {
      hint.textContent = '☀ 表！ライトモード — 本の紹介へ';
      badge.textContent = '☀ 表面 — 本の世界へようこそ';
      badge.classList.add('badge-light');
      revealSection(bookSection);

    } else if (type === 'moon') {
      hint.textContent = '☽ 裏！ダークモード — ホラーゲームの世界へ';
      badge.textContent = '☽ 裏面 — 闇の世界へようこそ';
      badge.classList.add('badge-dark');
      revealSection(horrorSection);

    } else {
      hint.textContent = '★ LEGEND！パチンコ紹介が解放された！';
      badge.textContent = '★ LEGEND COIN 出現！おめでとう！';
      badge.classList.add('badge-legend');
      revealSection(pachinkoSection);
    }
  }

  function revealSection(section) {
    section.classList.remove('hidden');
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
}


// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const targets = document.querySelectorAll('.scroll-reveal');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}

// メインサイト表示後に呼ばれるよう、MutationObserverで監視
const mainObserver = new MutationObserver(() => {
  const main = document.getElementById('main-site');
  if (main && !main.classList.contains('hidden')) {
    initScrollReveal();
    mainObserver.disconnect();
  }
});
mainObserver.observe(document.body, { attributes: true, childList: true, subtree: true });

// ===== BULLETIN BOARD LOGIC (Socket.io) =====
(function initBoard() {
  if (typeof io === 'undefined') return;
  const socket = io();

  const boardForm = document.getElementById('board-form');
  const boardName = document.getElementById('board-name');
  const boardMsg = document.getElementById('board-msg');
  const boardMessages = document.getElementById('board-messages');

  // Utility to generate unique ID for posts
  function generateId() {
    return 'msg_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  }

  // Render a single message
  function renderMessage(msg) {
    const li = document.createElement('li');
    li.className = 'board-msg-item';
    li.id = msg.id;

    const header = document.createElement('div');
    header.className = 'board-msg-header';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'board-msg-name';
    nameSpan.textContent = msg.name;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'board-msg-time';
    const d = new Date(msg.timestamp);
    timeSpan.textContent = `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    header.appendChild(nameSpan);
    header.appendChild(timeSpan);

    const body = document.createElement('div');
    body.className = 'board-msg-body';
    body.textContent = msg.text;

    li.appendChild(header);
    li.appendChild(body);

    // If the message belongs to this user, add a delete button
    let myPosts = [];
    try {
      myPosts = JSON.parse(localStorage.getItem('myPosts') || '[]');
    } catch(e) {}
    
    if (myPosts.includes(msg.id)) {
      const delBtn = document.createElement('button');
      delBtn.className = 'board-msg-del';
      delBtn.textContent = '削除';
      delBtn.onclick = () => {
        if(confirm('この投稿を削除しますか？')) {
          socket.emit('delete message', msg.id);
        }
      };
      header.appendChild(delBtn);
    }

    boardMessages.appendChild(li);
  }

  // Handle Initial messages
  socket.on('initial messages', (messages) => {
    boardMessages.innerHTML = ''; // clear
    messages.forEach(msg => renderMessage(msg));
  });

  // Handle incoming message
  socket.on('chat message', (msg) => {
    renderMessage(msg);
  });

  // Handle deleted message
  socket.on('message deleted', (msgId) => {
    const el = document.getElementById(msgId);
    if (el) el.remove();
    
    // clean up local storage
    try {
      let myPosts = JSON.parse(localStorage.getItem('myPosts') || '[]');
      myPosts = myPosts.filter(id => id !== msgId);
      localStorage.setItem('myPosts', JSON.stringify(myPosts));
    } catch(e) {}
  });

  // Form submit handler
  if (boardForm) {
    boardForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = boardName.value.trim();
      const text = boardMsg.value.trim();
      if (!name || !text) return;

      const id = generateId();
      const timestamp = Date.now();

      // Save ID to localStorage to track ownership
      try {
        const myPosts = JSON.parse(localStorage.getItem('myPosts') || '[]');
        myPosts.push(id);
        localStorage.setItem('myPosts', JSON.stringify(myPosts));
      } catch(e) {}

      const msg = { id, name, text, timestamp };
      socket.emit('chat message', msg);

      boardMsg.value = ''; // clear input
    });
  }
})();