import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
//Components
import CustomAlert from "@/components/bootstrap/CustomAlert";
//DB
import deleteFilament from "@/helpers/filament/deleteFilament";
import getAllFilaments from "@/helpers/filament/getAllFilaments";
import { initializeFilamentDB } from "@/helpers/filament/initializeFilamentDB";
//Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function InventoryList() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [db, setDb] = useState(null);
  const [filaments, setFilaments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
  const handleDelete = async (id: string) => {
    setIsLoading(true);
    setError(null);
    if (db) {
      try {
        const success = await deleteFilament(db, id);
        if (success) {
          setShowAlert(true);
          setAlertMessage("Filament deleted successfully.");
          // Update the list of filaments after deletion
          const updatedFilaments = await getAllFilaments(db);
          setFilaments(updatedFilaments);
        } else {
          console.log("");
          setShowAlert(true);
          setAlertMessage("Filament not found or not deleted.");
          setAlertVariant("danger");
        }
      } catch (err: unknown) {
        if (typeof err === "string") {
          setError(err);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to delete filament.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sortFilaments = (filamentsToSort: any) => {
    if (!sortKey) return filamentsToSort; // No sorting needed

    const sortedFilaments = [...filamentsToSort].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue); // String comparison
        return sortDirection === "asc" ? comparison : -comparison;
      } else {
        const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0; // Numeric or other comparison
        return sortDirection === "asc" ? comparison : -comparison;
      }
    });
    return sortedFilaments;
  };

  const handleSortClick = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc"); // Default to ascending order for new sorts
    }
  };

  const sortedFilaments = sortFilaments(filaments);

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
            <CustomAlert
              variant={alertVariant ? alertVariant : "success"}
              message={alertMessage}
              show={showAlert}
              onClose={() => setShowAlert(false)}
            />
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
                          <th
                            className="text-center"
                            onClick={() => handleSortClick("_id")}
                          >
                            ID{" "}
                            {sortKey === "_id"
                              ? sortDirection === "asc"
                                ? "▲"
                                : "▼"
                              : "▲▼"}
                          </th>

                          <th
                            className="text-center"
                            onClick={() => handleSortClick("filament")}
                          >
                            Filament{" "}
                            {sortKey === "filament"
                              ? sortDirection === "asc"
                                ? "▲"
                                : "▼"
                              : "▲▼"}
                          </th>
                          <th
                            className="text-center"
                            onClick={() => handleSortClick("material")}
                          >
                            Material{" "}
                            {sortKey === "material"
                              ? sortDirection === "asc"
                                ? "▲"
                                : "▼"
                              : "▲▼"}
                          </th>
                          <th
                            className="text-center"
                            onClick={() => handleSortClick("used_weight")}
                          >
                            Used Weight{" "}
                            {sortKey === "used_weight"
                              ? sortDirection === "asc"
                                ? "▲"
                                : "▼"
                              : "▲▼"}
                          </th>
                          <th
                            className="text-center"
                            onClick={() => handleSortClick("location")}
                          >
                            Location{" "}
                            {sortKey === "location"
                              ? sortDirection === "asc"
                                ? "▲"
                                : "▼"
                              : "▲▼"}
                          </th>
                          <th
                            className="text-center"
                            onClick={() => handleSortClick("comments")}
                          >
                            Comments{" "}
                            {sortKey === "comments"
                              ? sortDirection === "asc"
                                ? "▲"
                                : "▼"
                              : "▲▼"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedFilaments.map((filament) => (
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
                                  handleDelete(filament._id);
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
