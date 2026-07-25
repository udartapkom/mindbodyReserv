'use client';

import { useCallback, useState } from 'react';
import { DEFAULT_PHONE_COUNTRY, type PhoneCountryId } from '@/utils/phone';
import type { AuthFlowState, AuthStep, SmsPurpose } from '../types/authFlow';

const initialState: AuthFlowState = {
    step: 'login',
    phone: '',
    phoneCountry: DEFAULT_PHONE_COUNTRY,
    smsPurpose: null,
};

export function useAuthFlow() {
    const [state, setState] = useState<AuthFlowState>(initialState);

    const setPhone = useCallback((phone: string) => {
        setState((current) => ({ ...current, phone }));
    }, []);

    const setPhoneCountry = useCallback((phoneCountry: PhoneCountryId) => {
        setState((current) => ({ ...current, phoneCountry }));
    }, []);

    const goToStep = useCallback((step: AuthStep) => {
        setState((current) => ({ ...current, step }));
    }, []);

    const goToLogin = useCallback(() => {
        setState((current) => ({
            ...current,
            step: 'login',
            smsPurpose: null,
        }));
    }, []);

    const goToRegister = useCallback(() => {
        setState((current) => ({ ...current, step: 'register' }));
    }, []);

    const goToRecover = useCallback(() => {
        setState((current) => ({ ...current, step: 'recover' }));
    }, []);

    const goToSms = useCallback((phone: string, purpose: SmsPurpose) => {
        setState((current) => ({
            step: 'sms',
            phone,
            phoneCountry: current.phoneCountry,
            smsPurpose: purpose,
        }));
    }, []);

    return {
        ...state,
        setPhone,
        setPhoneCountry,
        goToStep,
        goToLogin,
        goToRegister,
        goToRecover,
        goToSms,
    };
}
