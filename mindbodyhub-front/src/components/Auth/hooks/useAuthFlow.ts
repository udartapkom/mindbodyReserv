'use client';

import { useCallback, useState } from 'react';
import type { AuthFlowState, AuthStep, SmsPurpose } from '../types/authFlow';

const initialState: AuthFlowState = {
    step: 'login',
    phone: '',
    smsPurpose: null,
};

export function useAuthFlow() {
    const [state, setState] = useState<AuthFlowState>(initialState);

    const setPhone = useCallback((phone: string) => {
        setState((current) => ({ ...current, phone }));
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
        setState({
            step: 'sms',
            phone,
            smsPurpose: purpose,
        });
    }, []);

    return {
        ...state,
        setPhone,
        goToStep,
        goToLogin,
        goToRegister,
        goToRecover,
        goToSms,
    };
}
