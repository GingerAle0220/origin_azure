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