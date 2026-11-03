/**
 * drag-engine.js - 고성능 멀티터치 드래그 & 원터치 탭 회전 엔진
 * '칠교놀이의 왕' 스타일의 원터치 탭 45도 회전 및 정밀 자석 스냅 지원
 */

class DragEngine {
  constructor(options = {}) {
    this.snapRadius = options.snapRadius || 30; // 자석 스냅 반경 30px
    this.angleTolerance = options.angleTolerance || 28; // 각도 허용 오차
    this.onSnap = options.onSnap || (() => {});
    this.onSelect = options.onSelect || (() => {});
    this.onDragStart = options.onDragStart || (() => {});
    this.onDragEnd = options.onDragEnd || (() => {});
    this.onPieceTap = options.onPieceTap || (() => {});

    this.activePointers = new Map();
  }

  registerPiece(el, pieceData) {
    el._dragData = pieceData;

    el.addEventListener('pointerdown', (e) => this.handlePointerDown(e, el));
    el.addEventListener('pointermove', (e) => this.handlePointerMove(e, el));
    el.addEventListener('pointerup', (e) => this.handlePointerUp(e, el));
    el.addEventListener('pointercancel', (e) => this.handlePointerCancel(e, el));

    // 키보드 접근성
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', (e) => this.handleKeyDown(e, el));
  }

  handlePointerDown(e, el) {
    if (e.button && e.button !== 0) return;

    try {
      el.setPointerCapture(e.pointerId);
    } catch (err) {}

    const data = el._dragData;
    if (data.isLocked) return;

    // 슬롯에서 처음 드래그 시 실제 화면 위치로 좌표 승격
    if (!el.classList.contains('on-board') && !el.classList.contains('snapped')) {
      const rect = el.getBoundingClientRect();
      data.x = rect.left + rect.width / 2;
      data.y = rect.top + rect.height / 2;
    }

    const isInInvertedZone = !!el.closest('.split-face-to-face .player-2');

    this.activePointers.set(e.pointerId, {
      el,
      startX: e.clientX,
      startY: e.clientY,
      lastClientX: e.clientX,
      lastClientY: e.clientY,
      startTime: Date.now(),
      isInInvertedZone,
      hasMoved: false
    });

    this.onSelect(el, data);

    e.preventDefault();
    e.stopPropagation();
  }

  handlePointerMove(e, el) {
    const session = this.activePointers.get(e.pointerId);
    if (!session || session.el !== el) return;

    let deltaX = e.clientX - session.lastClientX;
    let deltaY = e.clientY - session.lastClientY;

    if (session.isInInvertedZone) {
      deltaX = -deltaX;
      deltaY = -deltaY;
    }

    const totalDist = Math.hypot(e.clientX - session.startX, e.clientY - session.startY);
    if (totalDist > 6) {
      if (!session.hasMoved) {
        session.hasMoved = true;
        el.classList.add('is-dragging');
        window.soundManager.playPick();
        this.onDragStart(el, el._dragData);
      }
    }

    session.lastClientX = e.clientX;
    session.lastClientY = e.clientY;

    if (session.hasMoved) {
      const data = el._dragData;
      data.x += deltaX;
      data.y += deltaY;

      this.applyTransform(el, data);
      this.checkSnapPreview(el, data);
    }

    e.preventDefault();
    e.stopPropagation();
  }

  handlePointerUp(e, el) {
    const session = this.activePointers.get(e.pointerId);
    if (!session) return;

    try {
      el.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const duration = Date.now() - session.startTime;
    const data = el._dragData;
    this.activePointers.delete(e.pointerId);

    // [칠교놀이의 왕 스타일] 가벼운 탭(이동 거리 6px 미만 & 300ms 이내) 시 즉시 45도 회전!
    if (!session.hasMoved && duration < 320) {
      // 탭 조작: 45도 회전
      data.rot = ((data.rot + 45) % 360 + 360) % 360;
      this.applyTransform(el, data);
      window.soundManager.playRotate();
      this.triggerRotateBounce(el);

      // 스냅 검사
      this.evaluateSnap(el, data);
      this.onPieceTap(el, data);
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    el.classList.remove('is-dragging');

    // 드래그 종료 시 30px 자석 스냅 검사
    const didSnap = this.evaluateSnap(el, data);
    this.onDragEnd(el, data, didSnap);

    e.preventDefault();
    e.stopPropagation();
  }

  handlePointerCancel(e, el) {
    this.handlePointerUp(e, el);
  }

  triggerRotateBounce(el) {
    el.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    setTimeout(() => {
      el.style.transition = '';
    }, 160);
  }

  evaluateSnap(el, data) {
    if (!data.targets || data.isLocked) return false;

    for (const target of data.targets) {
      const dist = Math.hypot(data.x - target.x, data.y - target.y);

      if (dist <= this.snapRadius) {
        let angleMatch = true;
        if (target.rot !== undefined) {
          const normCurrent = ((data.rot % 360) + 360) % 360;
          const normTarget = ((target.rot % 360) + 360) % 360;
          let diff = Math.abs(normCurrent - normTarget);
          if (diff > 180) diff = 360 - diff;
          angleMatch = diff <= this.angleTolerance;
        }

        let flipMatch = true;
        if (target.flip !== undefined && data.flip !== undefined) {
          flipMatch = (target.flip === data.flip);
        }

        if (angleMatch && flipMatch) {
          data.x = target.x;
          data.y = target.y;
          if (target.rot !== undefined) data.rot = target.rot;
          if (target.flip !== undefined) data.flip = target.flip;

          this.applyTransform(el, data);
          this.triggerSnapEffect(el);

          window.soundManager.playSnap();
          this.onSnap(el, data, target);
          return true;
        }
      }
    }
    return false;
  }

  checkSnapPreview(el, data) {
    if (!data.targets) return;
    let isNear = false;
    for (const target of data.targets) {
      const dist = Math.hypot(data.x - target.x, data.y - target.y);
      if (dist <= this.snapRadius + 12) {
        isNear = true;
        break;
      }
    }
    el.style.filter = isNear
      ? 'drop-shadow(0 0 16px #10B981) drop-shadow(0 4px 10px rgba(0,0,0,0.3))'
      : '';
  }

  triggerSnapEffect(el) {
    el.classList.remove('snapped-animate');
    void el.offsetWidth;
    el.classList.add('snapped-animate');

    const ring = document.createElement('div');
    ring.className = 'snap-ring-effect';
    ring.style.width = '110px';
    ring.style.height = '110px';
    ring.style.left = 'calc(50% - 55px)';
    ring.style.top = 'calc(50% - 55px)';
    el.appendChild(ring);

    setTimeout(() => {
      ring.remove();
      el.classList.remove('snapped-animate');
    }, 600);
  }

  applyTransform(el, data) {
    const rot = data.rot || 0;
    const flip = data.flip || 1;
    el.style.left = `${data.x}px`;
    el.style.top = `${data.y}px`;
    el.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scaleX(${flip})`;
  }

  handleKeyDown(e, el) {
    const data = el._dragData;
    if (!data || data.isLocked) return;

    let step = 10;
    if (e.shiftKey) step = 25;

    switch (e.key) {
      case 'ArrowLeft':
        data.x -= step;
        this.applyTransform(el, data);
        e.preventDefault();
        break;
      case 'ArrowRight':
        data.x += step;
        this.applyTransform(el, data);
        e.preventDefault();
        break;
      case 'ArrowUp':
        data.y -= step;
        this.applyTransform(el, data);
        e.preventDefault();
        break;
      case 'ArrowDown':
        data.y += step;
        this.applyTransform(el, data);
        e.preventDefault();
        break;
      case 'r':
      case 'R':
        data.rot = ((data.rot || 0) + 45) % 360;
        this.applyTransform(el, data);
        window.soundManager.playRotate();
        this.evaluateSnap(el, data);
        e.preventDefault();
        break;
      case 'f':
      case 'F':
        data.flip = (data.flip === 1 ? -1 : 1);
        this.applyTransform(el, data);
        window.soundManager.playRotate();
        this.evaluateSnap(el, data);
        e.preventDefault();
        break;
      case 'Enter':
      case ' ':
        this.evaluateSnap(el, data);
        e.preventDefault();
        break;
    }
  }
}

window.DragEngine = DragEngine;
