import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// Components
import CustomAlert from "@/components/_silabs/bootstrap/CustomAlert";
// DB
import getDocumentByColumn from "@/helpers/_silabs/pouchDb/getDocumentByColumn";
import { initializeFilamentDB } from "@/helpers/database/filament/initializeFilamentDB";
// Types
import { Filament } from "@/types/Filament";

const defaultValue: Filament = {
  filament: "",
  material: "",
  used_weight: 0,
  location: "",
  comments: "",
};

export default function SpoolSenseImport() {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [db, setDb] = useState<any>(null);
  const [filamentId, setFilamentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!router.isReady) return;

    const currentId = router.query.id as string | undefined;

    if (!currentId) {
      setError(true);
      setShowAlert(true);
      setAlertMessage("Missing Data");
      setAlertVariant("danger");
      setIsLoading(false);
      return;
    }

    setFilamentId(currentId);

    (async () => {
      const initializedDb = await initializeFilamentDB();
      setDb(initializedDb);
    })();
  }, [router.isReady]);

  const fetchFilament = async (id: string) => {
    if (!db) return;

    setIsLoading(true);
    setError(false);

    try {
      const fetchedFilament = await getDocumentByColumn(
        db,
        "_id",
        id,
        "filament"
      );

      const filamentDoc = Array.isArray(fetchedFilament) ? fetchedFilament[0] : null;

      if (!filamentDoc) {
        router.push(`/manage-filament?id=${id}&type=create`);
      } else {
        router.push(`/manage-filament?id=${id}`);
      }
    } catch (err: any) {
      setShowAlert(true);
      setAlertMessage(err?.message || "Failed to fetch filament.");
      setAlertVariant("danger");
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (filamentId && db) {
      fetchFilament(filamentId);
    }
  }, [filamentId, db]);

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Spool Sense QR Scan</title>
        <meta name="description" content="This page could not be found." />
      </Head>
      <div className="main-container">
        <Header showBadge={true} />
        <Container className="main-content" fluid>
          <Row>
            <Col>
              <h2 className="text-center my-2">Spool Sense QR Scan</h2>
              <Container
                id="about-us"
                className="shadow-lg p-3 mb-5 bg-body rounded text-center"
              >
                <Row className="justify-content-md-center">
                  <CustomAlert
                    variant={alertVariant}
                    message={alertMessage}
                    show={showAlert}
                    onClose={() => setShowAlert(false)}
                  />
                  {!error && (
                    <Col lg={8}>
                      <div className="text-center">
                        Updating... <br />
                        {[...Array(10)].map((_, i) => (
                          <Spinner key={i} animation="grow" size="sm" />
                        ))}
                      </div>
                    </Col>
                  )}
                </Row>
              </Container>
            </Col>
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
