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
  const coin        = document.getElementById('coin');
  const container   = document.getElementById('coin-container');
  const hint        = document.getElementById('coin-hint');
  const badge       = document.getElementById('result-badge');
  const bookSection    = document.getElementById('book-section');
  const horrorSection  = document.getElementById('horror-section');
  const pachinkoSection = document.getElementById('pachinko-section');

  let isSpinning = false;
  let currentFace = null; // 'front' | 'back' | 'legend'

  container.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;

    // 前回のセクションを隠す
    bookSection.classList.add('hidden');
    horrorSection.classList.add('hidden');
    pachinkoSection.classList.add('hidden');
    badge.classList.add('hidden');
    badge.className = 'hidden'; // クラスリセット

    // コインのレジェンド効果をリセット
    coin.classList.remove('legend', 'is-front', 'is-back');
    hint.textContent = '運命を決めています...';

    // 結果を決定（1/10でレジェンド）
    const rand = Math.random();
    let result;
    if (rand < 0.1) {
      result = 'legend';
    } else if (rand < 0.55) {
      result = 'front'; // 表 → ライトモード本
    } else {
      result = 'back';  // 裏 → ダークモードホラー
    }

    // スピンアニメーション
    coin.classList.add('spinning');

    // アニメーション終了後に結果適用
    coin.addEventListener('animationend', function onEnd() {
      coin.removeEventListener('animationend', onEnd);
      coin.classList.remove('spinning');

      // 最終的な面を表示
      if (result === 'front') {
        coin.classList.add('is-front');
        showResult('front');
      } else if (result === 'back') {
        coin.classList.add('is-back');
        showResult('back');
      } else {
        // レジェンド：金色コイン
        coin.classList.add('is-front', 'legend');
        showResult('legend');
      }

      isSpinning = false;
    });
  });

  function showResult(type) {
    badge.classList.remove('hidden');

    if (type === 'front') {
      hint.textContent = '☀ 表！ライトモード — 本の紹介へ';
      badge.textContent = '☀ 表 — 本の世界へようこそ';
      badge.classList.add('badge-light');
      revealSection(bookSection);

    } else if (type === 'back') {
      hint.textContent = '☽ 裏！ダークモード — ホラーゲームの世界へ';
      badge.textContent = '☽ 裏 — 闇の世界へようこそ';
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
    // 少し遅らせてからスクロール（セクションが表示されてから）
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