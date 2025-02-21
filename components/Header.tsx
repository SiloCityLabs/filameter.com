import { useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { generateGithubLink } from "@/helpers/_silabs/generateGithubLink";

interface HeaderProps {
  className?: string;
  navLinks?: { label: string; href: string; target?: string }[];
  darkLinks?: boolean;
}

const defaultNavLinks = [
  { label: "Home", href: "/", target: "" },
  { label: "Spools", href: "/spools", target: "" },
  {
    label: "SpoolSense",
    href: "https://shop.silocitylabs.com/products/spoolsense-a-filament-meter-for-your-spools-preorder",
    target: "",
  },
  {
    label: "GitHub",
    href: "https://github.com/SiloCityLabs/filameter.com",
    target: "_blank",
  },
];

function Header(props: HeaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { className, navLinks = defaultNavLinks, darkLinks = false } = props;

  const params = {
    title: "My New Issue",
    body: "This is a detailed description.\nWith multiple lines.",
    labels: ["bug", "help wanted"],
    assignees: "@Bana0615",
    milestone: 1,
    //template: "bug_report.md"
  };
  useEffect(() => {
    const feedbackLink = generateGithubLink(
      "Bana0615",
      "bootstrap-nextjs-github-pages",
      params
    );
    defaultNavLinks.push({
      label: "Feedback",
      href: feedbackLink,
      target: "_blank",
    });
    setIsLoading(false);
  }, []);

  return (
    <Navbar
      id="main-header"
      expand="lg"
      bg="dark"
      data-bs-theme="dark"
      className={`${className}`}
    >
      <Container>
        <Navbar.Brand href="/">
          Filameter
          <span className="navbar-subtitle">By SiloCityLabs</span>
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
