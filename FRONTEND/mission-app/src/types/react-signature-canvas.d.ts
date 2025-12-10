declare module 'react-signature-canvas' {
    import * as React from 'react';

    export interface SignatureCanvasProps {
        penColor?: string;
        canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
        clearOnResize?: boolean;
    }

    export default class SignatureCanvas extends React.Component<SignatureCanvasProps> {
        clear(): void;
        isEmpty(): boolean;
        toDataURL(type?: string, encoderOptions?: number): string;
        fromDataURL(dataURL: string): void;
        getTrimmedCanvas(): HTMLCanvasElement;
    }
}
