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
  return (
    <PageLayout headerShowBadge={false}>
      <div className={styles.settingsPage}>
        <Container>
          <Row className='mb-4'>
            <Col>
              <h1 className={styles.pageHeader}>Application Settings</h1>
              <p className='text-muted'>
                Manage your application preferences, data, and synchronization options.
              </p>
            </Col>
          </Row>
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
