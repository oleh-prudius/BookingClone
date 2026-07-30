import { UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from '@shared/config/env';

export function initAnalytics() {
  if (!UMAMI_SCRIPT_URL || !UMAMI_WEBSITE_ID) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = UMAMI_SCRIPT_URL;
  script.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
  document.head.appendChild(script);
}
