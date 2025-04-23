"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface NavLink {
  label: string;
  href: string;
  target?: string;
}

interface PageLayoutProps {
  children: React.ReactNode;
  headerClassName?: string;
  navLinks?: NavLink[];
  showHeader?: boolean;
  showFooter?: boolean;
  headerDarkLinks?: boolean;
  headerShowBadge?: boolean;
}

export default function PageLayout({
  children,
  headerClassName = "",
  navLinks = [],
  showHeader = true,
  showFooter = true,
  headerDarkLinks = false,
  headerShowBadge = false,
}: PageLayoutProps) {
  return (
    <div className="main-container">
      {showHeader && (
        <Header
          className={headerClassName}
          navLinks={navLinks}
          darkLinks={headerDarkLinks}
          showBadge={headerShowBadge}
        />
      )}
      <main className="main-content">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
