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
