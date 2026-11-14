export declare function passwordDecorators(): PropertyDecorator[];
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    countryCode?: string;
    timezone?: string;
    role: 'parent' | 'student' | 'tutor' | 'agency';
}
export declare class RefreshDto {
    refreshToken?: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class VerifyEmailDto {
    token: string;
}
export declare class ResendVerificationDto {
    email: string;
}
export declare class LogoutDto {
    allDevices?: boolean;
}
