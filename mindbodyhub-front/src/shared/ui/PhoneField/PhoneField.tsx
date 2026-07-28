'use client';

import { useEffect, useState } from 'react';
import { PatternFormat } from 'react-number-format';
import {
  composeInternationalPhone,
  DEFAULT_PHONE_COUNTRY,
  detectPhoneCountry,
  extractNationalDigits,
  getPhoneCountry,
  getPhoneSelectLabel,
  PHONE_COUNTRIES,
  sanitizeInternationalPhoneInput,
  type PhoneCountryId,
} from '@/utils/phone';
import styles from './PhoneField.module.scss';

type PhoneFieldProps = {
  id: string;
  name?: string;
  value: string;
  onChange: (phone: string) => void;
  country?: PhoneCountryId;
  onCountryChange?: (country: PhoneCountryId) => void;
  onBlur?: () => void;
  className?: string;
  inputClassName?: string;
  selectClassName?: string;
  hasError?: boolean;
  disabled?: boolean;
  'aria-invalid'?: boolean;
};

function PhoneField({
  id,
  name = 'telephone',
  value,
  onChange,
  country: countryProp,
  onCountryChange,
  onBlur,
  className,
  inputClassName,
  selectClassName,
  hasError,
  disabled,
  'aria-invalid': ariaInvalid,
}: PhoneFieldProps) {
  const isCountryControlled = countryProp !== undefined;
  const [internalCountry, setInternalCountry] = useState<PhoneCountryId>(() =>
    countryProp ?? (value ? detectPhoneCountry(value) : DEFAULT_PHONE_COUNTRY),
  );
  const country = isCountryControlled ? countryProp : internalCountry;

  useEffect(() => {
    if (isCountryControlled || !value) return;
    const detected = detectPhoneCountry(value);
    setInternalCountry((current) => {
      if (current === 'kz' && detected === 'ru') return current;
      if (current === 'other' && detected === 'ru') return current;
      return detected;
    });
  }, [value, isCountryControlled]);

  const setCountry = (next: PhoneCountryId) => {
    if (!isCountryControlled) {
      setInternalCountry(next);
    }
    onCountryChange?.(next);
  };

  const option = getPhoneCountry(country);

  const handleCountryChange = (next: PhoneCountryId) => {
    setCountry(next);
    onChange('');
  };

  const rootClassName = [styles.phoneField, className].filter(Boolean).join(' ');
  const fieldSelectClassName = [
    styles.phoneField__select,
    hasError ? styles.phoneField__select_error : '',
    selectClassName,
  ]
    .filter(Boolean)
    .join(' ');
  const fieldInputClassName = [
    styles.phoneField__input,
    hasError ? styles.phoneField__input_error : '',
    inputClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName}>
      <label className={styles.phoneField__countryLabel} htmlFor={`${id}-country`}>
        Страна
      </label>
      <select
        id={`${id}-country`}
        className={fieldSelectClassName}
        value={country}
        disabled={disabled}
        aria-label="Код страны"
        onChange={(event) => handleCountryChange(event.target.value as PhoneCountryId)}
      >
        {PHONE_COUNTRIES.map((item) => (
          <option key={item.id} value={item.id} title={item.label}>
            {getPhoneSelectLabel(item)}
          </option>
        ))}
      </select>

      {option.format ? (
        <PatternFormat
          className={fieldInputClassName}
          id={id}
          name={name}
          format={option.format}
          mask="_"
          placeholder={option.placeholder}
          value={extractNationalDigits(value, country)}
          valueIsNumericString
          disabled={disabled}
          aria-invalid={ariaInvalid ?? hasError}
          onBlur={onBlur}
          onValueChange={(values) =>
            onChange(composeInternationalPhone(values.value, country))
          }
        />
      ) : (
        <input
          className={fieldInputClassName}
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={option.placeholder}
          value={value}
          disabled={disabled}
          aria-invalid={ariaInvalid ?? hasError}
          onBlur={onBlur}
          onChange={(event) =>
            onChange(sanitizeInternationalPhoneInput(event.target.value))
          }
        />
      )}
    </div>
  );
}

export default PhoneField;
