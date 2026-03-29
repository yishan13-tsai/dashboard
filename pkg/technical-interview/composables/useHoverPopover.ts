import { ref, onBeforeUnmount } from 'vue';

export interface HoverPopoverOptions {
  /** Delay in ms before showing the popover (default: 250) */
  delay?: number;
  /** Popover width in px (default: 300) */
  width?: number;
  /** Popover height in px (default: 100) */
  height?: number;
  /** Gap between the trigger and the popover in px (default: 16) */
  gap?: number;
}

type Side = 'right' | 'left' | 'bottom' | 'top';

export function useHoverPopover(options: HoverPopoverOptions = {}) {
  const {
    delay = 250,
    width = 300,
    height = 100,
    gap = 16,
  } = options;

  const showPopover = ref(false);
  const popoverStyle = ref<Record<string, string>>({});
  const isHoveringTrigger = ref(false);
  const isHoveringPopover = ref(false);

  let hoverTimer: ReturnType<typeof setTimeout> | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let cachedRect: DOMRect | null = null;
  let triggerEl: HTMLElement | null = null;

  function positionPopover(e: MouseEvent) {
    const rect = cachedRect || triggerEl?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const distRight = Math.abs(e.clientX - rect.right);
    const distLeft = Math.abs(e.clientX - rect.left);
    const distBottom = Math.abs(e.clientY - rect.bottom);
    const distTop = Math.abs(e.clientY - rect.top);

    const edges: { side: Side; dist: number }[] = [
      { side: 'right', dist: distRight },
      { side: 'left', dist: distLeft },
      { side: 'bottom', dist: distBottom },
      { side: 'top', dist: distTop },
    ].sort((a, b) => a.dist - b.dist);

    let left = 0;
    let top = 0;
    let placed = false;

    for (const { side } of edges) {
      switch (side) {
      case 'right':
        left = rect.right + gap;
        top = e.clientY - height / 2;
        placed = left + width <= vw;
        break;
      case 'left':
        left = rect.left - gap - width;
        top = e.clientY - height / 2;
        placed = left >= 0;
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = e.clientX - width / 2;
        placed = top + height <= vh;
        break;
      case 'top':
        top = rect.top - gap - height;
        left = e.clientX - width / 2;
        placed = top >= 0;
        break;
      }

      if (placed) {
        break;
      }
    }

    // Clamp to viewport
    left = Math.max(0, Math.min(left, vw - width));
    top = Math.max(0, Math.min(top, vh - height));

    popoverStyle.value = {
      position: 'fixed',
      left:     `${ left }px`,
      top:      `${ top }px`,
      width:    `${ width }px`,
      height:   `${ height }px`,
    };
  }

  function clearHideTimer() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function hideIfNeeded() {
    clearHideTimer();
    hideTimer = setTimeout(() => {
      if (!isHoveringTrigger.value && !isHoveringPopover.value) {
        showPopover.value = false;
      }
      hideTimer = null;
    }, 50);
  }

  function onTriggerMouseEnter(e: MouseEvent) {
    isHoveringTrigger.value = true;
    // Capture element ref synchronously — e.currentTarget is nulled after handler returns
    triggerEl = e.currentTarget as HTMLElement;
    cachedRect = triggerEl.getBoundingClientRect();

    hoverTimer = setTimeout(() => {
      positionPopover(e);
      showPopover.value = true;
    }, delay);
  }

  function onTriggerMouseMove(e: MouseEvent) {
    if (showPopover.value) {
      positionPopover(e);
    }
  }

  function onTriggerMouseLeave() {
    isHoveringTrigger.value = false;
    cachedRect = null;
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    hideIfNeeded();
  }

  function onPopoverMouseEnter() {
    isHoveringPopover.value = true;
  }

  function onPopoverMouseLeave() {
    isHoveringPopover.value = false;
    hideIfNeeded();
  }

  function hide() {
    showPopover.value = false;
    isHoveringTrigger.value = false;
    isHoveringPopover.value = false;
  }

  onBeforeUnmount(() => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }
    clearHideTimer();
  });

  return {
    showPopover,
    popoverStyle,
    hide,
    triggerEvents: {
      mouseenter: onTriggerMouseEnter,
      mousemove:  onTriggerMouseMove,
      mouseleave: onTriggerMouseLeave,
    },
    popoverEvents: {
      mouseenter: onPopoverMouseEnter,
      mouseleave: onPopoverMouseLeave,
    },
  };
}
