// --- React ---
import React from 'react';
import Badge, { BadgeProps as ReactBootstrapBadgeProps } from 'react-bootstrap/Badge';
// --- Next ---
import Image from 'next/image';
// --- Helpers ---
import { capitalizeFirstLetter } from '@silocitypages/utils';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
// --- Styles ---
import styles from '../styles/components/SclBadges.module.css';

// --- Prop Types ---
type SclBadgeProps = {
  name: string;
  variant?: ReactBootstrapBadgeProps['bg'];
  colorScheme?: string;
  className?: string;
  imgSrc?: string;
  faIcon?: IconDefinition;
  textStyle?: 'light' | 'dark';
  fullWidth?: boolean;
};

const SclBadge: React.FC<SclBadgeProps> = ({
  name,
  variant, // User-provided Bootstrap variant
  colorScheme,
  className,
  imgSrc,
  faIcon,
  textStyle = 'light',
  fullWidth = false,
}) => {
  const badgeDynamicStyles: React.CSSProperties = {};
  // Explicitly define the props we intend to pass to the underlying Badge
  const badgeElementProps: ReactBootstrapBadgeProps = {};

  // Base classes applied regardless of styling method
  const classList = [styles.baseBadge, 'd-flex', 'align-items-center'];

  if (colorScheme) {
    // --- Custom Theming Active ---
    classList.push(styles.useCustomBg);

    // Set local CSS variables via inline style
    badgeDynamicStyles['--scl-badge-current-bg'] =
      `var(--scl-badge-bg-${colorScheme.toLowerCase()}, var(--scl-badge-bg-color-default))`;
    if (textStyle === 'light') {
      badgeDynamicStyles['--scl-badge-current-text'] =
        `var(--scl-badge-text-${colorScheme.toLowerCase()}, var(--scl-badge-text-color))`;
    }

    // 2. Pass a non-existent variant to the 'bg' prop to prevent React Bootstrap from applying its own bg-* classes.
    badgeElementProps.bg = 'none';
  } else {
    // --- Standard Bootstrap Variant Active ---
    badgeElementProps.bg = variant;
  }

  // --- Common Class Additions ---
  if (textStyle === 'dark') {
    classList.push(styles.textDark);
  }
  if (fullWidth) {
    classList.push('w-100', 'justify-content-center');
  } else {
    classList.push('d-inline-flex');
  }
  if (className) {
    classList.push(className);
  }

  // --- Icon Styling ---
  const iconStyle: React.CSSProperties = {
    height: '1.1em',
    width: 'auto',
    marginRight: '0.3em',
    verticalAlign: 'middle',
  };

  return (
    <Badge
      {...badgeElementProps}
      className={classList.join(' ')}
      style={badgeDynamicStyles} // Sets local CSS vars like --scl-badge-current-bg
    >
      {faIcon && <FontAwesomeIcon icon={faIcon} style={iconStyle} fixedWidth aria-hidden='true' />}
      {!faIcon && imgSrc && (
        <Image src={imgSrc} alt={`${name} icon`} height={16} width={16} style={iconStyle} />
      )}
      {capitalizeFirstLetter(name)}
    </Badge>
  );
};

export default SclBadge;
