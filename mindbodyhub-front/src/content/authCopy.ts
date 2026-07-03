import type { AuthStep, SmsPurpose } from '@/components/Auth/types/authFlow';

export const authStepTitles: Record<AuthStep, string> = {
    login: 'Вход',
    register: 'Регистрация',
    recover: 'Восстановление пароля',
    sms: 'Код из SMS',
};

export const authSmsDescriptions: Record<SmsPurpose, string> = {
    register: 'Введите код из SMS для завершения регистрации',
    recover: 'Введите код из SMS для восстановления пароля',
};

export const authCopy = {
    phoneLabel: 'Телефон',
    passwordLabel: 'Пароль',
    codeLabel: 'Код из SMS',
    phonePlaceholder: '+7 (___) ___-__-__',
    passwordPlaceholder: 'Пароль',
    codePlaceholder: '0000',
    loginSubmit: 'Войти',
    registerSubmit: 'Зарегистрироваться',
    recoverSubmit: 'Отправить код',
    smsSubmit: 'Подтвердить',
    noAccount: 'Нет аккаунта? Зарегистрироваться',
    hasAccount: 'Уже есть аккаунт? Войти',
    forgotPassword: 'Не удаётся войти',
    back: 'Назад',
};
