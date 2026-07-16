export type AuthStep = 'login' | 'register' | 'recover' | 'sms';

export type SmsPurpose = 'register' | 'recover';

export type AuthFlowState = {
    step: AuthStep;
    phone: string;
    smsPurpose: SmsPurpose | null;
};
