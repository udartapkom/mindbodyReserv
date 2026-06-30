"use client";

import { FontAwesomeIcon, type FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { iconRegistry } from "./iconRegistry";
import styles from "./Icon.module.scss";
import type { IconName, IconVariant } from "./types";

type IconProps = {
  name: IconName;
  variant?: IconVariant;
  className?: string;
  style?: FontAwesomeIconProps["style"];
  title?: string;
};

export function Icon({
  name,
  variant = "solid",
  className,
  style,
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
      style={style}
      title={title}
    />
  );
}
