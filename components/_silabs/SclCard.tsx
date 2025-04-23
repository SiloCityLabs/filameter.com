"use client";

import { Card, Button } from "react-bootstrap";
import Link from "next/link";

type CardProps = {
  title: string;
  variant: string;
  text: string;
  buttons: {
    link: string;
    disabled: boolean;
    btnText: string;
  }[];
};

export default function SclCard(props: CardProps) {
  return (
    <Card
      style={{ width: "18rem" }}
      className="mx-auto h-100 d-flex flex-column"
    >
      <Card.Body className="d-flex flex-column flex-grow-1">
        <Card.Title>{props.title}</Card.Title>
        <Card.Text className="mb-3">{props.text}</Card.Text>
        <div className="d-grid gap-2 mt-auto">
          {props.buttons.map((button, index) => (
            <Link key={index} href={button.link} passHref>
              <Button
                key={index}
                variant={props.variant}
                size="sm"
                disabled={button.disabled}
                className="w-100"
              >
                {button.btnText}
              </Button>
            </Link>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
