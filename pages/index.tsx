import Head from "next/head";
import { Container, Row, Col } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>bootstrap-nextjs-github-pages</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="" />
        <meta name="keywords" content="" />
      </Head>
      <div className="main-container">
        <Header />
        <Container className="main-content">
          <Row>
            <p>FilaMeter is a web app designed to help you efficiently track and manage your 3D printer filament spools. It acts as a simple yet powerful database for organizing your spools, tracking their material type, usage, and storage location—all from within your browser.</p>
            <p>Built using PouchDB and LocalStorage, FilaMeter prioritizes local data storage, meaning your records stay on your device without requiring a server. While an internet connection may be needed for certain resources, the core functionality runs directly in the browser.</p>
            <p>The app allows you to easily log new spools, update filament usage, and add notes for better organization. Each spool entry includes fields for filament name, material type, used weight, location, and comments, with quick edit and delete actions to keep your inventory up to date.</p>
            <p>Whether you're managing a few spools or an extensive collection, FilaMeter helps you stay organized and in control of your 3D printing materials.</p>
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
