/**
 * Shared zxcvbn threshold for signup / password reset.
 * Score 3 = "Good" on PasswordStrengthMeter; aligns with typical Clerk acceptance.
 */
export const MIN_PASSWORD_STRENGTH_SCORE = 3;

export function clerkPasswordErrorMessage(err: unknown): string {
  const e = err as { errors?: Array<{ code?: string; message?: string }> };
  const first = e?.errors?.[0];
  const code = first?.code || "";
  const message = first?.message || "";

  if (code === "form_password_pwned" || message.toLowerCase().includes("data breach")) {
    return "That password appears in known data breaches and cannot be used. Choose a unique password you do not use on other sites.";
  }
  if (code === "form_password_length_too_short" || message.toLowerCase().includes("too short")) {
    return "That password is too short for your account settings. Try a longer one.";
  }
  if (code === "form_password_validation_failed" || message.toLowerCase().includes("password")) {
    return message || "Password did not meet security requirements. Try a longer mix of letters, numbers, and symbols.";
  }
  return message || "That password could not be accepted. Please try again.";
}
