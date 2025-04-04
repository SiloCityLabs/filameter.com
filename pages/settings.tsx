import { useState } from "react";
import Head from "next/head";
import { Container, Row, Col, Tabs, Tab } from "react-bootstrap";
import Header from "@/components/Header";
//Components
import ImportExport from "@/components/settings/ImportExport";
import MainSettings from "@/components/settings/MainSettings";
import Sync from "@/components/settings/Sync";

export default function Settings() {
  const [key, setKey] = useState<string>("settings");

  return (
    <>
      <Head>
        <title>FilaMeter - Settings</title>
        <meta name="description" content="" />
        <meta name="keywords" content="" />
      </Head>
      <Header />
      <Container fluid>
        <Row>
          <Col>
            <Container className="shadow-lg p-3  mt-4 bg-body rounded">
              <Tabs
                id="controlled-tab-example"
                activeKey={key}
                onSelect={(k) => setKey(k ?? "settings")}
                className="mb-3"
              >
                <Tab eventKey="settings" title="Settings">
                  <MainSettings />
                </Tab>
                <Tab eventKey="import-export" title="Import/Export">
                  <ImportExport />
                </Tab>
                <Tab eventKey="scl-sync" title="Cloud Sync">
                  <Sync />
                </Tab>
              </Tabs>
            </Container>
          </Col>
        </Row>
      </Container>
    </>
  );
}
