'use client';

// --- React ---
import { useState, useEffect } from 'react';
import { Row, Col, Nav, Tab, Card, Spinner } from 'react-bootstrap';
// --- Next ---
import { useSearchParams } from 'next/navigation';
// --- Styles ---
import styles from '@/public/styles/components/Settings.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSyncAlt, faFileImport } from '@fortawesome/free-solid-svg-icons';
// --- Components ---
import ImportExport from '@/components/settings/ImportExport';
import MainSettings from '@/components/settings/MainSettings';
import Sync from '@/components/settings/Sync';

export default function SettingsTabs() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string>('main');
  const [verifyKey, setVerifyKey] = useState<string>('');

  useEffect(() => {
    const keyParam = searchParams?.get('key') ?? '';
    if (keyParam) {
      setVerifyKey(keyParam);
      setActiveKey('sync'); // Switch to sync tab if key is present
    }
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className='text-center p-5'>
        <Spinner animation='border' role='status' variant='primary'>
          <span className='visually-hidden'>Loading Settings...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Tab.Container
      id='settings-tabs'
      activeKey={activeKey}
      onSelect={(k) => setActiveKey(k || 'main')}>
      <Card className={styles.settingsCard}>
        <Row className='g-0'>
          {/* Left Column: Vertical Tab Navigation */}
          <Col md={3}>
            <Nav variant='pills' className={`flex-column ${styles.settingsNav}`}>
              <Nav.Item>
                <Nav.Link eventKey='main'>
                  <FontAwesomeIcon icon={faCog} className='me-2 fa-fw' />
                  Main
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey='import-export'>
                  <FontAwesomeIcon icon={faFileImport} className='me-2 fa-fw' />
                  Import/Export
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey='sync'>
                  <FontAwesomeIcon icon={faSyncAlt} className='me-2 fa-fw' />
                  Cloud Sync
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          {/* Right Column: Tab Content */}
          <Col md={9}>
            <Tab.Content className={styles.settingsContent}>
              <Tab.Pane eventKey='main'>
                <MainSettings />
              </Tab.Pane>
              <Tab.Pane eventKey='import-export'>
                <ImportExport />
              </Tab.Pane>
              <Tab.Pane eventKey='sync'>
                <Sync verifyKey={verifyKey} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Card>
    </Tab.Container>
  );
}
