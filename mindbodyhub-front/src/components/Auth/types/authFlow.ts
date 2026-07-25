import type { PhoneCountryId } from '@/utils/phone';

export type AuthStep = 'login' | 'register' | 'recover' | 'sms';

export type SmsPurpose = 'register' | 'recover';

export type AuthFlowState = {
    step: AuthStep;
    phone: string;
    phoneCountry: PhoneCountryId;
    smsPurpose: SmsPurpose | null;
};
