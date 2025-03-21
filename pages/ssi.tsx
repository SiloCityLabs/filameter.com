import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
//Components
import CustomAlert from "@/components/_silabs/bootstrap/CustomAlert";
//DB
import getDocumentByColumn from "@/helpers/_silabs/pouchDb/getDocumentByColumn";
import { initializeFilamentDB } from "@/helpers/database/filament/initializeFilamentDB";
import { save } from "@/helpers/_silabs/pouchDb/save";
import { filamentSchema } from "@/helpers/database/filament/initializeFilamentDB";
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

    if (
      (currentId === null && usedWeight === null) ||
      (currentId != null && usedWeight === null)
    ) {
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
        const fetchedFilament = await getDocumentByColumn(
          db,
          "_id",
          id,
          "filament"
        );
        //No id = Create new filament and prefill used_weight
        if (fetchedFilament[0] === null) {
          router.push(
            `/manage-filament?used_weight=${used}&id=${id}&type=create`
          );
          return;
        }

        //Update used_weight
        fetchedFilament[0].used_weight = used;
        setFilament(fetchedFilament[0]);

        //Update Data
        const result = await save(
          db,
          fetchedFilament[0],
          filamentSchema,
          "filament"
        );

        if (result.success) {
          setShowAlert(true);
          setAlertVariant("success");
          setAlertMessage(`Filament updated successfully`);
          router.replace(
            `/spools?alert_msg=Filament ${id} updated successfully`
          );
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
    return <div className="text-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Spool Sense Import</title>
        <meta name="description" content="This page could not be found." />
      </Head>
      <div className="main-container">
        <Header showBadge={true} />
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
