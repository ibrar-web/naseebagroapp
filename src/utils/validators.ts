export const isPhoneValid = (value: string) => /^\+?[0-9]{10,14}$/.test(value);
export const isEmailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
