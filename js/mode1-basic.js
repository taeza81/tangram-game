/**
 * mode1-basic.js - 1단계: 기본 도형(동그라미, 세모, 네모) 짝 맞추기
 */

class Mode1BasicShapes {
  constructor(containerEl, onComplete) {
    this.container = containerEl;
    this.onComplete = onComplete;
    this.engine = null;
    this.pieces = [];
    this.slots = [];
    this.completedCount = 0;
  }

  init() {
    this.container.innerHTML = `
      <div class="board-layout mode-1-container">
        <!-- 상단: 타깃 실루엣 슬롯 영역 -->
        <div class="game-board-panel">
          <div class="dock-header">
            <h2 class="dock-title">
              <span>🎯 알맞은 모양의 틀에 조각을 넣어보세요!</span>
            </h2>
            <div id="mode1-progress" class="player-progress-badge">0 / 3 완성</div>
          </div>
          <div class="stage1-target-area" id="mode1-target-area">
            <!-- 실루엣 슬롯 동적 생성 -->
          </div>
        </div>

        <!-- 하단: 드래그할 도형 조각 도크 영역 -->
        <div class="pieces-dock-panel" style="min-height: 180px; flex: 0.8;">
          <div class="dock-header">
            <h3 class="dock-title">📦 도형 조각 보관함</h3>
            <button class="btn-secondary" id="mode1-reset-btn" style="min-width: 90px; min-height: 44px; padding: 6px 14px;">
              다시 하기
            </button>
          </div>
          <div class="dock-pieces-tray" id="mode1-pieces-tray">
            <!-- 도형 조각들 동적 생성 -->
          </div>
        </div>
      </div>
    `;

    this.setupEngine();
    this.render();

    const resetBtn = this.container.querySelector('#mode1-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }
  }

  setupEngine() {
    this.engine = new DragEngine({
      snapRadius: 30, // 30px 스냅 반경
      onSnap: (el, data, target) => {
        el.classList.add('snapped');
        const slotEl = document.getElementById(`slot-${data.id}`);
        if (slotEl) {
          slotEl.classList.add('is-filled');
        }
        data.isLocked = true; // 스냅 완료 시 고정
        this.completedCount++;
        this.updateProgress();

        if (this.completedCount === window.BASIC_SHAPES_DATA.length) {
          setTimeout(() => {
            if (this.onComplete) this.onComplete('1단계 기본 도형 짝 맞추기 완성!');
          }, 400);
        }
      }
    });
  }

  render() {
    const targetArea = this.container.querySelector('#mode1-target-area');
    const piecesTray = this.container.querySelector('#mode1-pieces-tray');
    targetArea.innerHTML = '';
    piecesTray.innerHTML = '';
    this.completedCount = 0;
    this.updateProgress();

    // 1. 슬롯 생성 (실루엣 틀)
    window.BASIC_SHAPES_DATA.forEach((shape) => {
      const slot = document.createElement('div');
      slot.className = 'shape-target-slot';
      slot.id = `slot-${shape.id}`;
      slot.setAttribute('aria-label', `${shape.name} 목표 자리`);

      const img = document.createElement('img');
      img.src = shape.slotAsset;
      img.alt = `${shape.name} 실루엣`;
      slot.appendChild(img);
      targetArea.appendChild(slot);
    });

    // 2. 조각 슬롯 카드 생성 및 도크 배치
    const shuffled = [...window.BASIC_SHAPES_DATA].sort(() => Math.random() - 0.5);

    shuffled.forEach((shape) => {
      const slotCard = document.createElement('div');
      slotCard.className = 'dock-slot-card';
      slotCard.style.maxWidth = '150px';
      slotCard.style.height = '130px';

      const holder = document.createElement('div');
      holder.className = 'dock-slot-holder';

      const wrapper = document.createElement('div');
      wrapper.className = 'shape-piece-wrapper';
      wrapper.id = `piece-${shape.id}`;
      wrapper.setAttribute('role', 'button');
      wrapper.setAttribute('aria-label', `${shape.name} 조각`);
      wrapper.style.width = '85px';
      wrapper.style.height = '85px';

      const img = document.createElement('img');
      img.src = shape.asset;
      img.alt = shape.name;
      img.style.width = '80px';
      img.style.height = '80px';
      wrapper.appendChild(img);
      holder.appendChild(wrapper);

      const label = document.createElement('div');
      label.className = 'dock-slot-label';
      label.textContent = `${shape.name}`;

      slotCard.appendChild(holder);
      slotCard.appendChild(label);
      piecesTray.appendChild(slotCard);
    });

    // 레이아웃 배치 후 타깃 좌표 계산 및 엔진 등록
    requestAnimationFrame(() => {
      this.bindPieceCoordinates();
    });
  }

  bindPieceCoordinates() {
    // 모든 엘리먼트의 초기 화면 위치(BoundingRect)를 먼저 수집
    const coordsMap = [];
    window.BASIC_SHAPES_DATA.forEach((shape) => {
      const slotEl = document.getElementById(`slot-${shape.id}`);
      const pieceEl = document.getElementById(`piece-${shape.id}`);
      if (!slotEl || !pieceEl) return;

      const slotRect = slotEl.getBoundingClientRect();
      const pieceRect = pieceEl.getBoundingClientRect();

      coordsMap.push({
        shape,
        slotEl,
        pieceEl,
        slotRect,
        pieceRect
      });
    });

    // 수집된 좌표를 바탕으로 fixed 포지셔닝 및 드래그 엔진 등록
    coordsMap.forEach(({ shape, slotRect, pieceRect, pieceEl }) => {
      const startX = pieceRect.left + pieceRect.width / 2;
      const startY = pieceRect.top + pieceRect.height / 2;

      const pieceData = {
        id: shape.id,
        x: startX,
        y: startY,
        startX,
        startY,
        rot: 0,
        flip: 1,
        isLocked: false,
        targets: [
          {
            x: slotRect.left + slotRect.width / 2,
            y: slotRect.top + slotRect.height / 2
          }
        ]
      };

      pieceEl.style.position = 'fixed';
      pieceEl.style.zIndex = '30';
      this.engine.applyTransform(pieceEl, pieceData);
      this.engine.registerPiece(pieceEl, pieceData);
    });
  }

  updateProgress() {
    const progressEl = this.container.querySelector('#mode1-progress');
    if (progressEl) {
      progressEl.textContent = `${this.completedCount} / ${window.BASIC_SHAPES_DATA.length} 완성`;
    }
  }

  reset() {
    this.render();
  }

  destroy() {
    // 모드 전환 시 엘리먼트 정리
    window.BASIC_SHAPES_DATA.forEach((shape) => {
      const piece = document.getElementById(`piece-${shape.id}`);
      if (piece) piece.remove();
    });
  }
}

window.Mode1BasicShapes = Mode1BasicShapes;
