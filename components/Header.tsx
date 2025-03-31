"use client";
import { Container, Nav, Navbar, Badge } from "react-bootstrap";
import React from "react";

interface HeaderProps {
  className?: string;
  navLinks?: { label: string; href: string; target?: string }[];
  darkLinks?: boolean;
  showBadge?: boolean;
}

const defaultNavLinks = [
  { label: "Home", href: "/", target: "" },
  { label: "Spools", href: "/spools", target: "" },
  { label: "Settings", href: "/settings", target: "" },
  { label: "Feedback", href: "/feedback", target: "" },
  {
    label: "Products",
    href: "https://shop.silocitylabs.com/collections/filameter",
    target: "",
  },
  {
    label: "GitHub",
    href: process.env.NEXT_PUBLIC_APP_GITHUB_URL,
    target: "_blank",
  },
];

function Header(props: HeaderProps) {
  const {
    className,
    navLinks = defaultNavLinks,
    darkLinks = false,
    showBadge = false,
  } = props;

  return (
    <Navbar
      id="main-header"
      expand="lg"
      bg="dark"
      data-bs-theme="dark"
      className={`${className}`}
    >
      <Container>
        <Navbar.Brand
          href="/"
          className="position-relative d-flex align-items-center"
        >
          {showBadge && (
            <Badge
              bg="warning"
              text="dark"
              style={{ fontSize: ".6rem", marginRight: "0.5rem" }}
            >
              {process.env.NEXT_PUBLIC_NAVBAR_BRAND_BADGE}
            </Badge>
          )}
          <div>
            {process.env.NEXT_PUBLIC_APP_NAME}
            {process.env.NEXT_PUBLIC_NAVBAR_BRAND_SUBTITLE && (
              <span className="navbar-subtitle">
                {process.env.NEXT_PUBLIC_NAVBAR_BRAND_SUBTITLE}
              </span>
            )}
          </div>
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className={darkLinks ? "black-toggler" : ""}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {navLinks.map((link, index) => (
              <Nav.Link
                key={index}
                href={link.href}
                target={link.target ? link.target : "_self"}
              >
                {link.label}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
