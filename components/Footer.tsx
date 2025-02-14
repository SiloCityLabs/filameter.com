import React from "react";
import { Nav } from "react-bootstrap";
import Image from "next/image";

function Footer() {
  const images = [
    {
      src: "https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1",
      alt: "CC",
    },
    {
      src: "https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1",
      alt: "BY",
    },
    {
      src: "https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1",
      alt: "NC",
    },
    {
      src: "https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1",
      alt: "SA",
    },
  ];
  return (
    <>
      <footer className="bg-light text-center">
        <Nav className="justify-content-center flex-column flex-md-row">
          <Nav.Item
            style={{
              padding: "7px",
            }}
          >
            ©2025 Copyright: SiloCityLabs
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/terms">Terms</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/privacy">Privacy Policy</Nav.Link>
          </Nav.Item>
        </Nav>
      </footer>
      <span style={{ display: "none" }} attr-type="author">
        Bana0615
      </span>
    </>
  );
}

export default Footer;
