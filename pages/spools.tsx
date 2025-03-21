import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Container,
  Row,
  Col,
  Table,
  Form,
  Button,
  OverlayTrigger,
  Tooltip,
  Pagination,
} from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
//Components
import CustomAlert from "@/components/_silabs/bootstrap/CustomAlert";
//DB
import deleteFilament from "@/helpers/database/filament/deleteFilament";
import getAllFilaments from "@/helpers/database/filament/getAllFilaments";
import getAllSettings from "@/helpers/database/settings/getAllSettings";
import { useDatabase } from "@/contexts/DatabaseContext";
//Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";

export default function Spools() {
  const { dbs, isReady } = useDatabase();
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("success"); // Defaulted to success
  const [alertMessage, setAlertMessage] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [settings, setSettings] = useState<{ [key: string]: any }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    async function fetchData() {
      if (dbs.filament) {
        try {
          const allData = await getAllFilaments(dbs.filament);
          setData(allData);
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch data.";
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      }

      //Get settings
      if (dbs.settings) {
        try {
          const settings = await getAllSettings(dbs.settings);
          setSettings(settings);
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch settings.";
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    }
    // Only fetch if DB is ready
    if (isReady) {
      fetchData();
    }
  }, [dbs, isReady]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this filament?")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    if (dbs.filament) {
      try {
        const success = await deleteFilament(dbs.filament, id);
        setShowAlert(true); //  Show alert in either case
        if (success) {
          setAlertMessage("Filament deleted successfully.");
          setAlertVariant("success");
          // Update the list of filaments after deletion
          const updatedFilaments = await getAllFilaments(dbs.filament);
          setData(updatedFilaments);
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

  const sortFilaments = (dataToSort: any[]) => {
    if (!sortKey) return dataToSort;

    return [...dataToSort].sort((a, b) => {
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

  const sortedFilaments = sortFilaments(data);

  const filteredFilaments = sortedFilaments.filter((filament) => {
    const searchString = searchTerm.toLowerCase();
    return (
      filament._id.toLowerCase().includes(searchString) ||
      filament.filament.toLowerCase().includes(searchString) ||
      filament.material.toLowerCase().includes(searchString) ||
      filament.location.toLowerCase().includes(searchString)
    );
  });

  const renderHeader = (key: string, title: string) => {
    if (settings.spoolHeaders && settings.spoolHeaders[title]) {
      return (
        <th
          className="text-center"
          style={{ cursor: "pointer" }}
          onClick={() => {
            paginate(1);
            handleSortClick(key);
          }}
        >
          {title}{" "}
          {sortKey === key ? (sortDirection === "asc" ? "▲" : "▼") : "▲▼"}
        </th>
      );
    }
  };

  const renderAction = (
    tooltip: string,
    element: JSX.Element,
    buttonText: string,
    onClick?: () => void
  ) => {
    return (
      <>
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 400 }}
          overlay={<Tooltip style={{ position: "fixed" }}>{tooltip}</Tooltip>}
        >
          <span>
            <span className="d-none d-md-inline-block">{element}</span>{" "}
          </span>
        </OverlayTrigger>
        <Button
          variant="primary"
          size="sm"
          className="d-inline-block d-md-none mb-1"
          onClick={onClick}
        >
          {buttonText}
        </Button>
      </>
    );
  };

  if (isLoading || !isReady) {
    return <div className="text-center">Loading...</div>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFilaments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
            <Col xs={12}>
              <CustomAlert
                variant={alertVariant}
                message={alertMessage}
                show={showAlert}
                onClose={() => setShowAlert(false)}
              />
            </Col>
            <Col xs={12} md={8} className="text-end mb-2">
              <Form.Control
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  paginate(1);
                  setSearchTerm(e.target.value);
                }}
                size="sm"
              />
            </Col>
            <Col xs={12} md={4} className="text-end mb-2">
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
                    {currentItems.length > 0 ? (
                      currentItems.map((filament) => (
                        <tr key={`filament-${filament._id}`}>
                          {settings.spoolHeaders &&
                            settings.spoolHeaders["ID"] && (
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
                            )}
                          {settings.spoolHeaders &&
                            settings.spoolHeaders["Filament"] && (
                              <td className="text-center">
                                {filament.filament}
                              </td>
                            )}
                          {settings.spoolHeaders &&
                            settings.spoolHeaders["Material"] && (
                              <td className="text-center">
                                {filament.material}
                              </td>
                            )}
                          {settings.spoolHeaders &&
                            settings.spoolHeaders["Used Weight"] && (
                              <td className="text-center">
                                {filament.used_weight}
                              </td>
                            )}
                          {settings.spoolHeaders &&
                            settings.spoolHeaders["Total Weight"] && (
                              <td className="text-center">
                                {filament.total_weight}
                              </td>
                            )}
                          {settings.spoolHeaders &&
                            settings.spoolHeaders["Weight Left"] && (
                              <td className="text-center">
                                {filament.calc_weight}
                              </td>
                            )}
                          {settings.spoolHeaders &&
                            settings.spoolHeaders["Location"] && (
                              <td className="text-center">
                                {filament.location}
                              </td>
                            )}
                          {settings.spoolHeaders &&
                            settings.spoolHeaders["Comments"] && (
                              <td className="text-center">
                                {filament.comments}
                              </td>
                            )}
                          <td className="text-center">
                            {renderAction(
                              "Edit",
                              <a href={`/manage-filament?id=${filament._id}`}>
                                <FontAwesomeIcon icon={faPenToSquare} />
                              </a>,
                              "Edit",
                              () =>
                                (window.location.href = `/manage-filament?id=${filament._id}`)
                            )}
                            <br className="d-md-none" />
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
                              </a>,
                              "Delete",
                              () => handleDelete(filament._id)
                            )}
                            <br className="d-md-none" />
                            {renderAction(
                              "Duplicate",
                              <a
                                href={`/manage-filament?id=${filament._id}&type=duplicate`}
                              >
                                <FontAwesomeIcon icon={faCopy} />
                              </a>,
                              "Duplicate",
                              () =>
                                (window.location.href = `/manage-filament?id=${filament._id}&type=duplicate`)
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
            {filteredFilaments.length > 10 && (
              <Col
                xs={12}
                className="d-flex justify-content-between align-items-center"
              >
                <Pagination size="sm" className="mb-0">
                  {Array.from({
                    length: Math.ceil(filteredFilaments.length / itemsPerPage),
                  }).map((_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
                <Form.Select
                  className="m-0"
                  value={itemsPerPage}
                  onChange={(e) => {
                    paginate(1);
                    setItemsPerPage(Number(e.target.value));
                  }}
                  size="sm"
                  style={{ width: "auto" }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </Form.Select>
              </Col>
            )}
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
