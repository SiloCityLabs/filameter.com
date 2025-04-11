"use client";

import { useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
// --- Components ---
import ImportExport from "@/components/settings/ImportExport";
import MainSettings from "@/components/settings/MainSettings";
import Sync from "@/components/settings/Sync";

export default function SettingsTabs() {
  const [key, setKey] = useState<string>("settings");

  return (
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
  );
}
