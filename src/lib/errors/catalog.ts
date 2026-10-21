export const httpErrors: Record<
  number,
  { titleDe: string; titleEn: string; messageDe: string; messageEn: string }
> = {
  400: {
    titleDe: 'Ungültige Anfrage',
    titleEn: 'Bad request',
    messageDe: 'Die Anfrage konnte nicht verarbeitet werden.',
    messageEn: 'The request could not be understood.',
  },
  401: {
    titleDe: 'Nicht autorisiert',
    titleEn: 'Unauthorized',
    messageDe: 'Ein gültiger Zugang fehlt.',
    messageEn: 'Valid credentials or token required.',
  },
  403: {
    titleDe: 'Verboten',
    titleEn: 'Forbidden',
    messageDe: 'Kein Zugriff auf diese Ressource.',
    messageEn: 'You do not have access to this resource.',
  },
  404: {
    titleDe: 'Nicht gefunden',
    titleEn: 'Not found',
    messageDe: 'Die angeforderte Seite existiert nicht.',
    messageEn: 'The requested page does not exist.',
  },
  405: {
    titleDe: 'Methode nicht erlaubt',
    titleEn: 'Method not allowed',
    messageDe: 'Diese HTTP-Methode ist hier nicht erlaubt.',
    messageEn: 'This HTTP method is not allowed here.',
  },
  429: {
    titleDe: 'Zu viele Anfragen',
    titleEn: 'Too many requests',
    messageDe: 'Bitte warte kurz und versuche es erneut.',
    messageEn: 'Please wait a moment and try again.',
  },
  500: {
    titleDe: 'Interner Fehler',
    titleEn: 'Internal server error',
    messageDe: 'Etwas ist auf dem Server schiefgelaufen.',
    messageEn: 'Something went wrong on the server.',
  },
  502: {
    titleDe: 'Bad Gateway',
    titleEn: 'Bad gateway',
    messageDe: 'Das Upstream-Gateway antwortet fehlerhaft.',
    messageEn: 'The upstream gateway returned an invalid response.',
  },
  503: {
    titleDe: 'Nicht verfügbar',
    titleEn: 'Service unavailable',
    messageDe: 'Der Dienst ist vorübergehend nicht erreichbar.',
    messageEn: 'The service is temporarily unavailable.',
  },
  504: {
    titleDe: 'Gateway Timeout',
    titleEn: 'Gateway timeout',
    messageDe: 'Das Upstream-Gateway hat zu lange gebraucht.',
    messageEn: 'The upstream gateway timed out.',
  },
}

export const errorStatuses = Object.keys(httpErrors).map(Number)
