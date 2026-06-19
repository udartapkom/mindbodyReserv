"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { iconRegistry } from "./iconRegistry";
import styles from "./Icon.module.scss";
import type { IconName, IconVariant } from "./types";

type IconProps = {
  name: IconName;
  variant?: IconVariant;
  className?: string;
  title?: string;
};

export function Icon({
  name,
  variant = "solid",
  className,
  title,
}: IconProps) {
  const icon = iconRegistry[variant][name];

  if (!icon) {
    return null;
  }

  return (
    <FontAwesomeIcon
      icon={icon}
      className={[styles.icon, className].filter(Boolean).join(" ")}
      title={title}
    />
  );
}
