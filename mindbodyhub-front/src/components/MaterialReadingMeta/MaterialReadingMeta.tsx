import styles from "./MaterialReadingMeta.module.scss";

type MaterialReadingMetaProps = {
  readingTimeLabel?: string | null;
  publishedLabel?: string | null;
  publishedDateTime?: string | null;
  className?: string;
};

function MaterialReadingMeta({
  readingTimeLabel,
  publishedLabel,
  publishedDateTime,
  className,
}: MaterialReadingMetaProps) {
  if (!readingTimeLabel && !publishedLabel) {
    return null;
  }

  return (
    <p className={[styles.meta, className].filter(Boolean).join(" ")}>
      {readingTimeLabel ? <span>{readingTimeLabel} чтения</span> : null}
      {readingTimeLabel && publishedLabel ? (
        <span className={styles.meta__sep} aria-hidden>
          ·
        </span>
      ) : null}
      {publishedLabel ? (
        <time dateTime={publishedDateTime ?? undefined}>{publishedLabel}</time>
      ) : null}
    </p>
  );
}

export default MaterialReadingMeta;
