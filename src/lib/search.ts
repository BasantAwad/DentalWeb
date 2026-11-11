/**
 * Free-text search helpers.
 */

/**
 * Makes a search term safe to interpolate into a PostgREST `or()` filter.
 *
 * The filter grammar treats commas, parentheses, dots and backslashes as
 * separators, so a term containing them produces a malformed filter and the
 * request fails. They are stripped here rather than escaped, because a term
 * that is entirely punctuation carries no meaning in a title search.
 *
 * The `%` and `_` wildcards are left intact: they are meaningful to the user
 * who typed them.
 */
export function safeSearchTerm(value: string): string {
  return value
    .replace(/[,()"\\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
