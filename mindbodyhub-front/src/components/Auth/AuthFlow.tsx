'use client';

import { authStepTitles } from '@/content/authCopy';
import { useAuthFlow } from './hooks/useAuthFlow';
import LoginStep from './steps/LoginStep';
import RegisterStep from './steps/RegisterStep';
import RecoverPasswordStep from './steps/RecoverPasswordStep';
import SmsCodeStep from './steps/SmsCodeStep';
import styles from './AuthFlow.module.scss';

function AuthFlow() {
    const {
        step,
        phone,
        smsPurpose,
        setPhone,
        goToLogin,
        goToRegister,
        goToRecover,
        goToSms,
    } = useAuthFlow();

    const handleLoginSubmit = (loginPhone: string, password: string) => {
        console.log('login', { phone: loginPhone, password });
    };

    const handleRegisterSubmit = (registerPhone: string, password: string) => {
        console.log('register', { phone: registerPhone, password });
        goToSms(registerPhone, 'register');
    };

    const handleRecoverSubmit = (recoverPhone: string) => {
        console.log('recover', { phone: recoverPhone });
        goToSms(recoverPhone, 'recover');
    };

    const handleSmsSubmit = (code: string) => {
        console.log('sms verify', { phone, purpose: smsPurpose, code });
    };

    const handleSmsBack = () => {
        if (smsPurpose === 'register') {
            goToRegister();
            return;
        }

        goToRecover();
    };

    return (
        <div className={styles.authFlow}>
            <h2 className={styles.authFlow__title}>{authStepTitles[step]}</h2>

            {step === 'login' && (
                <LoginStep
                    phone={phone}
                    onPhoneChange={setPhone}
                    onSubmit={handleLoginSubmit}
                    onRegisterClick={goToRegister}
                    onRecoverClick={goToRecover}
                />
            )}

            {step === 'register' && (
                <RegisterStep
                    phone={phone}
                    onPhoneChange={setPhone}
                    onSubmit={handleRegisterSubmit}
                    onLoginClick={goToLogin}
                    onBackClick={goToLogin}
                />
            )}

            {step === 'recover' && (
                <RecoverPasswordStep
                    phone={phone}
                    onPhoneChange={setPhone}
                    onSubmit={handleRecoverSubmit}
                    onBackClick={goToLogin}
                />
            )}

            {step === 'sms' && smsPurpose && (
                <SmsCodeStep
                    phone={phone}
                    purpose={smsPurpose}
                    onSubmit={handleSmsSubmit}
                    onBackClick={handleSmsBack}
                />
            )}
        </div>
    );
}

export default AuthFlow;
