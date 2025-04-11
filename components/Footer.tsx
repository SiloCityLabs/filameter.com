"use client";

import React from "react";
import { Nav } from "react-bootstrap";
import Image from "next/image";

function Footer() {
  const showLicense =
    process.env.NEXT_PUBLIC_FOOTER_SITE !== "" &&
    process.env.NEXT_PUBLIC_FOOTER_COPYRIGHT_URL !== "";
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
          {process.env.NEXT_PUBLIC_FOOTER_COPYRIGHT !== "" && (
            <Nav.Item
              style={{
                padding: "7px",
              }}
            >
              ©2025 Copyright: {process.env.NEXT_PUBLIC_FOOTER_COPYRIGHT}
            </Nav.Item>
          )}
          <Nav.Item>
            <Nav.Link href="/terms">Terms</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/privacy">Privacy Policy</Nav.Link>
          </Nav.Item>
        </Nav>
        {showLicense && (
          <div className="text-center p-3">
            <a
              property="dct:title"
              rel="cc:attributionURL"
              href={process.env.NEXT_PUBLIC_APP_URL}
            >
              {process.env.NEXT_PUBLIC_FOOTER_SITE}
            </a>{" "}
            by{" "}
            <a
              rel="cc:attributionURL dct:creator"
              property="cc:attributionName"
              href={process.env.NEXT_PUBLIC_FOOTER_COPYRIGHT_URL}
            >
              {process.env.NEXT_PUBLIC_FOOTER_COPYRIGHT}
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
        )}
      </footer>
      <span style={{ display: "none" }} attr-type="author">
        Bana0615
      </span>
    </>
  );
}

export default Footer;
