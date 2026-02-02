interface LabelValueListProps {
    label: string;
    items: string[];
}

const LabelValueList: React.FC<LabelValueListProps> = ({ label, items }) => {
    if (!items.length) return null;

    return (
        <div className="info-card-column">
            <span className="label-top">{label}</span>
            <ul className="value-list">
                { items.map((item, i) => ( <li key={i}>{item}</li> )) }
            </ul>
        </div>
    );
};

export default LabelValueList;
