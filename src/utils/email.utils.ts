import { isAfter } from 'date-fns';

export const verifyExpires = (expiresAt: string | number | Date) => {
  return isAfter(new Date(), new Date(expiresAt));
};

export const forgotPasswordEmailTemplate = ({ url, name }) => `
Dear ${name},

\n\nWe have received a request to reset your password for your account on our platform. If you did not request this, please ignore this email.

\n\nTo reset your password, please follow the link below:

\n\n${url}

\n\nIf you have any questions or concerns, please contact our support team at support@example.com.

\n\nBest regards,

\n\nThe Example Team
`;

export const registerEmailTemplate = ({ url, name }) => `
Dear ${name},

\n\nWelcome to our platform! We are excited to have you join our community.

\n\nTo get started, please click the link below to verify your email address:

\n\n${url}

\n\nIf you have any questions or concerns, please contact our support team at support@example.com.

\n\nBest regards,

\n\nThe Example Team
`;

export const emailVerificationTemplate = ({ url, name }) => `
Dear ${name},

\n\nThank you for registering on our platform. To complete your registration, please verify your email address by clicking the link below:

\n\n${url}

\n\nIf you have any questions or concerns, please contact our support team at support@example.com.

\n\nBest regards,

\n\nThe Example Team

`;
