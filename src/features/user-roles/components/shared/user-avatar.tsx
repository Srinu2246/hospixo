'use client';

import { useState } from 'react';

import styles from './user-avatar.module.css';

type UserAvatarSize = 'sm' | 'md' | 'lg';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  color?: string;
  src?: string;
  /** When true, always show initials (e.g. while names are being edited). */
  preferInitials?: boolean;
  size?: UserAvatarSize;
  className?: string;
}

function sizeClassName(size: UserAvatarSize) {
  if (size === 'lg') return styles.lg;
  if (size === 'md') return styles.md;
  return styles.sm;
}

function sizePx(size: UserAvatarSize) {
  if (size === 'lg') return 40;
  if (size === 'md') return 36;
  return 32;
}

export function getAvatarInitials(firstName: string, lastName: string): string {
  const first = firstName.trim();
  const last = lastName.trim();
  const firstInitial = first.charAt(0);
  const lastInitial = last.charAt(0);

  if (firstInitial && lastInitial) {
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
  if (firstInitial) return firstInitial.toUpperCase();
  if (lastInitial) return lastInitial.toUpperCase();
  return '?';
}

export function UserAvatar({
  firstName,
  lastName,
  color = 'var(--auth-accent)',
  src,
  preferInitials = false,
  size = 'sm',
  className,
}: Readonly<UserAvatarProps>) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const initials = getAvatarInitials(firstName, lastName);
  const sizeClass = sizeClassName(size);
  const dimension = sizePx(size);
  const extraClass = className ?? '';
  const imageSrc = src?.trim();
  const canUseImage = Boolean(imageSrc) && !preferInitials;
  const showImage = canUseImage && imageLoaded && !imageError;

  const avatarKey = `${imageSrc ?? ''}-${firstName}-${lastName}-${preferInitials}`;
  const [prevKey, setPrevKey] = useState(avatarKey);
  if (prevKey !== avatarKey) {
    setPrevKey(avatarKey);
    setImageLoaded(false);
    setImageError(false);
  }

  if (showImage && imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- circular avatar; remote CDN placeholder
      <img
        src={imageSrc}
        alt=""
        className={`${styles.avatar} ${styles.image} ${sizeClass} ${extraClass}`}
        width={dimension}
        height={dimension}
      />
    );
  }

  return (
    <span className={`${styles.avatarWrap} ${sizeClass} ${extraClass}`}>
      <span
        className={`${styles.avatar} ${styles.initials} ${sizeClass}`}
        style={{ backgroundColor: color }}
        aria-label={`${firstName} ${lastName}`.trim() || 'User avatar'}
      >
        {initials}
      </span>
      {canUseImage && imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- preload avatar; swap in once loaded
        <img
          src={imageSrc}
          alt=""
          className={styles.hiddenImage}
          width={dimension}
          height={dimension}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      ) : null}
    </span>
  );
}
