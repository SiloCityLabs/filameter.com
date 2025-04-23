// --- React ---
import { Container, Row, Col, Button } from "react-bootstrap";
// --- Layout ---
import PageLayout from "@/components/PageLayout";

export default function HomePage() {
  return (
    <PageLayout headerShowBadge={true}>
      <Container className="mt-3 mb-3">
        <Row className="shadow-lg p-3 bg-body rounded">
          <Col className="text-center">
            <p>
              FilaMeter is a web app designed to help you efficiently track and
              manage your 3D printer filament spools. It acts as a simple yet
              powerful database for organizing your spools, tracking their
              material type, usage, and storage location—all from within your
              browser.
            </p>
            <p>
              Built using PouchDB and LocalStorage, FilaMeter prioritizes local
              data storage, meaning your records stay on your device without
              requiring a server. While an internet connection may be needed for
              certain resources, the core functionality runs directly in the
              browser.
            </p>
            <p>
              The app allows you to easily log new spools, update filament
              usage, and add notes for better organization. Each spool entry
              includes fields for filament name, material type, used weight,
              location, and comments, with quick edit and delete actions to keep
              your inventory up to date.
            </p>
            <p>
              Whether you&apos;re managing a few spools or an extensive
              collection, FilaMeter helps you stay organized and in control of
              your 3D printing materials.
            </p>
            <Button variant="primary" href="/spools" size="sm" className="mt-3">
              Manage Filament
            </Button>{" "}
            <br /> <br />
            <p style={{ maxWidth: "600px", margin: "0 auto" }}>
              <a href="https://shop.silocitylabs.com/discount/1GHIW2TI?redirect=%2Fproducts%2Ffilameter-labels%3Fvariant%3D50812497920300">
                Get 5 Free QR Labels for Your Filament Spools!
              </a>{" "}
              🎉 <br />
              Easily track and manage your filament spools with Filameter QR
              Labels. Scan, log, and monitor your filament usage with a simple
              tap. To help you get started, we&apos;re giving away 5 free
              labels—no strings attached! <br /> <br />
              Hurry—one use per customer while supplies last!
            </p>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
}
