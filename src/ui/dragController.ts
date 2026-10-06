import { store } from '../core/store';

interface DragState {
  pieceId: string;
  sourceType: 'tray' | 'slot';
  fromSlotIndex?: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  ghostEl: HTMLElement | null;
  originEl: HTMLElement;
  lastHoveredSlot: HTMLElement | null;
}

export class DragController {
  private activeDrag: DragState | null = null;
  private rootContainer: HTMLElement;

  constructor(rootContainer: HTMLElement) {
    this.rootContainer = rootContainer;
    this.initGlobalListeners();
  }

  public bindItem(el: HTMLElement, pieceId: string, sourceType: 'tray' | 'slot', fromSlotIndex?: number) {
    el.style.touchAction = 'none'; // Prevent browser scrolling while dragging

    el.addEventListener('pointerdown', (e: PointerEvent) => {
      // Only primary mouse button or touch
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      this.startPointer(e, el, pieceId, sourceType, fromSlotIndex);
    });
  }

  private startPointer(
    e: PointerEvent,
    originEl: HTMLElement,
    pieceId: string,
    sourceType: 'tray' | 'slot',
    fromSlotIndex?: number
  ) {
    // If completed or not in solving mode, ignore
    if (store.status !== 'solving') return;

    this.activeDrag = {
      pieceId,
      sourceType,
      fromSlotIndex,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      isDragging: false,
      ghostEl: null,
      originEl,
      lastHoveredSlot: null
    };

    try {
      originEl.setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
  }

  private initGlobalListeners() {
    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.activeDrag) return;

      const dx = Math.abs(e.clientX - this.activeDrag.startX);
      const dy = Math.abs(e.clientY - this.activeDrag.startY);

      // Start drag threshold: 6 pixels
      if (!this.activeDrag.isDragging && (dx > 6 || dy > 6)) {
        this.activeDrag.isDragging = true;
        this.createGhost(this.activeDrag.originEl, e.clientX, e.clientY);
        this.activeDrag.originEl.style.opacity = '0.35';
      }

      if (this.activeDrag.isDragging && this.activeDrag.ghostEl) {
        this.activeDrag.currentX = e.clientX;
        this.activeDrag.currentY = e.clientY;

        this.activeDrag.ghostEl.style.transform = `translate3d(${e.clientX - 45}px, ${e.clientY - 45}px, 0) scale(1.06)`;

        // Detect hover target underneath
        this.updateHoverTarget(e.clientX, e.clientY);
      }
    });

    const handlePointerEnd = (e: PointerEvent) => {
      if (!this.activeDrag) return;

      const { isDragging, pieceId, sourceType, fromSlotIndex, originEl } = this.activeDrag;

      // Clean up ghost and original element styles
      if (this.activeDrag.ghostEl) {
        this.activeDrag.ghostEl.remove();
      }
      originEl.style.opacity = '1';
      this.clearHoverHighlights();

      if (!isDragging) {
        // Was a TAP!
        if (sourceType === 'tray') {
          store.selectPieceFromTray(pieceId);
        } else if (sourceType === 'slot' && fromSlotIndex !== undefined) {
          store.removePieceFromSlot(fromSlotIndex);
        }
      } else {
        // Was a DRAG DROP!
        this.handleDrop(e.clientX, e.clientY, pieceId, sourceType, fromSlotIndex);
      }

      this.activeDrag = null;
    };

    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);
  }

  private createGhost(sourceEl: HTMLElement, x: number, y: number) {
    const clone = sourceEl.cloneNode(true) as HTMLElement;
    clone.id = 'drag-floating-ghost';
    clone.style.position = 'fixed';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '99999';
    clone.style.opacity = '0.95';
    clone.style.boxShadow = '0 20px 35px -5px rgba(0, 0, 0, 0.7), 0 0 20px rgba(230, 175, 69, 0.4)';
    clone.style.transform = `translate3d(${x - 45}px, ${y - 45}px, 0) scale(1.06)`;
    clone.style.transition = 'none';

    document.body.appendChild(clone);
    if (this.activeDrag) {
      this.activeDrag.ghostEl = clone;
    }
  }

  private updateHoverTarget(x: number, y: number) {
    const elUnder = document.elementFromPoint(x, y);
    if (!elUnder) return;

    const slotTarget = elUnder.closest('[data-slot-index]') as HTMLElement | null;

    if (slotTarget !== this.activeDrag?.lastHoveredSlot) {
      this.clearHoverHighlights();
      if (slotTarget) {
        slotTarget.classList.add('ring-2', 'ring-quran-gold', 'bg-quran-gold/15');
        if (this.activeDrag) {
          this.activeDrag.lastHoveredSlot = slotTarget;
        }
      }
    }
  }

  private clearHoverHighlights() {
    this.rootContainer.querySelectorAll('[data-slot-index]').forEach((el) => {
      el.classList.remove('ring-2', 'ring-quran-gold', 'bg-quran-gold/15');
    });
    if (this.activeDrag) {
      this.activeDrag.lastHoveredSlot = null;
    }
  }

  private handleDrop(
    x: number,
    y: number,
    pieceId: string,
    sourceType: 'tray' | 'slot',
    fromSlotIndex?: number
  ) {
    const elUnder = document.elementFromPoint(x, y);
    if (!elUnder) return;

    // Check if dropped onto a slot
    const slotTarget = elUnder.closest('[data-slot-index]') as HTMLElement | null;
    if (slotTarget) {
      const targetSlotIdx = parseInt(slotTarget.getAttribute('data-slot-index') || '-1', 10);
      if (targetSlotIdx >= 0) {
        if (sourceType === 'tray') {
          store.selectPieceFromTray(pieceId, targetSlotIdx);
        } else {
          store.placePieceInSlot(pieceId, targetSlotIdx, fromSlotIndex);
        }
        return;
      }
    }

    // Check if dropped over the tray
    const trayTarget = elUnder.closest('#tray-container');
    if (trayTarget && sourceType === 'slot' && fromSlotIndex !== undefined) {
      // Dragged out of slot into tray
      store.removePieceFromSlot(fromSlotIndex);
      return;
    }

    // Dropped outside: stays where it was
  }
}
