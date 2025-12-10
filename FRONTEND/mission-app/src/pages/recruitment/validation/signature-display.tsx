interface SignatureDisplayProps {
    signatureBase64: string;
}

const SignatureDisplay: React.FC<SignatureDisplayProps> = ({ signatureBase64 }) => {
    if (!signatureBase64) return <p>Aucune signature</p>;

    return (
        <img
            src={signatureBase64}
            alt="Signature"
            style={{ maxWidth: 300, maxHeight: 150, border: "1px solid #ccc" }}
        />
    );
};


export default SignatureDisplay;