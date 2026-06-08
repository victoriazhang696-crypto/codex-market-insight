export function isEightDigitAccountNumber(value: string) {
  return /^\d{8}$/.test(value.trim());
}

export function accountNumberToEmail(accountNumber: string) {
  const normalized = accountNumber.trim();
  if (!isEightDigitAccountNumber(normalized)) {
    throw new Error('Account number must be exactly 8 digits.');
  }

  return `${normalized}@members.local`;
}

export function adminAccountNumberToEmail(accountNumber: string) {
  const normalized = accountNumber.trim();
  if (!isEightDigitAccountNumber(normalized)) {
    throw new Error('Admin account number must be exactly 8 digits.');
  }

  return `${normalized}@admins.local`;
}

export function normalizePhonePassword(phone: string) {
  return phone.trim();
}
