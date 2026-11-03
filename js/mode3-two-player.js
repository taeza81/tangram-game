/**
 * mode3-two-player.js - 3단계: 2인 플레이어 전자칠판 좌우 분할 대결 (멀티터치 동시 지원)
 * 지적장애학생을 위한 칠교 가이드선(내부 분할 점선 및 색상 힌트) 동시 제공
 */

class Mode3TwoPlayer {
  constructor(containerEl, onComplete) {
    this.container = containerEl;
    this.onComplete = onComplete;
    this.engine = null;
    this.layoutMode = 'split-vertical'; // 전자칠판 기본: 좌우 분할 모드
    this.p1Score = 0;
    this.p2Score = 0;
    this.isGameOver = false;

    this.p1Pieces = new Map();
    this.p2Pieces = new Map();

    this.selectedP1Piece = null;
    this.selectedP2Piece = null;
  }

  init() {
    this.container.innerHTML = `
      <div class="split-screen-container ${this.layoutMode}" id="mode3-split-container">
        <!-- Player 1 패널 (좌측 / 파랑 플레이어) -->
        <div class="player-pane player-1" id="p1-pane">
          <div class="player-header">
            <div class="player-tag">
              <span>👤 플레이어 1 (파랑)</span>
            </div>
            <div class="player-progress-badge" id="p1-progress-badge">0 / 7 완성</div>
            <div style="display:flex; gap:6px;">
              <button class="quick-rotate-btn touch-target" id="p1-rot-btn" style="min-width:60px; min-height:42px; padding:2px 8px; font-size:0.85rem;">
                🔄 45°
              </button>
              <button class="quick-rotate-btn touch-target" id="p1-flip-btn" style="min-width:60px; min-height:42px; padding:2px 8px; font-size:0.85rem;">
                🪞 뒤집기
              </button>
            </div>
          </div>
          <div class="player-body">
            <div class="player-split-board">
              <div class="tangram-canvas-container" id="p1-canvas" style="width:230px; height:230px; position:relative;">
                <img src="assets/silhouettes/silhouette-square.svg" alt="P1 실루엣 판" style="position:absolute; width:100%; height:100%; opacity:0.35;">
                <svg class="tangram-guide-overlay" id="p1-guide-overlay" viewBox="0 0 280 280"></svg>
              </div>
            </div>
            <!-- Player 1 7개 독립 슬롯 보관함 -->
            <div class="player-split-dock" id="p1-dock"></div>
          </div>
        </div>

        <!-- 분할 중앙 구분선 및 마주보기 전환 토글 -->
        <div class="split-divider">
          <button id="toggle-layout-btn" class="btn-icon" style="width:40px; height:40px; border-radius:50%; z-index:150;" title="좌우 분할 / 상하 마주보기 전환">
            ⇄
          </button>
        </div>

        <!-- Player 2 패널 (우측 / 노랑 플레이어) -->
        <div class="player-pane player-2" id="p2-pane">
          <div class="player-header">
            <div class="player-tag">
              <span>👤 플레이어 2 (노랑)</span>
            </div>
            <div class="player-progress-badge" id="p2-progress-badge">0 / 7 완성</div>
            <div style="display:flex; gap:6px;">
              <button class="quick-rotate-btn touch-target" id="p2-rot-btn" style="min-width:60px; min-height:42px; padding:2px 8px; font-size:0.85rem;">
                🔄 45°
              </button>
              <button class="quick-rotate-btn touch-target" id="p2-flip-btn" style="min-width:60px; min-height:42px; padding:2px 8px; font-size:0.85rem;">
                🪞 뒤집기
              </button>
            </div>
          </div>
          <div class="player-body">
            <div class="player-split-board">
              <div class="tangram-canvas-container" id="p2-canvas" style="width:230px; height:230px; position:relative;">
                <img src="assets/silhouettes/silhouette-square.svg" alt="P2 실루엣 판" style="position:absolute; width:100%; height:100%; opacity:0.35;">
                <svg class="tangram-guide-overlay" id="p2-guide-overlay" viewBox="0 0 280 280"></svg>
              </div>
            </div>
            <!-- Player 2 7개 독립 슬롯 보관함 -->
            <div class="player-split-dock" id="p2-dock"></div>
          </div>
        </div>
      </div>
    `;

    this.setupLayoutToggle();
    this.setupEngine();
    this.setupControls();
    this.renderGame();
  }

  setupLayoutToggle() {
    const btn = this.container.querySelector('#toggle-layout-btn');
    const container = this.container.querySelector('#mode3-split-container');
    btn.addEventListener('click', () => {
      if (this.layoutMode === 'split-vertical') {
        this.layoutMode = 'split-face-to-face';
        container.className = 'split-screen-container split-face-to-face';
        btn.textContent = '⇅';
      } else {
        this.layoutMode = 'split-vertical';
        container.className = 'split-screen-container split-vertical';
        btn.textContent = '⇄';
      }
      setTimeout(() => this.recalculatePositions(), 200);
    });
  }

  setupControls() {
    // Player 1 조각 회전/뒤집기
    this.container.querySelector('#p1-rot-btn').addEventListener('click', () => {
      if (!this.selectedP1Piece || !this.selectedP1Piece._dragData) return;
      const data = this.selectedP1Piece._dragData;
      data.rot = ((data.rot + 45) % 360 + 360) % 360;
      this.engine.applyTransform(this.selectedP1Piece, data);
      window.soundManager.playRotate();
      this.engine.evaluateSnap(this.selectedP1Piece, data);
    });

    this.container.querySelector('#p1-flip-btn').addEventListener('click', () => {
      if (!this.selectedP1Piece || !this.selectedP1Piece._dragData) return;
      const data = this.selectedP1Piece._dragData;
      data.flip = (data.flip === 1 ? -1 : 1);
      this.engine.applyTransform(this.selectedP1Piece, data);
      window.soundManager.playRotate();
      this.engine.evaluateSnap(this.selectedP1Piece, data);
    });

    // Player 2 조각 회전/뒤집기
    this.container.querySelector('#p2-rot-btn').addEventListener('click', () => {
      if (!this.selectedP2Piece || !this.selectedP2Piece._dragData) return;
      const data = this.selectedP2Piece._dragData;
      data.rot = ((data.rot + 45) % 360 + 360) % 360;
      this.engine.applyTransform(this.selectedP2Piece, data);
      window.soundManager.playRotate();
      this.engine.evaluateSnap(this.selectedP2Piece, data);
    });

    this.container.querySelector('#p2-flip-btn').addEventListener('click', () => {
      if (!this.selectedP2Piece || !this.selectedP2Piece._dragData) return;
      const data = this.selectedP2Piece._dragData;
      data.flip = (data.flip === 1 ? -1 : 1);
      this.engine.applyTransform(this.selectedP2Piece, data);
      window.soundManager.playRotate();
      this.engine.evaluateSnap(this.selectedP2Piece, data);
    });
  }

  setupEngine() {
    this.engine = new DragEngine({
      snapRadius: 30, // 30px 스냅 반경
      angleTolerance: 30,
      onSelect: (el, data) => {
        if (data.player === 1) {
          if (this.selectedP1Piece) this.selectedP1Piece.classList.remove('selected');
          this.selectedP1Piece = el;
          el.classList.add('selected');
        } else {
          if (this.selectedP2Piece) this.selectedP2Piece.classList.remove('selected');
          this.selectedP2Piece = el;
          el.classList.add('selected');
        }
      },
      onDragStart: (el, data) => {
        const map = data.player === 1 ? this.p1Pieces : this.p2Pieces;
        const entry = map.get(data.id);
        if (entry && entry.slotCard) {
          entry.slotCard.classList.add('is-empty');
        }

        // 보드 위 실제 크기로 확대
        const svg = el.querySelector('svg');
        if (svg && entry) {
          svg.style.maxWidth = 'none';
          svg.style.maxHeight = 'none';
          const scale = 0.82;
          svg.setAttribute('width', `${entry.def.boardWidth * scale}px`);
          svg.setAttribute('height', `${entry.def.boardHeight * scale}px`);
        }
      },
      onSnap: (el, data, target) => {
        el.classList.add('snapped');
        if (data.player === 1) {
          this.p1Score++;
          this.updateScoreBadge(1);
          if (this.p1Score === 7 && !this.isGameOver) {
            this.handleWin(1);
          }
        } else {
          this.p2Score++;
          this.updateScoreBadge(2);
          if (this.p2Score === 7 && !this.isGameOver) {
            this.handleWin(2);
          }
        }
      }
    });
  }

  renderGame() {
    this.p1Score = 0;
    this.p2Score = 0;
    this.isGameOver = false;
    this.updateScoreBadge(1);
    this.updateScoreBadge(2);

    const p1Dock = this.container.querySelector('#p1-dock');
    const p2Dock = this.container.querySelector('#p2-dock');
    p1Dock.innerHTML = '';
    p2Dock.innerHTML = '';
    this.p1Pieces.clear();
    this.p2Pieces.clear();

    const puzzle = window.TANGRAM_PUZZLES[0]; // 정사각형 대결
    const pieceIds = Object.keys(window.TANGRAM_PIECES_DEF);

    // 힌트 가이드선 렌더링 (P1, P2 양쪽 모두)
    this.renderGuideOverlay('p1-guide-overlay', puzzle);
    this.renderGuideOverlay('p2-guide-overlay', puzzle);

    // 2인 모드용 콤팩트 슬롯 및 조각 생성
    pieceIds.forEach((id) => {
      const def = window.TANGRAM_PIECES_DEF[id];

      // P1 슬롯 카드 및 조각 생성
      const p1Slot = this.createPlayerSlot(id, def, 1);
      p1Dock.appendChild(p1Slot.slotCard);
      this.p1Pieces.set(id, {
        el: p1Slot.pieceEl,
        slotCard: p1Slot.slotCard,
        def,
        targetSpec: puzzle.targets[id]
      });

      // P2 슬롯 카드 및 조각 생성
      const p2Slot = this.createPlayerSlot(id, def, 2);
      p2Dock.appendChild(p2Slot.slotCard);
      this.p2Pieces.set(id, {
        el: p2Slot.pieceEl,
        slotCard: p2Slot.slotCard,
        def,
        targetSpec: puzzle.targets[id]
      });
    });

    requestAnimationFrame(() => {
      this.recalculatePositions();
    });
  }

  renderGuideOverlay(overlayId, puzzle) {
    const overlaySvg = this.container.querySelector(`#${overlayId}`);
    if (!overlaySvg) return;
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
      polygon.setAttribute('fill-opacity', '0.25');
      polygon.setAttribute('stroke', '#FFFFFF');
      polygon.setAttribute('stroke-width', '2.5');
      polygon.setAttribute('stroke-dasharray', '6 4');

      g.appendChild(polygon);
      overlaySvg.appendChild(g);
    });
  }

  createPlayerSlot(id, def, playerNum) {
    const slotCard = document.createElement('div');
    slotCard.className = 'dock-slot-card-mini';
    slotCard.id = `mode3-p${playerNum}-slot-${id}`;

    const holder = document.createElement('div');
    holder.className = 'dock-slot-holder';

    const pieceEl = document.createElement('div');
    pieceEl.className = `tangram-piece-element touch-target player-piece-p${playerNum}`;
    pieceEl.id = `mode3-p${playerNum}-${id}`;
    pieceEl.setAttribute('role', 'button');
    pieceEl.setAttribute('aria-label', `P${playerNum} ${def.name}`);

    pieceEl.innerHTML = `
      <svg viewBox="${def.viewBox}">
        <polygon points="${def.svgPoints}" fill="${def.color}" stroke="${def.borderColor}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
      </svg>
    `;

    holder.appendChild(pieceEl);

    const label = document.createElement('div');
    label.className = 'dock-slot-label';
    label.textContent = `${def.name}`;

    slotCard.appendChild(holder);
    slotCard.appendChild(label);

    return { slotCard, pieceEl };
  }

  recalculatePositions() {
    const p1Canvas = this.container.querySelector('#p1-canvas');
    const p2Canvas = this.container.querySelector('#p2-canvas');
    if (!p1Canvas || !p2Canvas) return;

    const p1CanvasRect = p1Canvas.getBoundingClientRect();
    const p2CanvasRect = p2Canvas.getBoundingClientRect();
    const p1Scale = p1CanvasRect.width / 280;
    const p2Scale = p2CanvasRect.width / 280;

    // 1. P1 조각 위치 등록
    this.p1Pieces.forEach((entry, id) => {
      const { el, slotCard, targetSpec } = entry;
      const rect = slotCard ? slotCard.getBoundingClientRect() : el.getBoundingClientRect();
      const targetX = p1CanvasRect.left + (targetSpec.x * p1Scale);
      const targetY = p1CanvasRect.top + (targetSpec.y * p1Scale);

      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2 - 8;

      const isAlreadySnapped = el.classList.contains('snapped');
      const curX = isAlreadySnapped ? targetX : (el._dragData ? el._dragData.x : startX);
      const curY = isAlreadySnapped ? targetY : (el._dragData ? el._dragData.y : startY);
      const curRot = el._dragData ? el._dragData.rot : 0;
      const curFlip = el._dragData ? el._dragData.flip : 1;

      const pieceData = {
        id,
        player: 1,
        x: curX,
        y: curY,
        startX,
        startY,
        rot: curRot,
        flip: curFlip,
        isLocked: isAlreadySnapped,
        targets: [{ x: targetX, y: targetY, rot: targetSpec.rot, flip: targetSpec.flip }]
      };

      this.engine.applyTransform(el, pieceData);
      this.engine.registerPiece(el, pieceData);
    });

    // 2. P2 조각 위치 등록
    this.p2Pieces.forEach((entry, id) => {
      const { el, slotCard, targetSpec } = entry;
      const rect = slotCard ? slotCard.getBoundingClientRect() : el.getBoundingClientRect();
      const targetX = p2CanvasRect.left + (targetSpec.x * p2Scale);
      const targetY = p2CanvasRect.top + (targetSpec.y * p2Scale);

      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2 - 8;

      const isAlreadySnapped = el.classList.contains('snapped');
      const curX = isAlreadySnapped ? targetX : (el._dragData ? el._dragData.x : startX);
      const curY = isAlreadySnapped ? targetY : (el._dragData ? el._dragData.y : startY);
      const curRot = el._dragData ? el._dragData.rot : 0;
      const curFlip = el._dragData ? el._dragData.flip : 1;

      const pieceData = {
        id,
        player: 2,
        x: curX,
        y: curY,
        startX,
        startY,
        rot: curRot,
        flip: curFlip,
        isLocked: isAlreadySnapped,
        targets: [{ x: targetX, y: targetY, rot: targetSpec.rot, flip: targetSpec.flip }]
      };

      this.engine.applyTransform(el, pieceData);
      this.engine.registerPiece(el, pieceData);
    });

    if (!this.selectedP1Piece && this.p1Pieces.has('large-tri-1')) {
      this.selectedP1Piece = this.p1Pieces.get('large-tri-1').el;
      this.selectedP1Piece.classList.add('selected');
    }
    if (!this.selectedP2Piece && this.p2Pieces.has('large-tri-1')) {
      this.selectedP2Piece = this.p2Pieces.get('large-tri-1').el;
      this.selectedP2Piece.classList.add('selected');
    }
  }

  updateScoreBadge(playerNum) {
    const badge = this.container.querySelector(`#p${playerNum}-progress-badge`);
    const score = playerNum === 1 ? this.p1Score : this.p2Score;
    if (badge) {
      badge.textContent = `${score} / 7 완성`;
    }
  }

  handleWin(winnerNum) {
    this.isGameOver = true;
    const winnerName = winnerNum === 1 ? '플레이어 1 (파랑)' : '플레이어 2 (노랑)';
    if (this.onComplete) {
      this.onComplete(`🏆 ${winnerName} 승리! 전자칠판 칠교 대결에서 먼저 완성했습니다!`);
    }
  }

  destroy() {
    this.p1Pieces.forEach(e => e.el.remove());
    this.p2Pieces.forEach(e => e.el.remove());
    this.p1Pieces.clear();
    this.p2Pieces.clear();
  }
}

window.Mode3TwoPlayer = Mode3TwoPlayer;
