import { createHash, randomInt } from 'crypto';

export const generateGravatar = (fullName = 'anonymous') => {
  fullName = fullName.replace(/\s+/g, '') ? fullName : 'anonymous';
  const name = fullName
    .match(/(\b\S)?/g)
    .join('')
    .match(/(^\S|\S$)?/g)
    .join('')
    .toUpperCase();

  const n = randomInt(0, 6);
  const hash = createHash('md5').update(name).digest('hex');
  const gravatar = `https://secure.gravatar.com/avatar/${hash}`;
  const gravatarImage = `https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/initials/${name}-${n}.png`;
  return `${gravatar}?d=${gravatarImage}`;
};
