/** The real EmailJS API; only the E2E suite points the site elsewhere (its stand-in). */
export const EMAILJS_API_HOST = 'https://api.emailjs.com'

/** One request sends the owner's email; EmailJS sends the linked auto-reply to the visitor. */
export const EMAILJS_SEND_PATH = '/api/v1.0/email/send'
