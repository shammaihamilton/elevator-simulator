// src/components/common/FormSection.tsx
import React from "react";
import styles from "./FormSection.module.scss";

export interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;          // outer <section>
  contentClassName?: string;   // inner content wrapper
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  className = "",
  contentClassName = "",
}) => (
  <section className={`${styles.section} ${className}`}>
    <h2 className={styles.title}>{title}</h2>
    <div className={`${styles.content} ${contentClassName}`}>
      {children}
    </div>
  </section>
);

export default FormSection;
