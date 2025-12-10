import React, { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";

interface Props {
    value: string | null; // signature en base64
    onChange: (dataUrl: string) => void;
}

const SignaturePad: React.FC<Props> = ({ value, onChange }) => {
    const padRef = useRef<SignatureCanvas>(null);

    useEffect(() => {
        if (value && padRef.current && padRef.current.isEmpty()) {
            padRef.current.fromDataURL(value);
        }
    }, [value]);

    const clear = () => {
        padRef.current?.clear();
        onChange("");
    };

    const save = () => {
        if (padRef.current && !padRef.current.isEmpty()) {
            const dataUrl = padRef.current.getTrimmedCanvas().toDataURL("image/png");
            onChange(dataUrl);
        }
    };

    return (
        <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
            <SignatureCanvas
                ref={padRef}
                penColor="black"
                canvasProps={{ width: 400, height: 180, className: "signature-canvas" }}
            />
            <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                <button type="button" onClick={clear}>Effacer</button>
                <button type="button" onClick={save}>Enregistrer la signature</button>
            </div>
        </div>
    );
};

export default SignaturePad;
