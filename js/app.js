/**
 * app.js - 애플리케이션 진입점 및 컨트롤러
 */

// 화려한 컨페티 폭죽 파티클 엔진
class ConfettiSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.colors = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#9D4EDD', '#FF922B', '#20C997'];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire() {
    this.particles = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: this.canvas.height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18 - 4,
        size: Math.random() * 9 + 6,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animate();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let activeCount = 0;
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // 중력
      p.rotation += p.rotSpeed;
      p.opacity -= 0.009;

      if (p.opacity > 0) {
        activeCount++;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        this.ctx.restore();
      }
    });

    if (activeCount > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

class App {
  constructor() {
    this.activeMode = 1;
    this.modeInstances = {};
    this.confetti = null;
  }

  init() {
    // 캔버스 초기화
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
      this.confetti = new ConfettiSystem(canvas);
    }

    // 모드 탭 바인딩
    const tabs = document.querySelectorAll('.mode-tab-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const mode = parseInt(tab.dataset.mode, 10);
        this.switchMode(mode);
      });
    });

    // 헤더 컨트롤 바인딩 (사운드, 고대비, 큰글씨)
    this.setupHeaderControls();

    // 완료 모달 컨트롤
    this.setupModalControls();

    // 기본 1단계 모드 실행
    this.switchMode(1);

    // 윈도우 리사이즈 대응
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const current = this.modeInstances[this.activeMode];
        if (current) {
          if (typeof current.bindPieceCoordinates === 'function') current.bindPieceCoordinates();
          if (typeof current.recalculatePositions === 'function') current.recalculatePositions();
        }
      }, 250);
    });
  }

  setupHeaderControls() {
    // 사운드 토글
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isMuted = window.soundManager.toggleMute();
        soundBtn.innerHTML = isMuted
          ? '<img src="assets/ui/sound-off.svg" alt="음소거">'
          : '<img src="assets/ui/sound-on.svg" alt="소리 켬">';
      });
    }

    // 고대비 모드 토글
    const contrastBtn = document.getElementById('btn-contrast-toggle');
    if (contrastBtn) {
      contrastBtn.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
        const isActive = document.body.classList.contains('high-contrast');
        contrastBtn.style.borderColor = isActive ? '#FFFF00' : '';
      });
    }

    // 큰 글자 모드 토글
    const fontBtn = document.getElementById('btn-font-toggle');
    if (fontBtn) {
      fontBtn.addEventListener('click', () => {
        document.body.classList.toggle('large-text');
        const isActive = document.body.classList.contains('large-text');
        fontBtn.style.borderColor = isActive ? '#4F46E5' : '';
      });
    }
  }

  setupModalControls() {
    const modal = document.getElementById('celebration-modal');
    const retryBtn = document.getElementById('modal-retry-btn');
    const nextBtn = document.getElementById('modal-next-btn');

    retryBtn.addEventListener('click', () => {
      modal.classList.remove('visible');
      const current = this.modeInstances[this.activeMode];
      if (current && typeof current.reset === 'function') {
        current.reset();
      } else if (current && typeof current.loadPuzzle === 'function') {
        current.loadPuzzle(current.currentPuzzleIndex);
      } else if (current && typeof current.renderGame === 'function') {
        current.renderGame();
      }
    });

    nextBtn.addEventListener('click', () => {
      modal.classList.remove('visible');
      const nextMode = this.activeMode >= 3 ? 1 : this.activeMode + 1;
      this.switchMode(nextMode);
    });
  }

  switchMode(modeNumber) {
    // 이전 모드 정리
    if (this.modeInstances[this.activeMode] && typeof this.modeInstances[this.activeMode].destroy === 'function') {
      this.modeInstances[this.activeMode].destroy();
    }

    this.activeMode = modeNumber;

    // 탭 UI 갱신
    document.querySelectorAll('.mode-tab-btn').forEach((tab) => {
      const mode = parseInt(tab.dataset.mode, 10);
      tab.classList.toggle('active', mode === modeNumber);
      tab.setAttribute('aria-selected', mode === modeNumber ? 'true' : 'false');
    });

    // 컨테이너 표시/숨김
    document.querySelectorAll('.game-mode-container').forEach((cont) => {
      cont.classList.remove('active');
    });

    const activeContainer = document.getElementById(`mode-${modeNumber}-container`);
    if (activeContainer) {
      activeContainer.classList.add('active');
    }

    // 모드 인스턴스 초기화
    const handleComplete = (message) => {
      this.showCelebration(message);
    };

    if (modeNumber === 1) {
      this.modeInstances[1] = new window.Mode1BasicShapes(activeContainer, handleComplete);
      this.modeInstances[1].init();
    } else if (modeNumber === 2) {
      this.modeInstances[2] = new window.Mode2Tangram(activeContainer, handleComplete);
      this.modeInstances[2].init();
    } else if (modeNumber === 3) {
      this.modeInstances[3] = new window.Mode3TwoPlayer(activeContainer, handleComplete);
      this.modeInstances[3].init();
    }
  }

  showCelebration(message) {
    window.soundManager.playSuccess();
    if (this.confetti) {
      this.confetti.fire();
    }

    const modal = document.getElementById('celebration-modal');
    const msgEl = document.getElementById('modal-message');
    if (msgEl) {
      msgEl.style.whiteSpace = 'pre-line';
      msgEl.textContent = message;
    }
    modal.classList.add('visible');
  }
}

// DOM 준비 후 시작
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
