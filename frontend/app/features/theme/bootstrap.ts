import { THEME_OVERRIDE_ID, THEME_STORAGE_KEY } from "./paths";

export function themeBootstrapScript(
  themeIds: readonly string[],
  defaultId: string,
  timeZone: string,
): string {
  const ids = JSON.stringify(themeIds);
  const fallback = JSON.stringify(defaultId);
  const key = JSON.stringify(THEME_STORAGE_KEY);
  const linkId = JSON.stringify(THEME_OVERRIDE_ID);
  return `(function(){try{var a=${ids},d=${fallback},s=localStorage.getItem(${key});var t=a.indexOf(s)>-1?s:d;if(t!==d){var h=document.documentElement;h.setAttribute("data-theme",t);h.classList.add("vg-theme-loading");var l=document.createElement("link");l.rel="stylesheet";l.id=${linkId};l.onload=l.onerror=function(){requestAnimationFrame(function(){requestAnimationFrame(function(){h.classList.remove("vg-theme-loading")})})};l.href="/themes/"+t+"/theme.css";document.head.appendChild(l)}}catch(e){}try{if(localStorage.getItem("vg-hub-display")!=="day"){var n=+new Intl.DateTimeFormat("en-GB",{timeZone:${JSON.stringify(timeZone)},hour:"numeric",hourCycle:"h23"}).format(new Date());if(n<6||n>=18)document.documentElement.setAttribute("data-sky","night")}}catch(e){}})();`;
}
