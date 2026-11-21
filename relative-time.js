(() => {
  const MILLISECONDS_PER_SECOND = 1000;
  const UNIT_STEP_SIZES = [60, 60, 24, 7, 365 / 7 / 12, 12];
  const UNIT_NAMES = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];
  const SECOND_UNIT_INDEX = 0;
  const JUST_NOW_MAX_SECONDS = 9;
  const JUST_NOW_PHRASE = 'just now';

  const RELATIVE_PHRASE_PATTERN =
    /\b(?:just now|right now|(?:an?|\d+) (?:second|minute|hour|day|week|month|year)s? ago|in (?:an?|\d+) (?:second|minute|hour|day|week|month|year)s?)\b/i;

  // Same unit steps and floor rounding as timeago.js, which GitLab uses, so rewritten text matches GitLab's own wording.
  function measureElapsed(absoluteSeconds) {
    let amount = absoluteSeconds;
    let unitIndex = SECOND_UNIT_INDEX;
    while (unitIndex < UNIT_STEP_SIZES.length && amount >= UNIT_STEP_SIZES[unitIndex]) {
      amount /= UNIT_STEP_SIZES[unitIndex];
      unitIndex += 1;
    }
    return { unitIndex, count: Math.floor(amount) };
  }

  // Sub-minute future times also read "just now": a fresh comment's server timestamp is often a few seconds ahead of the local clock.
  function isJustNow(secondsAgo, unitIndex, count) {
    const isSubMinute = unitIndex === SECOND_UNIT_INDEX;
    return isSubMinute && (secondsAgo < 0 || count <= JUST_NOW_MAX_SECONDS);
  }

  function formatRelativeTime(timestampMs, nowMs) {
    const secondsAgo = (nowMs - timestampMs) / MILLISECONDS_PER_SECOND;
    const { unitIndex, count } = measureElapsed(Math.abs(secondsAgo));
    if (isJustNow(secondsAgo, unitIndex, count)) {
      return JUST_NOW_PHRASE;
    }
    const unitName = UNIT_NAMES[unitIndex];
    const quantity = `${count} ${count === 1 ? unitName : `${unitName}s`}`;
    return secondsAgo < 0 ? `in ${quantity}` : `${quantity} ago`;
  }

  function matchCapitalization(phrase, original) {
    const startsUppercase = original[0] !== original[0].toLowerCase();
    return startsUppercase ? phrase[0].toUpperCase() + phrase.slice(1) : phrase;
  }

  function replaceRelativePhrase(text, freshPhrase) {
    const match = RELATIVE_PHRASE_PATTERN.exec(text);
    if (match === null) {
      return null;
    }
    const replacement = matchCapitalization(freshPhrase, match[0]);
    return text.slice(0, match.index) + replacement + text.slice(match.index + match[0].length);
  }

  globalThis.gitlabLiveRelativeTime = { formatRelativeTime, replaceRelativePhrase };
})();
