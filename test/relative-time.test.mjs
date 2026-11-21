import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../relative-time.js';

const { formatRelativeTime, replaceRelativePhrase } = globalThis.gitlabLiveRelativeTime;

const NOW_MS = Date.parse('2026-11-20T12:00:00Z');
const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function formatAgo(elapsedMs) {
  return formatRelativeTime(NOW_MS - elapsedMs, NOW_MS);
}

test('past times use GitLab wording at each unit boundary', () => {
  const expectations = [
    [0, 'just now'],
    [9 * SECOND_MS, 'just now'],
    [10 * SECOND_MS, '10 seconds ago'],
    [59 * SECOND_MS, '59 seconds ago'],
    [MINUTE_MS, '1 minute ago'],
    [119 * SECOND_MS, '1 minute ago'],
    [2 * MINUTE_MS, '2 minutes ago'],
    [HOUR_MS, '1 hour ago'],
    [3 * HOUR_MS + 59 * MINUTE_MS, '3 hours ago'],
    [DAY_MS, '1 day ago'],
    [6 * DAY_MS, '6 days ago'],
    [7 * DAY_MS, '1 week ago'],
    [29 * DAY_MS, '4 weeks ago'],
    [31 * DAY_MS, '1 month ago'],
    [400 * DAY_MS, '1 year ago'],
    [800 * DAY_MS, '2 years ago'],
  ];
  for (const [elapsedMs, expectedPhrase] of expectations) {
    assert.equal(formatAgo(elapsedMs), expectedPhrase, `elapsed ${elapsedMs}ms`);
  }
});

test('future times read "in ..." and sub-minute clock skew reads "just now"', () => {
  assert.equal(formatAgo(-5 * SECOND_MS), 'just now');
  assert.equal(formatAgo(-45 * SECOND_MS), 'just now');
  assert.equal(formatAgo(-2 * HOUR_MS), 'in 2 hours');
  assert.equal(formatAgo(-DAY_MS), 'in 1 day');
});

test('replaces only the relative phrase and keeps surrounding text', () => {
  assert.equal(replaceRelativePhrase('  just now  ', '3 hours ago'), '  3 hours ago  ');
  assert.equal(replaceRelativePhrase('updated 5 minutes ago', '2 hours ago'), 'updated 2 hours ago');
  assert.equal(replaceRelativePhrase('Due in 3 days', 'in 2 days'), 'Due in 2 days');
});

test('keeps a leading capital', () => {
  assert.equal(replaceRelativePhrase('Just now', 'just now'), 'Just now');
  assert.equal(replaceRelativePhrase('Just now', 'in 2 days'), 'In 2 days');
  assert.equal(replaceRelativePhrase('Just now', '4 minutes ago'), '4 minutes ago');
});

test('leaves absolute and non-English text alone', () => {
  assert.equal(replaceRelativePhrase('Nov 20, 2026 3:42pm', '1 hour ago'), null);
  assert.equal(replaceRelativePhrase('il y a 3 heures', '1 hour ago'), null);
});
