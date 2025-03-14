import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
//Components
import CustomAlert from "@/components/_silabs/bootstrap/CustomAlert";
//DB
import deleteFilament from "@/helpers/filament/deleteFilament";
import getAllFilaments from "@/helpers/filament/getAllFilaments";
import { useDatabase } from "@/contexts/DatabaseContext";
//Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";

export default function Spools() {
  const { db, isReady } = useDatabase();
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("success"); // Defaulted to success
  const [alertMessage, setAlertMessage] = useState("");
  const [filaments, setFilaments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const alert_msg = urlParams.get("alert_msg");

    if (alert_msg) {
      setShowAlert(true);
      setAlertMessage(alert_msg);
      if (
        alert_msg.toLowerCase().includes("error") ||
        alert_msg.toLowerCase().includes("failed")
      ) {
        setAlertVariant("danger");
      }
    }
  }, []);

  useEffect(() => {
    async function fetchFilaments() {
      if (db) {
        try {
          const allFilaments = await getAllFilaments(db);
          setFilaments(allFilaments);
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch filaments.";
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    }
    // Only fetch if DB is ready
    if (isReady) {
      fetchFilaments();
    }
  }, [db, isReady]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this filament?")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    if (db) {
      try {
        const success = await deleteFilament(db, id);
        setShowAlert(true); //  Show alert in either case
        if (success) {
          setAlertMessage("Filament deleted successfully.");
          setAlertVariant("success");
          // Update the list of filaments after deletion
          const updatedFilaments = await getAllFilaments(db);
          setFilaments(updatedFilaments);
        } else {
          setAlertMessage("Filament not found or deletion failed.");
          setAlertVariant("danger");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete filament.";
        setError(errorMessage);
        setAlertVariant("danger");
        setAlertMessage(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sortFilaments = (filamentsToSort: any[]) => {
    if (!sortKey) return filamentsToSort;

    return [...filamentsToSort].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      } else {
        const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        return sortDirection === "asc" ? comparison : -comparison;
      }
    });
  };

  const handleSortClick = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedFilaments = sortFilaments(filaments);

  const renderHeader = (key: string, title: string) => {
    return (
      <th
        className="text-center"
        style={{ cursor: "pointer" }}
        onClick={() => handleSortClick(key)}
      >
        {title} {sortKey === key ? (sortDirection === "asc" ? "▲" : "▼") : "▲▼"}
      </th>
    );
  };

  const renderAction = (tooltip: string, element: JSX.Element) => {
    return (
      <OverlayTrigger
        placement="bottom"
        delay={{ show: 250, hide: 400 }}
        overlay={<Tooltip style={{ position: "fixed" }}>{tooltip}</Tooltip>}
      >
        {element}
      </OverlayTrigger>
    );
  };

  if (isLoading || !isReady) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>FilaMeter - Spools</title>
        <meta name="description" content="" />
        <meta name="keywords" content="" />
      </Head>
      <div className="main-container">
        <Header showBadge={true} />
        <Container className="main-content">
          <Row className="shadow-lg p-3 bg-body rounded mt-4">
            <Col>
              <CustomAlert
                variant={alertVariant}
                message={alertMessage}
                show={showAlert}
                onClose={() => setShowAlert(false)}
              />
            </Col>
            <Col xs={12} className="text-end mb-2">
              <Button variant="primary" href="/manage-filament" size="sm">
                Add Filament
              </Button>
            </Col>
            <Col xs={12}>
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      {renderHeader("_id", "ID")}
                      {renderHeader("filament", "Filament")}
                      {renderHeader("material", "Material")}
                      {renderHeader("used_weight", "Used Weight")}
                      {renderHeader("total_weight", "Total Weight")}
                      {renderHeader("calc_weight", "Weight Left")}
                      {renderHeader("location", "Location")}
                      {renderHeader("comments", "Comments")}
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFilaments.length > 0 ? (
                      sortedFilaments.map((filament) => (
                        <tr key={`filament-${filament._id}`}>
                          <td className="text-center">
                            <OverlayTrigger
                              placement="bottom"
                              delay={{ show: 250, hide: 400 }}
                              overlay={
                                <Tooltip style={{ position: "fixed" }}>
                                  {filament._id}
                                </Tooltip>
                              }
                            >
                              <span>
                                {filament._id.length > 5
                                  ? filament._id.substring(0, 5) + "..."
                                  : filament._id}
                              </span>
                            </OverlayTrigger>
                          </td>
                          <td className="text-center">{filament.filament}</td>
                          <td className="text-center">{filament.material}</td>
                          <td className="text-center">
                            {filament.used_weight}
                          </td>
                          <td className="text-center">
                            {filament.total_weight}
                          </td>
                          <td className="text-center">
                            {filament.calc_weight}
                          </td>
                          <td className="text-center">{filament.location}</td>
                          <td className="text-center">{filament.comments}</td>
                          <td className="text-center">
                            {renderAction(
                              "Edit",
                              <a href={`/manage-filament?id=${filament._id}`}>
                                <FontAwesomeIcon icon={faPenToSquare} />
                              </a>
                            )}
                            <br className="d-md-none" />{" "}
                            {renderAction(
                              "Delete",
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDelete(filament._id);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </a>
                            )}
                            <br className="d-md-none" />{" "}
                            {renderAction(
                              "Duplicate",
                              <a
                                href={`/manage-filament?id=${filament._id}&type=duplicate`}
                              >
                                <FontAwesomeIcon icon={faCopy} />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center">
                          No Rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
