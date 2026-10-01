export const INTRO_SEEN_KEY = "dpm_intro_seen";

export function clearIntroPending() {
  document.documentElement.classList.remove("intro-pending");
}

export function shouldPlayIntro(enabled: boolean): boolean {
  if (!enabled) return false;
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}
