// NumberField.tsx
import styles from "./NumberField.module.scss";

interface NumberFieldProps {
  label: string;
  min?: number;
  step?: number;
  value: number;
  onChange: (newVal: number) => void;
}

const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  min,
  step = 1,
  onChange,
}) => (
  <div className={styles.field}>
    <label className={styles.label}>{label}</label>
    <input
      type="number"
      className={styles.input}
      value={value}
      min={min}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
  </div>
);

export default NumberField;
