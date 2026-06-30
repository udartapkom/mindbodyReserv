export interface BookingFormData {
  name: string;
  telephone: string;
  text: string;
}

export interface ValidationErrors {
  name?: string;
  telephone?: string;
  text?: string;
}

export const validateBookingForm = (data: BookingFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.name.trim()) {
    errors.name = 'заполните это поле';
  } else if (/\d/.test(data.name)) {
    errors.name = 'имя не должно содержать цифры';
  } else if (data.name.length > 60) {
    errors.name = 'не более 60 символов';
  }

  if (!data.telephone.trim()) {
    errors.telephone = 'заполните это поле';
  }

  return errors;
};

const EMPTY_FIELD_ERROR = 'заполните это поле';

export const getVisibleValidationErrors = (
  data: BookingFormData,
  touched: Partial<Record<keyof ValidationErrors, boolean>>,
  submitAttempted: boolean,
): ValidationErrors => {
  const errors = validateBookingForm(data);

  if (submitAttempted) {
    return errors;
  }

  const visibleErrors: ValidationErrors = {};

  (Object.keys(errors) as (keyof ValidationErrors)[]).forEach((field) => {
    const error = errors[field];
    if (!error) return;

    if (touched[field] || error !== EMPTY_FIELD_ERROR) {
      visibleErrors[field] = error;
    }
  });

  return visibleErrors;
};

export const isFormValid = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length === 0;
};
