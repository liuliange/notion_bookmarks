export const FALLBACK_ICON_SRC = '/globe.svg';
export const ICON_LOAD_TIMEOUT_MS = 4000;

type LinkIconSource = {
  iconfile?: string | null;
  iconlink?: string | null;
};

export type IconLoadState = {
  src: string;
  isLoaded: boolean;
  hasFailed: boolean;
  showFallback: boolean;
  showSpinner: boolean;
};

export function getLinkIconUrl(link: LinkIconSource): string {
  if (link.iconfile) {
    return link.iconfile;
  }

  if (link.iconlink) {
    return link.iconlink;
  }

  return FALLBACK_ICON_SRC;
}

export function getInitialIconState(link: LinkIconSource): IconLoadState {
  const src = getLinkIconUrl(link);

  return {
    src,
    isLoaded: src === FALLBACK_ICON_SRC,
    hasFailed: false,
    showFallback: false,
    showSpinner: src !== FALLBACK_ICON_SRC,
  };
}

export function getLoadedIconState(state: IconLoadState): IconLoadState {
  return {
    ...state,
    isLoaded: true,
    showFallback: false,
    showSpinner: false,
  };
}

export function getFailedIconState(): IconLoadState {
  return {
    src: FALLBACK_ICON_SRC,
    isLoaded: true,
    hasFailed: true,
    showFallback: false,
    showSpinner: false,
  };
}

export function getTimedOutIconState(state: IconLoadState): IconLoadState {
  if (state.isLoaded || state.src === FALLBACK_ICON_SRC) {
    // 已加载或已兜底：仅当 spinner 还在转时才更新，否则返回同一引用避免冗余重渲染
    if (!state.showSpinner) return state;
    return {
      ...state,
      showSpinner: false,
    };
  }

  // 已超时（showFallback 已 true 且 spinner 已停）：状态未变，返回同一引用，React 直接跳过更新
  if (state.showFallback && !state.showSpinner) return state;

  return {
    ...state,
    showFallback: true,
    showSpinner: false,
  };
}
