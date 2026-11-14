export type EmailFailureKind = 'connection' | 'timeout' | 'authentication' | 'recipient' | 'provider' | 'unknown';
export interface ClassifiedEmailError {
    kind: EmailFailureKind;
    retryable: boolean;
    summary: string;
}
export declare function classifyEmailError(error: unknown): ClassifiedEmailError;
