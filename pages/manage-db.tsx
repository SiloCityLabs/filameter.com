import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, Row, Col, Button } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { initializeFilamentDB } from "@/helpers/filament/initializeFilamentDB";
import { migrateFilamentDB } from "@/helpers/filament/migrateFilamentDB";
import { exportPouchDB } from "@/helpers/exportPouchDB";

export default function ManageDatabase() {
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    setIsLoading(false);

    async function init() {
      const initializedDb = await initializeFilamentDB();
      setDb(initializedDb);
      if (initializedDb) {
        await migrateFilamentDB(initializedDb);
      }
    }
    init();
  }, []);

  const handleClick = async () => {
    setIsSpinning(true);
    console.log("hellooo");
    exportPouchDB(db);
    setTimeout(() => {
      setIsSpinning(false);
    }, 1000);
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Manage Database`}</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="" />
        <meta name="keywords" content="" />
      </Head>
      <div className="main-container">
        <Header showBadge={true} />
        <Container className="main-content mt-3">
          <Row className="shadow-lg p-3 bg-body rounded">
            <Col className="text-center">
              <Button
                variant="success"
                className="w-50 me-2"
                disabled={isSpinning}
                onClick={isSpinning ? undefined : handleClick}
              >
                {isSpinning ? "Exporting Database..." : "Export Database"}
              </Button>
            </Col>
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
