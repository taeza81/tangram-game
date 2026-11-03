/**
 * mode2-tangram.js - 2단계: 칠교놀이의 왕(Tangram King) 스타일 고도화 엔진
 * 테마 카테고리, 별점 시스템, 지적장애학생 지원 3단계 힌트, 원터치 탭 회전 지원
 */

class Mode2Tangram {
  constructor(containerEl, onComplete) {
    this.container = containerEl;
    this.onComplete = onComplete;
    this.engine = null;
    this.currentPuzzleIndex = 0;
    this.selectedPieceEl = null;
    this.showGuidelines = true; // 지적장애학생을 위해 기본 가이드선 켜짐
    this.snappedCount = 0;
    this.piecesMap = new Map();
    this.activeCategory = '전체';

    // 타이머 및 별점
    this.startTime = 0;
    this.timerInterval = null;
    this.elapsedSeconds = 0;
    this.hintUsedCount = 0;
  }

  init() {
    this.container.innerHTML = `
      <div class="board-layout">
        <!-- 칠교 타깃 보드 패널 -->
        <div class="game-board-panel" id="mode2-board-panel">
          <div class="dock-header">
            <div class="dock-title">
              <span id="puzzle-title-text" style="color:var(--primary-color);">정사각형 완성하기</span>
              <span id="timer-display" style="font-size:0.95rem; font-weight:700; color:var(--text-muted); margin-left:8px;">⏱️ 00:00</span>
            </div>

            <!-- 상단 액션 바: 지적장애학생 지원 힌트 & 진행도 -->
            <div style="display:flex; gap:8px; align-items:center;">
              <button class="quick-rotate-btn btn-hint-active" id="mode2-hint-toggle" title="가이드선 켜기/끄기" aria-label="가이드선 힌트 토글">
                💡 가이드선 켜짐
              </button>
              <button class="quick-rotate-btn" id="mode2-auto-hint-btn" title="조각 1개 자동 맞추기 힌트" style="background:#FEF3C7; border-color:#F59E0B; color:#B45309;">
                ✨ 조각 1개 힌트
              </button>
              <div id="mode2-progress" class="player-progress-badge">0 / 7 완성</div>
            </div>
          </div>

          <!-- 카테고리 필터 & 스테이지 선택기 -->
          <div style="width:100%; display:flex; flex-direction:column; gap:6px;">
            <div class="category-tabs" id="mode2-category-tabs">
              <button class="category-tab active" data-cat="전체">전체보기</button>
              <button class="category-tab" data-cat="기하도형">기하도형</button>
              <button class="category-tab" data-cat="동물">동물친구</button>
              <button class="category-tab" data-cat="사물">사물·탈것</button>
            </div>
            <div class="puzzle-selector" id="mode2-puzzle-selector" role="tablist"></div>
          </div>

          <!-- 실루엣 캔버스 영역 (280x280) -->
          <div class="tangram-board-area">
            <div class="tangram-canvas-container" id="mode2-canvas">
              <img id="mode2-silhouette-img" src="" alt="실루엣 배경" style="position:absolute; width:100%; height:100%; top:0; left:0; opacity:0.35;">
              
              <!-- 지적장애학생 지원 가이드선 오버레이 SVG -->
              <svg class="tangram-guide-overlay" id="mode2-guide-overlay" viewBox="0 0 280 280"></svg>
            </div>

            <!-- 선택된 조각 플로팅 컨트롤러 -->
            <div class="piece-controls-overlay" id="mode2-floating-controls">
              <button class="control-btn" id="ctrl-rot-ccw" title="반시계 45도 회전" aria-label="반시계 회전">
                <img src="assets/ui/rotate-ccw.svg" alt="-45도">
              </button>
              <button class="control-btn" id="ctrl-rot-cw" title="시계 45도 회전" aria-label="시계 회전">
                <img src="assets/ui/rotate-cw.svg" alt="+45도">
              </button>
              <button class="control-btn" id="ctrl-flip" title="좌우 뒤집기" aria-label="뒤집기">
                <img src="assets/ui/flip.svg" alt="뒤집기">
              </button>
            </div>
          </div>

          <!-- 하단 상시 터치 퀵 회전 툴바 -->
          <div class="quick-rotate-bar">
            <span style="font-size:0.85rem; font-weight:800; color:var(--text-muted);">
              👆 조각을 가볍게 탭해도 45° 회전!
            </span>
            <button class="quick-rotate-btn touch-target" id="quick-ccw-btn">
              <img src="assets/ui/rotate-ccw.svg" alt="" style="width:18px; height:18px;"> -45°
            </button>
            <button class="quick-rotate-btn touch-target" id="quick-cw-btn">
              <img src="assets/ui/rotate-cw.svg" alt="" style="width:18px; height:18px;"> +45°
            </button>
            <button class="quick-rotate-btn touch-target" id="quick-flip-btn">
              <img src="assets/ui/flip.svg" alt="" style="width:18px; height:18px;"> 뒤집기
            </button>
          </div>
        </div>

        <!-- 칠교 조각 보관함 도크 패널 (2열 균형 슬롯 그리드) -->
        <div class="pieces-dock-panel" id="mode2-dock-panel">
          <div class="dock-header">
            <h3 class="dock-title">🧩 칠교 7조각 보관함</h3>
            <button class="btn-secondary" id="mode2-reset-btn" style="min-width: 90px; min-height: 44px; padding: 6px 14px;">
              다시 배치
            </button>
          </div>
          <div class="dock-pieces-tray" id="mode2-pieces-tray"></div>
        </div>
      </div>
    `;

    this.setupCategories();
    this.setupEngine();
    this.setupControls();
    this.loadPuzzle(0);
  }

  setupCategories() {
    const catTabs = this.container.querySelectorAll('.category-tab');
    catTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        catTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeCategory = tab.dataset.cat;
        this.renderPuzzleButtons();
      });
    });
    this.renderPuzzleButtons();
  }

  renderPuzzleButtons() {
    const selectorEl = this.container.querySelector('#mode2-puzzle-selector');
    selectorEl.innerHTML = '';

    window.TANGRAM_PUZZLES.forEach((puzzle, idx) => {
      if (this.activeCategory !== '전체' && puzzle.category !== this.activeCategory) {
        return;
      }

      const btn = document.createElement('button');
      btn.className = `puzzle-btn ${idx === this.currentPuzzleIndex ? 'active' : ''}`;
      btn.innerHTML = `<span>${puzzle.name}</span>`;
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.puzzle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPuzzle(idx);
      });
      selectorEl.appendChild(btn);
    });
  }

  setupControls() {
    // 1. 전체 가이드선 힌트 토글 (지적장애학생 지원)
    const hintBtn = this.container.querySelector('#mode2-hint-toggle');
    hintBtn.addEventListener('click', () => {
      this.showGuidelines = !this.showGuidelines;
      const overlay = this.container.querySelector('#mode2-guide-overlay');
      if (this.showGuidelines) {
        overlay.classList.remove('hidden');
        hintBtn.classList.add('btn-hint-active');
        hintBtn.textContent = '💡 가이드선 켜짐';
        window.soundManager.playHint();
      } else {
        overlay.classList.add('hidden');
        hintBtn.classList.remove('btn-hint-active');
        hintBtn.textContent = '💡 가이드선 꺼짐';
      }
    });

    // 2. 조각 1개 자동 힌트 맞추기 (칠교놀이의 왕 핵심 힌트)
    const autoHintBtn = this.container.querySelector('#mode2-auto-hint-btn');
    autoHintBtn.addEventListener('click', () => {
      this.useOnePieceHint();
    });

    // 다시 배치
    const resetBtn = this.container.querySelector('#mode2-reset-btn');
    resetBtn.addEventListener('click', () => {
      this.loadPuzzle(this.currentPuzzleIndex);
    });

    // 회전 컨트롤
    const rotatePiece = (deltaDeg) => {
      if (!this.selectedPieceEl || !this.selectedPieceEl._dragData) return;
      const data = this.selectedPieceEl._dragData;
      data.rot = ((data.rot + deltaDeg) % 360 + 360) % 360;
      this.engine.applyTransform(this.selectedPieceEl, data);
      this.updateFloatingControlsPosition(this.selectedPieceEl);
      window.soundManager.playRotate();
      this.engine.evaluateSnap(this.selectedPieceEl, data);
    };

    const flipPiece = () => {
      if (!this.selectedPieceEl || !this.selectedPieceEl._dragData) return;
      const data = this.selectedPieceEl._dragData;
      data.flip = (data.flip === 1 ? -1 : 1);
      this.engine.applyTransform(this.selectedPieceEl, data);
      this.updateFloatingControlsPosition(this.selectedPieceEl);
      window.soundManager.playRotate();
      this.engine.evaluateSnap(this.selectedPieceEl, data);
    };

    this.container.querySelector('#ctrl-rot-cw').addEventListener('click', () => rotatePiece(45));
    this.container.querySelector('#ctrl-rot-ccw').addEventListener('click', () => rotatePiece(-45));
    this.container.querySelector('#ctrl-flip').addEventListener('click', () => flipPiece());

    this.container.querySelector('#quick-cw-btn').addEventListener('click', () => rotatePiece(45));
    this.container.querySelector('#quick-ccw-btn').addEventListener('click', () => rotatePiece(-45));
    this.container.querySelector('#quick-flip-btn').addEventListener('click', () => flipPiece());
  }

  setupEngine() {
    this.engine = new DragEngine({
      snapRadius: 32, // 30px급 정밀 스냅
      angleTolerance: 28,
      onSelect: (el, data) => {
        this.selectPiece(el);
      },
      onDragStart: (el, data) => {
        this.hideFloatingControls();
        el.classList.add('is-dragging');
        el.classList.remove('on-board');

        const entry = this.piecesMap.get(data.id);
        if (entry && entry.slotCard) {
          entry.slotCard.classList.add('is-empty');
        }

        // 보드 위 실제 퍼즐 크기(1:1 viewBox)로 SVG 스케일 전환
        const svg = el.querySelector('svg');
        if (svg && entry) {
          svg.style.maxWidth = 'none';
          svg.style.maxHeight = 'none';
          svg.setAttribute('width', `${entry.def.boardWidth}px`);
          svg.setAttribute('height', `${entry.def.boardHeight}px`);
        }
      },
      onDragEnd: (el, data, didSnap) => {
        el.classList.remove('is-dragging');
        if (!didSnap) {
          el.classList.add('on-board');
          this.showFloatingControls(el);
        } else {
          el.classList.add('snapped');
          this.hideFloatingControls();
        }
      },
      onPieceTap: (el, data) => {
        this.updateFloatingControlsPosition(el);
      },
      onSnap: (el, data, target) => {
        el.classList.add('snapped');
        this.checkStageCompletion();
      }
    });
  }

  // 조각 1개 자동 힌트 (아직 안 맞춘 조각 중 1개를 자동으로 보드 자리에 스냅!)
  useOnePieceHint() {
    const puzzle = window.TANGRAM_PUZZLES[this.currentPuzzleIndex];
    const canvasEl = this.container.querySelector('#mode2-canvas');
    if (!canvasEl) return;
    const canvasRect = canvasEl.getBoundingClientRect();
    const scale = canvasRect.width / 280;

    for (const [id, entry] of this.piecesMap.entries()) {
      if (!entry.el.classList.contains('snapped')) {
        const targetSpec = puzzle.targets[id];
        const targetX = canvasRect.left + (targetSpec.x * scale);
        const targetY = canvasRect.top + (targetSpec.y * scale);

        entry.slotCard.classList.add('is-empty');
        entry.el.classList.remove('on-board');
        entry.el.classList.add('snapped');

        // SVG 크기 확대
        const svg = entry.el.querySelector('svg');
        if (svg) {
          svg.style.maxWidth = 'none';
          svg.style.maxHeight = 'none';
          svg.setAttribute('width', `${entry.def.boardWidth}px`);
          svg.setAttribute('height', `${entry.def.boardHeight}px`);
        }

        const data = entry.el._dragData;
        data.x = targetX;
        data.y = targetY;
        data.rot = targetSpec.rot;
        data.flip = targetSpec.flip;
        data.isLocked = true;

        this.engine.applyTransform(entry.el, data);
        this.engine.triggerSnapEffect(entry.el);
        window.soundManager.playHint();
        this.checkStageCompletion();
        break;
      }
    }
  }

  selectPiece(el) {
    if (this.selectedPieceEl) {
      this.selectedPieceEl.classList.remove('selected');
    }
    this.selectedPieceEl = el;
    el.classList.add('selected');
    this.showFloatingControls(el);
  }

  showFloatingControls(el) {
    const controls = this.container.querySelector('#mode2-floating-controls');
    if (!controls) return;
    this.updateFloatingControlsPosition(el);
    controls.classList.add('active');
  }

  updateFloatingControlsPosition(el) {
    const controls = this.container.querySelector('#mode2-floating-controls');
    const boardPanel = this.container.querySelector('#mode2-board-panel');
    if (!controls || !boardPanel) return;

    const boardRect = boardPanel.getBoundingClientRect();
    const pieceRect = el.getBoundingClientRect();

    const left = (pieceRect.left + pieceRect.width / 2) - boardRect.left;
    const top = pieceRect.top - boardRect.top;

    controls.style.left = `${left}px`;
    controls.style.top = `${top}px`;
  }

  hideFloatingControls() {
    const controls = this.container.querySelector('#mode2-floating-controls');
    if (controls) controls.classList.remove('active');
  }

  loadPuzzle(index) {
    this.currentPuzzleIndex = index;
    const puzzle = window.TANGRAM_PUZZLES[index];
    this.container.querySelector('#puzzle-title-text').textContent = puzzle.name;

    const silImg = this.container.querySelector('#mode2-silhouette-img');
    silImg.src = puzzle.silhouettePath;

    this.renderGuideOverlay(puzzle);
    this.hideFloatingControls();
    this.selectedPieceEl = null;
    this.snappedCount = 0;
    this.renderPieces(puzzle);
    this.updateProgress();

    // 타이머 시작
    this.startTimer();
  }

  startTimer() {
    clearInterval(this.timerInterval);
    this.elapsedSeconds = 0;
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.updateTimerDisplay();
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  updateTimerDisplay() {
    const timerEl = this.container.querySelector('#timer-display');
    if (timerEl) {
      const mins = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
      const secs = String(this.elapsedSeconds % 60).padStart(2, '0');
      timerEl.textContent = `⏱️ ${mins}:${secs}`;
    }
  }

  renderGuideOverlay(puzzle) {
    const overlaySvg = this.container.querySelector('#mode2-guide-overlay');
    overlaySvg.innerHTML = '';

    Object.keys(puzzle.targets).forEach((id) => {
      const def = window.TANGRAM_PIECES_DEF[id];
      const target = puzzle.targets[id];

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${target.x}, ${target.y}) rotate(${target.rot}) scale(${target.flip}, 1)`);

      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', def.svgPoints);
      polygon.setAttribute('transform', `translate(${-def.boardWidth / 2}, ${-def.boardHeight / 2})`);
      polygon.setAttribute('class', 'guide-piece-path');
      polygon.setAttribute('fill', def.color);
      polygon.setAttribute('fill-opacity', '0.28');
      polygon.setAttribute('stroke', '#FFFFFF');
      polygon.setAttribute('stroke-width', '2.5');
      polygon.setAttribute('stroke-dasharray', '6 4');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '0');
      text.setAttribute('y', '0');
      text.setAttribute('class', 'guide-piece-label');
      text.textContent = def.name.split(' ')[0];

      g.appendChild(polygon);
      g.appendChild(text);
      overlaySvg.appendChild(g);
    });
  }

  renderPieces(puzzle) {
    const trayEl = this.container.querySelector('#mode2-pieces-tray');
    trayEl.innerHTML = '';
    this.piecesMap.clear();

    const pieceIds = Object.keys(window.TANGRAM_PIECES_DEF);

    // 2열 그리드로 정돈된 7개 슬롯 생성
    pieceIds.forEach((id) => {
      const def = window.TANGRAM_PIECES_DEF[id];
      const targetSpec = puzzle.targets[id];

      const slotCard = document.createElement('div');
      slotCard.className = 'dock-slot-card';
      slotCard.id = `dock-slot-${id}`;

      const holder = document.createElement('div');
      holder.className = 'dock-slot-holder';

      const pieceEl = document.createElement('div');
      pieceEl.className = 'tangram-piece-element touch-target';
      pieceEl.id = `mode2-piece-${id}`;
      pieceEl.setAttribute('role', 'button');
      pieceEl.setAttribute('aria-label', `${def.name} (${def.colorName})`);

      pieceEl.innerHTML = `
        <svg viewBox="${def.viewBox}">
          <polygon points="${def.svgPoints}" fill="${def.color}" stroke="${def.borderColor}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>
      `;

      holder.appendChild(pieceEl);

      const label = document.createElement('div');
      label.className = 'dock-slot-label';
      label.textContent = `${def.name} (${def.colorName})`;

      slotCard.appendChild(holder);
      slotCard.appendChild(label);
      trayEl.appendChild(slotCard);

      this.piecesMap.set(id, {
        el: pieceEl,
        slotCard,
        holder,
        def,
        targetSpec
      });
    });

    requestAnimationFrame(() => {
      this.recalculatePositions();
    });
  }

  recalculatePositions() {
    const canvasEl = this.container.querySelector('#mode2-canvas');
    if (!canvasEl) return;

    const canvasRect = canvasEl.getBoundingClientRect();
    const scale = canvasRect.width / 280;

    this.piecesMap.forEach((entry, id) => {
      const { el, slotCard, targetSpec } = entry;
      if (!el || !slotCard) return;

      const rect = slotCard.getBoundingClientRect();
      const targetX = canvasRect.left + (targetSpec.x * scale);
      const targetY = canvasRect.top + (targetSpec.y * scale);

      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2 - 12;

      const isAlreadySnapped = el.classList.contains('snapped');
      const curX = isAlreadySnapped ? targetX : (el._dragData ? el._dragData.x : startX);
      const curY = isAlreadySnapped ? targetY : (el._dragData ? el._dragData.y : startY);
      const curRot = el._dragData ? el._dragData.rot : 0;
      const curFlip = el._dragData ? el._dragData.flip : 1;

      const pieceData = {
        id,
        x: curX,
        y: curY,
        startX,
        startY,
        rot: curRot,
        flip: curFlip,
        isLocked: isAlreadySnapped,
        targets: [
          {
            x: targetX,
            y: targetY,
            rot: targetSpec.rot,
            flip: targetSpec.flip
          }
        ]
      };

      this.engine.applyTransform(el, pieceData);
      this.engine.registerPiece(el, pieceData);
    });
  }

  checkStageCompletion() {
    let completed = 0;
    this.piecesMap.forEach((entry) => {
      if (entry.el.classList.contains('snapped')) {
        completed++;
      }
    });

    this.snappedCount = completed;
    this.updateProgress();

    if (completed === 7) {
      this.stopTimer();

      // 별점 계산 (시간 및 힌트 사용량 기반: 45초 이내 3개, 90초 이내 2개, 그 외 1개)
      let stars = 3;
      if (this.elapsedSeconds > 90) stars = 1;
      else if (this.elapsedSeconds > 45) stars = 2;

      const starIcons = '⭐'.repeat(stars);

      setTimeout(() => {
        if (this.onComplete) {
          const mins = Math.floor(this.elapsedSeconds / 60);
          const secs = this.elapsedSeconds % 60;
          const timeStr = `${mins > 0 ? mins + '분 ' : ''}${secs}초`;
          this.onComplete(
            `🎉 대단해요! [${window.TANGRAM_PUZZLES[this.currentPuzzleIndex].name}] 퍼즐을 완성했습니다!\n\n평가: ${starIcons} (소요 시간: ${timeStr})`
          );
        }
      }, 500);
    }
  }

  updateProgress() {
    const progressEl = this.container.querySelector('#mode2-progress');
    if (progressEl) {
      progressEl.textContent = `${this.snappedCount} / 7 완성`;
    }
  }

  destroy() {
    this.stopTimer();
    this.piecesMap.forEach((entry) => {
      entry.el.remove();
    });
    this.piecesMap.clear();
  }
}

window.Mode2Tangram = Mode2Tangram;
