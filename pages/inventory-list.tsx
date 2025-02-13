import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
//DB
import getAllFilaments from "@/helpers/getAllFilaments";
import { initializeFilamentDB } from "@/helpers/initializeFilamentDB";
//Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function InventoryList() {
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [filaments, setFilaments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const initializedDb = await initializeFilamentDB();
      setDb(initializedDb);
    }
    init();
  }, []);

  useEffect(() => {
    async function fetchFilaments() {
      if (db) {
        try {
          const allFilaments = await getAllFilaments(db);
          setFilaments(allFilaments);
        } catch (err: unknown) {
          if (typeof err === "string") {
            setError(err);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Failed to fetch filaments.");
          }
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchFilaments();
  }, [db]);

  //deleteFilament
  const deleteFilament = async (ID: number) => {
    console.log("DELETE: ", ID);
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Filameter - Inventory List</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="" />
        <meta name="keywords" content="" />
      </Head>
      <div className="main-container">
        <Header />
        <Container className="main-content">
          <Row className="shadow-lg p-3 bg-body rounded mt-4">
            <Col className="text-right">
              <Row>
                <Col className="mb-2">
                  <Button variant="primary" href="/add-filament" size="sm">
                    Add Filament
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col className="text-center">
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th className="text-center">ID</th>
                          <th className="text-center">Filament</th>
                          <th className="text-center">Material</th>
                          <th className="text-center">Used Weight</th>
                          <th className="text-center">Location</th>
                          <th className="text-center">Comments</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filaments.map((filament) => (
                          <tr key={`filament-${filament._id}`}>
                            <td className="text-center">{filament._id}</td>
                            <td className="text-center">{filament.filament}</td>
                            <td className="text-center">{filament.material}</td>
                            <td className="text-center">
                              {filament.used_weight}
                            </td>
                            <td className="text-center">{filament.location}</td>
                            <td className="text-center">{filament.comments}</td>
                            <td className="text-center">
                              <a
                                href={`/edit-filament?id=${filament._id}`}
                                className="me-2"
                              >
                                <FontAwesomeIcon icon={faPenToSquare} />
                              </a>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  deleteFilament(filament._id);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
