'use client';

// --- React ---
import React from 'react';
// --- Components ---
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface NavLink {
  label: string;
  href: string;
  target?: string;
}

interface PageLayoutProps {
  children: React.ReactNode;
  headerClassName?: string;
  footerClassName?: string;
  navLinks?: NavLink[];
  showHeader?: boolean;
  showFooter?: boolean;
  headerDarkLinks?: boolean;
  headerShowBadge?: boolean;
  containerClassName?: string;
  contentClassName?: string;
}

export default function PageLayout({
  children,
  headerClassName = '',
  footerClassName = '',
  navLinks = [],
  showHeader = true,
  showFooter = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  headerDarkLinks = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  headerShowBadge = false,
  containerClassName = '',
  contentClassName = '',
}: PageLayoutProps) {
  return (
    <div className={`main-container ${containerClassName}`}>
      {showHeader && <Header className={headerClassName} navLinks={navLinks} />}
      <main className={`main-content ${contentClassName}`}>{children}</main>
      {showFooter && <Footer className={footerClassName} />}
    </div>
  );
}
