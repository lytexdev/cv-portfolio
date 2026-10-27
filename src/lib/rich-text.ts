export const LINE_BREAK = /^<br\s*\/?>$/i

export function plainText(text: string, lineBreak: ' ' | '\n' = ' '): string {
  if (typeof text !== 'string') return ''
  return text
    .replace(/<br\s*\/?>/gi, lineBreak)
    .replace(/<icon-[a-z0-9-]+\s*\/?>/gi, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim()
}
