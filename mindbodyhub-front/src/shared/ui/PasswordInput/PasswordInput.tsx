"use client";

import {
  useState,
  type InputHTMLAttributes,
  type Ref,
} from "react";
import { Icon } from "@/shared/ui/Icon";
import styles from "./PasswordInput.module.scss";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  inputRef?: Ref<HTMLInputElement>;
  wrapperClassName?: string;
};

export function PasswordInput({
  className,
  wrapperClassName,
  inputRef,
  style,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={[styles.passwordInput, wrapperClassName].filter(Boolean).join(" ")}
    >
      <input
        {...props}
        ref={inputRef}
        type={isVisible ? "text" : "password"}
        className={[styles.passwordInput__field, className].filter(Boolean).join(" ")}
        style={{ ...style, paddingRight: 44 }}
      />
      <button
        type="button"
        className={styles.passwordInput__toggle}
        onClick={() => setIsVisible((prev) => !prev)}
        aria-label={isVisible ? "Скрыть пароль" : "Показать пароль"}
        tabIndex={-1}
      >
        <Icon name={isVisible ? "eye-slash" : "eye"} />
      </button>
    </div>
  );
}
