import Link from "next/link";
import MaterialAdjacentNav from "@/components/MaterialAdjacentNav/MaterialAdjacentNav";
import MaterialContent from "@/components/MaterialContent/MaterialContent";
import MaterialReadingMeta from "@/components/MaterialReadingMeta/MaterialReadingMeta";
import MaterialScrollAids from "@/components/MaterialScrollAids/MaterialScrollAids";
import MaterialShareButton from "@/components/MaterialShareButton/MaterialShareButton";
import MaterialToc from "@/components/MaterialToc/MaterialToc";
import { extractMaterialToc } from "@/utils/materialToc";
import {
  estimateReadingMinutes,
  formatPublishedAt,
  formatReadingTimeLabel,
} from "@/utils/readingTime";
import type { MaterialReaderShellProps } from "./MaterialReaderShell.types";
import styles from "./MaterialReaderShell.module.scss";

function MaterialReaderShell({
  document,
  back,
  eyebrow = null,
  adjacent = null,
  layout = "site",
  scrollAids,
  showToc = true,
  enableScrollAids = true,
  className,
}: MaterialReaderShellProps) {
  const toc = showToc ? extractMaterialToc(document.blocks) : [];
  const readingTimeLabel = formatReadingTimeLabel(
    estimateReadingMinutes(document.blocks),
  );
  const showMeta = document.showMetadata !== false;
  const publishedLabel = showMeta
    ? formatPublishedAt(document.publishedAt)
    : null;
  const materialId = scrollAids?.materialId ?? document.id;

  const rootClass = [
    styles.root,
    layout === "cabinet" ? styles.root_cabinet : styles.root_site,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      {enableScrollAids ? (
        <MaterialScrollAids
          materialId={materialId}
          offsetForCabinetNav={scrollAids?.offsetForCabinetNav}
        />
      ) : null}
      <div className={styles.backWrap}>
        <Link className={styles.back} href={back.href}>
          {back.label}
        </Link>
      </div>

      <article className={styles.shell} data-reader-article>
        {document.coverUrl ? (
          <div className={styles.hero}>
            <img
              className={styles.cover}
              src={document.coverUrl}
              alt=""
            />
          </div>
        ) : null}

        <header className={styles.header}>
          {showMeta && eyebrow ? (
            <p className={styles.eyebrow}>{eyebrow}</p>
          ) : null}
          <h1 className={styles.title}>{document.title}</h1>
          <div className={styles.metaRow}>
            <MaterialReadingMeta
              readingTimeLabel={readingTimeLabel}
              publishedLabel={publishedLabel}
              publishedDateTime={document.publishedAt}
            />
            <MaterialShareButton
              title={document.title}
              text={document.summary}
            />
          </div>
          {showMeta && document.summary ? (
            <p className={styles.summary}>{document.summary}</p>
          ) : null}
        </header>

        <div className={styles.divider} />

        <div className={styles.body}>
          {showToc ? (
            <MaterialToc items={toc} className={styles.toc} />
          ) : null}
          <div className={styles.main}>
            <MaterialContent blocks={document.blocks} />
            {adjacent ? (
              <MaterialAdjacentNav
                prev={adjacent.prev}
                next={adjacent.next}
              />
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}

export default MaterialReaderShell;
export type {
  MaterialReaderAdjacent,
  MaterialReaderBackLink,
  MaterialReaderDocument,
  MaterialReaderShellProps,
} from "./MaterialReaderShell.types";
