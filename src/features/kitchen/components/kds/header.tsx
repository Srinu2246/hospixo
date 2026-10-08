type KdsHeaderProps = Readonly<{
  styles: Readonly<Record<string, string>>;
  title: string;
  subtitle?: string;
}>;

export function KdsHeader({ styles, title, subtitle }: KdsHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titles}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
    </header>
  );
}
