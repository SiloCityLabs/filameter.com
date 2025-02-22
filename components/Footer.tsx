import React from "react";
import { Nav } from "react-bootstrap";
import Image from "next/image";

const footer = {
  copyright: {
    name: "SiloCityLabs",
    url: "https://silocitylabs.com/",
  },
  site: {
    name: "filameter.com",
    url: "https://filameter.com/",
  },
}
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
            ©2025 Copyright: {footer.copyright.name}
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/terms">Terms</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/privacy">Privacy Policy</Nav.Link>
          </Nav.Item>
        </Nav>
        <div className="text-center p-3">
          <a
            property="dct:title"
            rel="cc:attributionURL"
            href={footer.site.url}
          >
            {footer.site.name}
          </a>{" "}
          by{" "}
          <a
            rel="cc:attributionURL dct:creator"
            property="cc:attributionName"
            href={footer.copyright.url}
          >
            {footer.copyright.name}
          </a>{" "}
          is licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1"
            target="_blank"
            rel="license noopener noreferrer"
            style={{
              display: "inline-block",
            }}
          >
            CC BY-NC-SA 4.0
            {images.map((image, index) => (
              <Image
                key={index}
                src={image.src}
                alt={image.alt}
                width={22}
                height={22}
                style={{
                  marginLeft: "3px",
                  verticalAlign: "text-bottom",
                }}
              />
            ))}
          </a>
        </div>
      </footer>
      <span style={{ display: "none" }} attr-type="author">
        Bana0615
      </span>
    </>
  );
}

export default Footer;
