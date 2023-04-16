export const JWT_SECRET_KEY = `gg_${process.env.JWT_SECRET}`;
export const JWT_EXPIRATION_TIME = '3600s';

export const USER_ALREADY_EXISTS = 'User email or username already exists';
export const USER_LOGIN_SUCCESS = 'Access granted';
export const USER_LOGIN_FAILED = 'Incorrect username or password';
export const USER_NOT_FOUND = 'User email or username not found';

export const VERIFY_EMAIL_SENT = 'Email sent for verification';
export const VERIFY_EMAIL_FAILED = 'Email verification failed';
export const VERIFY_EMAIL_EXPIRED = 'Email verification already expired';
export const VERIFY_EMAIL_SUCCESS = 'Email verification success';
export const VERIFY_EMAIL_TOKEN_INVALID = 'Verify email token invalid';

export const EMAIL_VERIFY_MESSAGE = 'Email verification required';
export const EMAIL_VERIFICATION_SENT = 'Email verification sent';
export const EMAIL_VERIFIED = 'Email verified';

export const OK = 'Ok';
