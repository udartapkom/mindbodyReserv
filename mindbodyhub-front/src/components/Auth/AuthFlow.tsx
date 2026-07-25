'use client';

import { authStepTitles, authCopy } from '@/content/authCopy';
import { useAuth } from '@/context/AuthContext';
import { useAuthFlow } from './hooks/useAuthFlow';
import LoginStep from './steps/LoginStep';
import RegisterStep from './steps/RegisterStep';
import RecoverPasswordStep from './steps/RecoverPasswordStep';
import Popup from '@/components/Popup/Popup';
import ErrorPopup from '@/components/ErrorPopup/ErrorPopup';
import styles from './AuthFlow.module.scss';
import { useState } from 'react';
import type { PhoneCountryId } from '@/utils/phone';

function AuthFlow() {
    const { login, register } = useAuth();
    const [isAuthErrorOpen, setIsAuthErrorOpen] = useState(false);
    const [authErrorDescription, setAuthErrorDescription] = useState(
        'Ошибка авторизации. Проверьте телефон и пароль.'
    );

    const {
        step,
        phone,
        phoneCountry,
        setPhone,
        setPhoneCountry,
        goToLogin,
        goToRegister,
        goToRecover,
    } = useAuthFlow();

    const handleLoginSubmit = async (loginPhone: string, password: string) => {
        try {
            await login(loginPhone, password);
        } catch (e: any) {
            setAuthErrorDescription(
                'Ошибка авторизации. Проверьте телефон и пароль.'
            );
            setIsAuthErrorOpen(true);
        }
    };

    const handleRegisterSubmit = async (
        registerPhone: string,
        password: string,
        country: PhoneCountryId,
    ) => {
        try {
            await register(registerPhone, password, country);
        } catch (e: any) {
            setAuthErrorDescription(
                e?.message ||
                    'Не удалось зарегистрироваться. Проверьте введённые данные.'
            );
            setIsAuthErrorOpen(true);
        }
    };

    const handleRecoverSubmit = () => {
        window.alert(authCopy.recoverDisabledHint);
    };

    const handleAuthErrorClose = () => setIsAuthErrorOpen(false);

    return (
        <div className={styles.authFlow}>
            <h2 className={styles.authFlow__title}>{authStepTitles[step]}</h2>

            {step === 'login' && (
                <LoginStep
                    phone={phone}
                    phoneCountry={phoneCountry}
                    onPhoneChange={setPhone}
                    onPhoneCountryChange={setPhoneCountry}
                    onSubmit={handleLoginSubmit}
                    onRegisterClick={goToRegister}
                    onRecoverClick={goToRecover}
                />
            )}

            {step === 'register' && (
                <RegisterStep
                    phone={phone}
                    phoneCountry={phoneCountry}
                    onPhoneChange={setPhone}
                    onPhoneCountryChange={setPhoneCountry}
                    onSubmit={handleRegisterSubmit}
                    onLoginClick={goToLogin}
                    onBackClick={goToLogin}
                />
            )}

            {step === 'recover' && (
                <>
                    <p className={styles.authFlow__description}>
                        {authCopy.recoverDisabledHint}
                    </p>
                    <RecoverPasswordStep
                        phone={phone}
                        phoneCountry={phoneCountry}
                        onPhoneChange={setPhone}
                        onPhoneCountryChange={setPhoneCountry}
                        onSubmit={handleRecoverSubmit}
                        onBackClick={goToLogin}
                    />
                </>
            )}

            <Popup
                title="Ошибка"
                isOpen={isAuthErrorOpen}
                onClose={handleAuthErrorClose}
            >
                <ErrorPopup
                    title="Ошибка"
                    description={authErrorDescription}
                    icon="times-circle-o"
                    variant="regular"
                    submit={handleAuthErrorClose}
                />
            </Popup>
        </div>
    );
}

export default AuthFlow;
