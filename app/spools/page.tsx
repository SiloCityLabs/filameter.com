"use client";

import { JSX, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Spinner,
} from "react-bootstrap";
// --- Components ---
import CustomAlert from "@/components/_silabs/bootstrap/CustomAlert";
// --- DB ---
import deleteRow from "@/helpers/_silabs/pouchDb/deleteRow";
import getAllFilaments from "@/helpers/database/filament/getAllFilaments";
import getAllSettings from "@/helpers/database/settings/getAllSettings";
import { useDatabase } from "@/contexts/DatabaseContext";
// --- Icons ---
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
// --- Types ---
import type { sclSettings } from "@/types/_fw";
import type { Filament } from "@/types/Filament";

export default function SpoolsPage() {
  const { dbs, isReady } = useDatabase();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [data, setData] = useState<Filament[]>([]);
  const [sortKey, setSortKey] = useState<keyof Filament | null>("_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [settings, setSettings] = useState<sclSettings>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Effect to check for alert message from URL parameters on initial load
  useEffect(() => {
    const alert_msg = searchParams?.get("alert_msg") ?? "";

    if (alert_msg) {
      setShowAlert(true);
      setAlertMessage(decodeURIComponent(alert_msg));
      if (
        alert_msg.toLowerCase().includes("error") ||
        alert_msg.toLowerCase().includes("failed")
      ) {
        setAlertVariant("danger");
      } else {
        setAlertVariant("success");
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    async function fetchData() {
      if (!dbs.filament || !dbs.settings) {
        console.warn("Database instances not yet available.");
        return;
      }

      setIsLoading(true);
      let fetchedData: Filament[] = [];
      let fetchedSettings: sclSettings = {};

      try {
        // Fetch concurrently
        [fetchedData, fetchedSettings] = await Promise.all([
          getAllFilaments(dbs.filament),
          getAllSettings(dbs.settings),
        ]);
        setData(fetchedData);
        setSettings(fetchedSettings);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch initial data.";
        setAlertMessage(errorMessage);
        setShowAlert(true);
        setAlertVariant("danger");
        console.error("Data fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isReady) {
      fetchData();
    } else {
      setIsLoading(true);
    }
  }, [dbs, isReady]);

  // --- Event Handlers ---
  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      setAlertMessage("Cannot delete: Invalid filament ID.");
      setAlertVariant("danger");
      setShowAlert(true);
      return;
    }

    if (
      !window.confirm(`Are you sure you want to delete filament ID: ${id}?`)
    ) {
      return;
    }

    if (!dbs.filament) {
      setAlertMessage("Database not available for deletion.");
      setAlertVariant("warning");
      setShowAlert(true);
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteRow(dbs.filament, id, "filament");
      setShowAlert(true);
      if (success) {
        setAlertMessage("Filament deleted successfully.");
        setAlertVariant("success");
        setData((currentData) => currentData.filter((f) => f._id !== id));
        const newTotalItems = filteredFilaments.length - 1;
        const maxPage = Math.max(1, Math.ceil(newTotalItems / itemsPerPage));
        if (currentPage > maxPage) {
          setCurrentPage(maxPage);
        }
      } else {
        setAlertMessage("Filament not found or deletion failed.");
        setAlertVariant("warning");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete filament.";
      setAlertVariant("danger");
      setAlertMessage(errorMessage);
      setShowAlert(true);
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSortClick = (key: keyof Filament) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  // --- Data Processing (Filtering, Sorting, Pagination) ---
  const filteredFilaments = data.filter((filament) => {
    const searchString = searchTerm.toLowerCase().trim();
    if (!searchString) return true;

    return (
      filament._id?.toLowerCase().includes(searchString) ||
      filament.filament?.toLowerCase().includes(searchString) ||
      filament.material?.toLowerCase().includes(searchString) ||
      filament.location?.toLowerCase().includes(searchString)
    );
  });

  const sortedFilaments = [...filteredFilaments].sort((a, b) => {
    if (!sortKey) return 0;

    // Handle potential undefined values during sort
    const aValue = a[sortKey] ?? "";
    const bValue = b[sortKey] ?? "";

    let comparison = 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      // Basic comparison for mixed or other types
      comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedFilaments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(
    1,
    Math.ceil(sortedFilaments.length / itemsPerPage)
  ); // Ensure at least 1 page

  // --- Render Helpers ---
  const renderHeader = (key: keyof Filament, title: string) => {
    // Check if header should be rendered based on settings
    if (settings?.spoolHeaders && settings.spoolHeaders[title] === false) {
      return null;
    }

    return (
      <th
        className="text-center align-middle"
        style={{ cursor: "pointer" }}
        onClick={() => handleSortClick(key)}
      >
        {title}{" "}
        {sortKey === key ? (
          sortDirection === "asc" ? (
            "▲"
          ) : (
            "▼"
          )
        ) : (
          <span style={{ color: "lightgrey" }}>▲▼</span>
        )}
      </th>
    );
  };

  // Show loading spinner if fetching initial data or context isn't ready
  if (isLoading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading spools...</span>
        </Spinner>
        <p className="mt-2">Loading spools...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      <Row className="shadow-lg p-3 bg-body rounded">
        <Col xs={12} className="mb-3">
          <CustomAlert
            variant={alertVariant}
            message={alertMessage}
            show={showAlert}
            onClose={() => setShowAlert(false)}
          />
        </Col>

        <Col xs={12} md={8} className="mb-2">
          <Form.Control
            type="text"
            placeholder="Search by ID, Name, Material, Location..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="sm"
          />
        </Col>
        <Col xs={12} md={4} className="text-md-end mb-2">
          <Link href="/manage-filament" passHref>
            <Button variant="primary" size="sm" className="w-50 w-md-auto">
              Add Filament
            </Button>
          </Link>
        </Col>

        <Col xs={12}>
          <div className="table-responsive">
            <Table striped bordered hover size="sm" className="align-middle">
              <thead>
                <tr>
                  {renderHeader("_id", "ID")}
                  {renderHeader("filament", "Filament")}
                  {renderHeader("material", "Material")}
                  {renderHeader("used_weight", "Used (g)")}
                  {renderHeader("total_weight", "Total (g)")}
                  {renderHeader("calc_weight", "Remaining (g)")}
                  {renderHeader("location", "Location")}
                  {renderHeader("comments", "Comments")}
                  <th className="text-center align-middle">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isDeleting && (
                  <tr>
                    <td colSpan={9} className="text-center text-muted">
                      <Spinner animation="border" size="sm" className="me-2" />{" "}
                      Deleting...
                    </td>
                  </tr>
                )}
                {!isDeleting && currentItems.length > 0
                  ? currentItems.map((filament) => (
                      <tr key={`filament-${filament._id}`}>
                        {(!settings?.spoolHeaders ||
                          settings.spoolHeaders["ID"] !== false) && (
                          <td className="text-center">
                            <OverlayTrigger
                              placement="top"
                              delay={{ show: 400, hide: 250 }}
                              overlay={
                                <Tooltip style={{ position: "fixed" }}>
                                  {filament._id || "N/A"}
                                </Tooltip>
                              }
                            >
                              <span style={{ cursor: "help" }}>
                                {filament._id
                                  ? `${filament._id.substring(0, 5)}...`
                                  : "N/A"}
                              </span>
                            </OverlayTrigger>
                          </td>
                        )}
                        {(!settings?.spoolHeaders ||
                          settings.spoolHeaders["Filament"] !== false) && (
                          <td className="text-center">{filament.filament}</td>
                        )}
                        {(!settings?.spoolHeaders ||
                          settings.spoolHeaders["Material"] !== false) && (
                          <td className="text-center">{filament.material}</td>
                        )}
                        {(!settings?.spoolHeaders ||
                          settings.spoolHeaders["Used (g)"] !== false) && (
                          <td className="text-center">
                            {filament.used_weight}
                          </td>
                        )}
                        {(!settings?.spoolHeaders ||
                          settings.spoolHeaders["Total (g)"] !== false) && (
                          <td className="text-center">
                            {filament.total_weight}
                          </td>
                        )}
                        {(!settings?.spoolHeaders ||
                          settings.spoolHeaders["Remaining (g)"] !== false) && (
                          <td className="text-center">
                            {filament?.calc_weight ?? ""}
                          </td>
                        )}
                        {(!settings?.spoolHeaders ||
                          settings.spoolHeaders["Location"] !== false) && (
                          <td className="text-center">{filament.location}</td>
                        )}
                        {(!settings?.spoolHeaders ||
                          settings.spoolHeaders["Comments"] !== false) && (
                          <td className="text-center">
                            {filament.comments &&
                            filament.comments.length > 20 ? (
                              <OverlayTrigger
                                placement="top"
                                delay={{ show: 400, hide: 250 }}
                                overlay={
                                  <Tooltip style={{ position: "fixed" }}>
                                    {filament.comments}
                                  </Tooltip>
                                }
                              >
                                <span
                                  style={{ cursor: "help" }}
                                >{`${filament.comments.substring(
                                  0,
                                  17
                                )}...`}</span>
                              </OverlayTrigger>
                            ) : (
                              filament.comments
                            )}
                          </td>
                        )}

                        <td className="text-center">
                          <div className="d-flex justify-content-center align-items-center flex-nowrap">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip style={{ position: "fixed" }}>
                                  Edit
                                </Tooltip>
                              }
                            >
                              <Link
                                href={`/manage-filament?id=${filament._id}`}
                                passHref
                              >
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-1 py-0 px-1"
                                >
                                  <FontAwesomeIcon icon={faPenToSquare} />
                                </Button>
                              </Link>
                            </OverlayTrigger>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip style={{ position: "fixed" }}>
                                  Delete
                                </Tooltip>
                              }
                            >
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="me-1 py-0 px-1"
                                onClick={() => handleDelete(filament._id)}
                                disabled={isDeleting}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip style={{ position: "fixed" }}>
                                  Duplicate
                                </Tooltip>
                              }
                            >
                              <Link
                                href={`/manage-filament?id=${filament._id}&type=duplicate`}
                                passHref
                              >
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="py-0 px-1"
                                >
                                  <FontAwesomeIcon icon={faCopy} />
                                </Button>
                              </Link>
                            </OverlayTrigger>
                          </div>
                        </td>
                      </tr>
                    ))
                  : !isDeleting && (
                      <tr>
                        <td
                          colSpan={9}
                          className="text-center fst-italic text-muted"
                        >
                          No spools found matching your criteria.
                        </td>
                      </tr>
                    )}
              </tbody>
            </Table>
          </div>
        </Col>

        {/* Pagination and Items Per Page Selector */}
        {!isLoading && sortedFilaments.length > itemsPerPage && (
          <Col
            xs={12}
            className="d-flex justify-content-between align-items-center mt-3"
          >
            <Pagination size="sm" className="mb-0">
              <Pagination.Prev
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              />

              <Pagination.Item active>{currentPage}</Pagination.Item>
              {currentPage < totalPages && <Pagination.Ellipsis disabled />}
              {currentPage < totalPages && (
                <Pagination.Item onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </Pagination.Item>
              )}

              <Pagination.Next
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              />
            </Pagination>

            {/* Items per page selector */}
            <div className="d-flex align-items-center">
              <span className="me-2 text-muted" style={{ fontSize: "0.8rem" }}>
                Items/page:
              </span>
              <Form.Select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                size="sm"
                style={{ width: "auto" }}
                aria-label="Items per page"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Form.Select>
            </div>
          </Col>
        )}
      </Row>
    </Container>
  );
}
