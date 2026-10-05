import styles from './footer-actions.module.css';

interface FooterActionsProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function FooterActions({ left, right }: Readonly<FooterActionsProps>) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>{left}</div>
        <div className={styles.right}>{right}</div>
      </div>
    </footer>
  );
}
