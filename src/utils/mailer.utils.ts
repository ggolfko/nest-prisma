import { createTransport } from 'nodemailer';

export const createMailTransport = async () => {
  return createTransport({
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    secure: process.env.MAILER_SECURE,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
    debug: process.env.MAILER_DEBUG,
  } as any);
};
