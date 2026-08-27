/**
 * The short name a case goes by.
 *
 * A UUID is unusable in conversation: nobody reads one out, and two of them are
 * indistinguishable at a glance in a list. `R-8F3A21` is six hex characters of
 * the same id — enough to be unambiguous among the reports one person is
 * holding in their head, short enough to say out loud and paste into a commit
 * message.
 *
 * It is a *label*, never a key. Every link, lookup, and write uses the full
 * UUID, and the case file keeps the whole thing one copy-click away.
 */
export function caseIdent(id: string) {
  return `R-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

/**
 * A full record id, as pasted from a log line or a URL.
 *
 * UUID shape is shared by reports, users, and schools. The palette uses this to
 * offer direct routes for all three domains; it never guesses the record type
 * from the value alone.
 */
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * An ident as typed — `R-8F3A21`, or the six hex characters on their own,
 * because an operator quoting one to themselves usually drops the prefix.
 *
 * Deliberately loose about length: a half-typed `R-8F3` should still offer the
 * docket search, since that search will happily match a prefix.
 */
export const identPattern = /^(r-)?[0-9a-f]{2,6}$/i;
