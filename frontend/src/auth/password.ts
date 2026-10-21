export function passwordProblem(password: string): string | null {
  if (password.length < 8) {
    return 'Use at least 8 characters.';
  }

  if (password.length > 128) {
    return 'Use a password of 128 characters or fewer.';
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Use at least one letter and one number.';
  }

  return null;
}
