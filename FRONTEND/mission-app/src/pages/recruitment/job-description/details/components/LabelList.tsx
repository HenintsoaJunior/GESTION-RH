interface LabelListProps {
  items: string[];
}

const LabelList: React.FC<LabelListProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <div className="info-card">
      {/* <span className="label">{label}</span> */}
      <ul className="value" style={{ paddingLeft: 18, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default LabelList;
