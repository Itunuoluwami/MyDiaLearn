export interface LayoutInput {
    preview?: string;
    heading: string;
    bodyHtml: string;
    action?: {
        label: string;
        url: string;
    };
    footerNote?: string;
}
export declare function renderLayout(input: LayoutInput, brand: {
    name: string;
    appUrl: string;
}): string;
export declare function escapeHtml(value: string): string;
export declare function escapeAttribute(value: string): string;
export declare function toPlainText(input: LayoutInput, brand: {
    name: string;
}): string;
