// --- React ---
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Components ---
import SettingsTabs from '@/components/settings/SettingsTabs';
// --- Styles ---
import styles from '@/public/styles/components/Settings.module.css';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Settings',
  description: 'View and manage your settings for FilaMeter.',
  keywords: ['filament', 'settings', 'manage', '3d printing'],
});

export default function SettingsPage() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;

  return (
    <PageLayout headerShowBadge={false}>
      <div className={styles.settingsPage}>
        <Container>
          {/* Header Section */}
          <div className='text-center py-3 mb-4'>
            <h1 className={`${styles.pageHeader} fw-bold mb-3`}>Application Settings</h1>

            <Row className='justify-content-center'>
              <Col md={8} lg={6}>
                <p className='text-muted mb-3 lead fs-6'>
                  Manage your application preferences, data, and synchronization options to tailor
                  FilaMeter to your workflow.
                </p>
              </Col>
            </Row>

            {version && (
              <div
                className='d-inline-flex align-items-center justify-content-center border rounded-pill px-3 bg-light text-muted small'
                style={{ fontSize: '0.85rem' }}>
                <span className='fw-semibold me-1'>v{version}</span>
              </div>
            )}
          </div>

          {/* Settings Tabs */}
          <Row>
            <Col>
              <SettingsTabs />
            </Col>
          </Row>
        </Container>
      </div>
    </PageLayout>
  );
}
