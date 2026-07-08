export const PASSWORD_POLICY_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_POLICY_MESSAGE =
  "Пароль должен содержать не менее 8 символов, включая хотя бы одну заглавную букву, одну цифру и один спецсимвол";

export function isPasswordStrong(password: string): boolean {
  return PASSWORD_POLICY_REGEX.test(password);
}
