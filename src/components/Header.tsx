'use client';

// --- React and Next.js ---
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- Components ---
import { Container, Nav, Navbar, Image } from 'react-bootstrap';

// --- Styles ---
import styles from '@/public/styles/components/Header.module.css';

interface NavLink {
  label: string;
  href: string;
  target?: string;
}

interface Props {
  className?: string;
  navLinks?: NavLink[];
}

const defaultNavLinks: NavLink[] = [
  { label: 'Home', href: '/', target: '' },
  { label: 'Spools', href: '/spools', target: '' },
  { label: 'Settings', href: '/settings', target: '' },
  { label: 'FAQ', href: '/faq', target: '' },
  { label: 'Feedback', href: '/feedback', target: '' },
  {
    label: 'Products',
    href: 'https://shop.silocitylabs.com/collections/filameter',
    target: '_blank',
  },
];

export default function Header({ className, navLinks }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const finalNavLinks = navLinks && navLinks.length > 0 ? navLinks : defaultNavLinks;

  return (
    <Navbar
      id='site-header'
      expand='lg'
      fixed='top'
      className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''} ${className}`}>
      <Container>
        <Navbar.Brand as={Link} href='/' className='d-flex align-items-center'>
          <Image
            src='/images/logos/filameter-banner-slim-blue.webp'
            alt='FilaMeter Logo'
            className={styles.logo}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = 'https://placehold.co/120x40/117ace/ffffff?text=FilaMeter';
              e.currentTarget.onerror = null;
            }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' className={styles.navbarToggler} />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className={`ms-auto ${styles.mainNav}`}>
            {finalNavLinks.map((link) => (
              <Nav.Link
                key={link.href}
                as={link.target === '_blank' ? 'a' : Link}
                href={link.href}
                target={link.target}
                rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                className={styles.navLink}
                active={pathname === link.href}>
                {link.label}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
