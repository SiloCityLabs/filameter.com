import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
//Components
import CustomAlert from "@/components/bootstrap/CustomAlert";
//DB
import getFilamentById from "@/helpers/filament/getFilamentById";
import { initializeFilamentDB } from "@/helpers/filament/initializeFilamentDB";
import { saveFilament } from "@/helpers/filament/saveFilament";
//Types
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
  const [db, setDb] = useState(null);
  const [filament, setFilament] = useState<Filament>(defaultValue);
  const [error, setError] = useState<boolean>(false);
  const [filamentId, setFilamentId] = useState<string | null>(null);
  const [usedWeight, setUsedWeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentId = urlParams.get("id");
    const usedWeight = urlParams.get("used");
    setFilamentId(currentId);
    if (usedWeight) {
      setUsedWeight(parseInt(usedWeight));
    }


    if ((currentId === null && usedWeight === null) || (currentId != null && usedWeight === null)) {
      setError(true);
      setShowAlert(true);
      setAlertMessage("Missing Data");
      setAlertVariant("danger");
      setIsLoading(false);
      return;
    }

    async function init() {
      const initializedDb = await initializeFilamentDB();
      setDb(initializedDb);
    }
    init();
  }, []);

  const fetchFilament = async (id: string, used: number) => {
    setIsLoading(true);
    setError(false);

    if (db) {
      try {
        const fetchedFilament = await getFilamentById(db, id);
        //No id = Create new filament and prefill used_weight
        if (fetchedFilament === null) {
          router.push(`/manage-filament?used_weight=${used}`);
          return;
        }

        //Update used_weight
        fetchedFilament.used_weight = used;
        setFilament(fetchedFilament);

        //Update Data
        const result = await saveFilament(db, fetchedFilament);

        if (result.success) {
          setShowAlert(true);
          setAlertVariant("success");
          setAlertMessage(`Filament updated successfully`);
          router.replace(`/inventory-list?alert_msg=Filament ${id} updated successfully`);
        } else {
          console.error(`Error: Filament not updating:`, result.error);
          setShowAlert(true);
          setAlertVariant("danger");
          setAlertMessage("Error updating filament.");
        }
      } catch (err: unknown) {
        let msg = "Failed to fetch filament.";
        if (typeof err === "string") {
          msg = err;
        } else if (err instanceof Error) {
          msg = err.message;
        }

        setShowAlert(true);
        setAlertMessage(msg);
        setAlertVariant("danger");
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (filamentId && db && usedWeight) {
      fetchFilament(filamentId, usedWeight);
    }
  }, [filamentId, db, usedWeight]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="text-center">Loading...</div>
    );
  }


  return (
    <>
      <Head>
        <title>Spool Sense Import</title>
        <meta name="description" content="This page could not be found." />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <div className="main-container">
        <Header />
        <Container className="main-content" fluid>
          <Row>
            <Col>
              <h2 className="text-center my-2">Spool Sense Import</h2>

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