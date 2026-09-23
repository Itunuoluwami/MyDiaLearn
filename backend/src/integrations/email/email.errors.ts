/**
 * Classifying delivery failures.
 *
 * The distinction that matters is transient versus permanent. Retrying a
 * refused mailbox wastes time and can get a sender throttled; not retrying a
 * dropped connection loses mail that would have gone on the next attempt.
 */
export type EmailFailureKind =
  'connection' | 'timeout' | 'authentication' | 'recipient' | 'provider' | 'unknown';

export interface ClassifiedEmailError {
  kind: EmailFailureKind;
  retryable: boolean;
  /** Safe for logs and for an admin-facing health response. */
  summary: string;
}

/** nodemailer surfaces these on the error object. */
interface TransportError {
  code?: string;
  command?: string;
  responseCode?: number;
  message?: string;
}

export function classifyEmailError(error: unknown): ClassifiedEmailError {
  const err = (error ?? {}) as TransportError;
  const code = err.code ?? '';
  const status = err.responseCode;

  if (code === 'EAUTH' || status === 535 || status === 534) {
    // Retrying will not fix a wrong password, and repeated failures get a
    // sending address blocked.
    return {
      kind: 'authentication',
      retryable: false,
      summary: 'SMTP authentication was rejected.',
    };
  }

  if (code === 'ETIMEDOUT' || code === 'ESOCKET' || code === 'ECONNECTION') {
    return {
      kind: code === 'ETIMEDOUT' ? 'timeout' : 'connection',
      retryable: true,
      summary: 'Could not reach the mail server.',
    };
  }

  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'EHOSTUNREACH') {
    return {
      kind: 'connection',
      retryable: true,
      summary: 'The mail server refused the connection or could not be resolved.',
    };
  }

  if (code === 'EENVELOPE' || status === 550 || status === 553) {
    return {
      kind: 'recipient',
      retryable: false,
      summary: 'The recipient address was rejected.',
    };
  }

  if (typeof status === 'number') {
    // 4xx is a temporary refusal in SMTP; 5xx is permanent.
    const retryable = status >= 400 && status < 500;
    return {
      kind: 'provider',
      retryable,
      summary: `The mail server returned ${status}.`,
    };
  }

  // Unknown failures are retried once or twice: an unclassified transport
  // hiccup is more likely than an unclassified permanent rejection.
  return { kind: 'unknown', retryable: true, summary: 'Delivery failed.' };
}
