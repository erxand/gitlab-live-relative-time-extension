(() => {
  const { formatRelativeTime, replaceRelativePhrase } = globalThis.gitlabLiveRelativeTime;

  const TIME_ELEMENT_SELECTOR = 'time[datetime]';
  const DATETIME_ATTRIBUTE = 'datetime';
  const REFRESH_INTERVAL_MS = 5000;

  function* textNodesWithin(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      yield walker.currentNode;
    }
  }

  // Writes nodeValue on GitLab's existing text node instead of replacing it, so Vue keeps patching the same node and the observer can correct it.
  function refreshTimeElement(timeElement, nowMs) {
    const timestampMs = Date.parse(timeElement.getAttribute(DATETIME_ATTRIBUTE));
    if (Number.isNaN(timestampMs)) {
      return;
    }
    const freshPhrase = formatRelativeTime(timestampMs, nowMs);
    for (const textNode of textNodesWithin(timeElement)) {
      const updatedText = replaceRelativePhrase(textNode.nodeValue, freshPhrase);
      if (updatedText === null) {
        continue;
      }
      if (updatedText !== textNode.nodeValue) {
        textNode.nodeValue = updatedText;
      }
      return;
    }
  }

  function refreshAllTimeElements() {
    const nowMs = Date.now();
    for (const timeElement of document.querySelectorAll(TIME_ELEMENT_SELECTOR)) {
      refreshTimeElement(timeElement, nowMs);
    }
  }

  let isRefreshScheduled = false;

  function scheduleRefresh() {
    if (isRefreshScheduled) {
      return;
    }
    isRefreshScheduled = true;
    requestAnimationFrame(() => {
      isRefreshScheduled = false;
      refreshAllTimeElements();
    });
  }

  function refreshWhileVisible() {
    if (!document.hidden) {
      refreshAllTimeElements();
    }
  }

  refreshAllTimeElements();
  setInterval(refreshWhileVisible, REFRESH_INTERVAL_MS);
  document.addEventListener('visibilitychange', refreshWhileVisible);
  new MutationObserver(scheduleRefresh).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();
