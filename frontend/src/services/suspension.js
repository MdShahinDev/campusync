/** Shared suspension helpers — the wording matches the backend 403 message. */
export const SUSPENDED_MESSAGE =
  "Your account is suspended please contact with administration";

export function isSuspended(user) {
  return !!user?.isSuspended;
}
