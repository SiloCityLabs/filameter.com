import Head from "next/head";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
//Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
//Tmp data
import data from "@/json/tmp-data.json";

export default function InventoryList() {
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
                  <Button variant="success" href="/add-filament" size="sm">
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
                        {Object.keys(data).map((key) => (
                          <tr key={key}>
                            <td className="text-center">{data[key].ID}</td>
                            <td className="text-center">
                              {data[key].Filament}
                            </td>
                            <td className="text-center">
                              {data[key].Material}
                            </td>
                            <td className="text-center">
                              {data[key].Used_Weight}
                            </td>
                            <td className="text-center">
                              {data[key].Location}
                            </td>
                            <td className="text-center">
                              {data[key].Comments}
                            </td>
                            <td className="text-center">
                              <a
                                href={`/edit-filament?ID=${data[key].ID}`}
                                className="me-2"
                              >
                                <FontAwesomeIcon icon={faPenToSquare} />
                              </a>
                              {/* TODO: Make This a function call */}
                              <a href={`/delete-filament/${key}`}>
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
