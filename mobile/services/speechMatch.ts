function fold(value: string) {
  return value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  return fold(value).split(" ").filter(Boolean);
}

/** Stops early once every remaining edit would already be too far. */
function editDistance(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let smallest = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const next = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current.push(next);
      if (next < smallest) smallest = next;
    }
    if (smallest > 1) return 2;
    previous = current;
  }

  return previous[b.length] ?? 2;
}

function tokenClose(heard: string, expected: string) {
  if (heard === expected) return true;
  if (Math.max(heard.length, expected.length) < 5) return false;
  return editDistance(heard, expected) <= 1;
}

/** True when every word of the target shows up in a transcript, ignoring accents and little slips. */
export function spokenWordMatches(target: string, transcripts: readonly string[]) {
  const expected = tokens(target);
  if (expected.length === 0) return false;

  return transcripts.some((transcript) => {
    const spoken = tokens(transcript);
    return spoken.length > 0 && expected.every((word) => spoken.some((token) => tokenClose(token, word)));
  });
}
