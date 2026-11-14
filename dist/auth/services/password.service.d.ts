export declare class PasswordService {
    hash(plain: string): Promise<string>;
    verify(storedHash: string | null, plain: string): Promise<boolean>;
    dummyVerify(): Promise<void>;
    createToken(): string;
    hashToken(token: string): string;
    safeEquals(a: string, b: string): boolean;
}
