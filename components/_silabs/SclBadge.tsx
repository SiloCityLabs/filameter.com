// --- React ---
import React from "react";
import Badge from "react-bootstrap/Badge";
// --- Next ---
import Image from "next/image";
// --- Helpers ---
import { capitalizeFirstLetter } from "@/helpers/_silabs/capitalizeFirstLetter";
// --- Font Awesome ---
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
// --- Styles ---
import styles from "@/public/styles/components/SclBadges.module.css";

type SclBadgeProps = {
  name: string;
  variant?: string; // Bootstrap background variant (e.g., 'primary', 'secondary')
  badgeOverwrite?: string; // Custom CSS module class name
  imgSrc?: string; // Path to an image file
  faIcon?: IconDefinition; // Font Awesome icon definition object
  needsDarkText?: boolean;
  fullWidth?: boolean;
};

const SclBadge: React.FC<SclBadgeProps> = ({
  name,
  variant = "success",
  badgeOverwrite = "",
  imgSrc = "",
  faIcon,
  needsDarkText = false,
  fullWidth = false,
}) => {
  // --- Calculate Badge Classes ---
  const badgeClasses = ["d-flex", "align-items-center", styles.baseBadge];

  // Apply custom CSS module override class if provided and exists
  if (badgeOverwrite && styles[badgeOverwrite]) {
    badgeClasses.push(styles[badgeOverwrite]);
  }

  // Apply layout classes
  if (fullWidth) {
    badgeClasses.push("w-100", "justify-content-center");
  } else {
    badgeClasses.push("d-inline-flex");
  }

  // Apply text color class if needed
  if (needsDarkText) {
    badgeClasses.push("text-dark");
  }

  // --- Define consistent icon styling ---
  const iconStyle: React.CSSProperties = {
    height: "1.1em", // Height relative to text size
    width: "auto", // Maintain aspect ratio
    marginRight: "0.3em", // Space between icon and text
    verticalAlign: "middle", // Try to align icons nicely with text baseline
  };

  return (
    <Badge className={badgeClasses.join(" ")} bg={variant}>
      {faIcon && (
        <FontAwesomeIcon
          icon={faIcon}
          style={iconStyle}
          fixedWidth
          aria-hidden="true"
        />
      )}

      {/* Render Image only if faIcon is NOT provided AND imgSrc IS provided */}
      {!faIcon && imgSrc && (
        <Image
          src={imgSrc}
          alt={`${name} image`}
          height={16}
          width={16}
          style={iconStyle}
        />
      )}

      {capitalizeFirstLetter(name)}
    </Badge>
  );
};

export default SclBadge;
