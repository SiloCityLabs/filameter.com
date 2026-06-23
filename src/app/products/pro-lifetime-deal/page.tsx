// --- React ---
import React from 'react';

// --- Next ---
import type { Metadata } from 'next';
import Link from 'next/link';

// --- Components ---
import { Container } from 'react-bootstrap';
import PageLayout from '@/components/PageLayout';
import ProFeatures from '@/components/pro/ProFeatures';

// --- Utils ---
import { generateMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'FilaMeter Pro Lifetime Deal - 70% Off',
  description:
    'Your filament inventory, synced everywhere. Grab one of the 100 available lifetime seats for FilaMeter Pro at 70% off, plus get 20 free NFC labels.',
  keywords: [
    'filament tracking',
    '3d filament tracker',
    'lifetime deal',
    'filameter pro',
    'filameter discount',
    '3d printing inventory',
    'spool tracker',
  ],
});

const CTA_LINK = 'https://shop.silocitylabs.com/cart/50812497920300:4,50948651843884:1';

/**
 * Lifetime Deal Landing Page for FilaMeter Pro.
 * Designed to convert warm traffic into Pro purchases by establishing urgency,
 * clear value propositions, and a direct call to action.
 *
 * @returns {React.JSX.Element} The rendered Lifetime Deal page.
 */
export default function LifetimeDealPage(): React.JSX.Element {
  return (
    <PageLayout>
      <section
        className='py-5 text-center'
        style={{
          background: 'linear-gradient(135deg, var(--bs-primary-bg-subtle) 0%, transparent 100%)',
          borderBottom: '1px solid var(--bs-border-color)',
        }}>
        <Container className='py-5'>
          <span className='badge bg-danger mb-4 fs-6 px-3 py-2 rounded-pill shadow-sm'>
            🔥 Only 100 Lifetime Seats Available
          </span>

          <h1 className='display-4 fw-bold mb-4'>Your filament inventory, synced everywhere.</h1>

          <p className='lead text-muted mb-4 mx-auto' style={{ maxWidth: '700px' }}>
            FilaMeter Pro pricing is set to increase. Lock in our exclusive lifetime deal today and
            never pay a subscription fee. Track, sync, and manage your 3D printing spools across all
            your devices forever.
          </p>

          <div className='card mx-auto shadow-lg border-primary mb-5' style={{ maxWidth: '500px' }}>
            <div className='card-body p-4 p-md-5'>
              <h2 className='text-uppercase text-primary fw-bold mb-3 fs-5'>Lifetime Access</h2>
              <div className='d-flex justify-content-center align-items-baseline mb-3'>
                <span className='text-decoration-line-through text-muted fs-4 me-2'>$135.00</span>
                <span className='display-3 fw-bold text-dark'>$39.99</span>
              </div>
              <span className='badge bg-success mb-4 fs-6'>Save 70% Today</span>

              <ul className='list-unstyled text-start mb-4'>
                <li className='mb-2'>
                  <strong>✓</strong> Unlimited cloud syncing across devices
                </li>
                <li className='mb-2'>
                  <strong>✓</strong> Advanced filament tracking &amp; analytics
                </li>
                <li className='mb-2 text-primary fw-bold'>
                  <strong>🎁 Bonus:</strong> 20 FREE physical spool labels included for a limited
                  time
                </li>
              </ul>

              <Link href={CTA_LINK} className='btn btn-primary btn-lg w-100 fw-bold py-3 shadow-sm'>
                Claim Lifetime Deal
              </Link>
              <p className='text-muted small mt-3 mb-0'>
                Secure checkout via Shopify. No recurring fees.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className='py-5'>
        <Container>
          <div className='row align-items-center mb-5'>
            <div className='col-lg-6 mb-4 mb-lg-0'>
              <h2 className='fw-bold mb-4'>What is FilaMeter?</h2>
              <p className='fs-5 text-muted'>
                FilaMeter is the ultimate tracking companion for 3D printing enthusiasts. Stop
                guessing how much filament is left on the spool or digging through boxes to find the
                right material.
              </p>
              <p className='fs-5 text-muted'>
                By scanning physical labels (or using NFC), FilaMeter instantly logs the weight,
                material, brand, and color of your spools. It mathematically calculates your
                remaining length and weight, ensuring you never run out mid-print again.
              </p>
            </div>
            <div className='col-lg-6'>
              <div className='card bg-light border-0 shadow-sm h-100 p-4'>
                <div className='card-body'>
                  <h3 className='h5 fw-bold mb-3'>Why Makers Love Us:</h3>
                  <ul className='list-unstyled mb-0'>
                    <li className='mb-3'>
                      <strong>📱 Instant Access:</strong> Scan a spool and see its exact remaining
                      amount on your phone.
                    </li>
                    <li className='mb-3'>
                      <strong>⚖️ Precision Weighing:</strong> Input empty spool weights to calculate
                      exactly what&apos;s left.
                    </li>
                    <li>
                      <strong>☁️ Cloud Sync (Pro):</strong> Your entire inventory is backed up and
                      accessible anywhere.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className='py-5 bg-light border-top border-bottom'>
        <Container>
          <div className='text-center mb-5'>
            <h2 className='fw-bold'>Everything You Get With Pro</h2>
            <p className='text-muted'>Unlock the full potential of your FilaMeter app.</p>
          </div>
          <ProFeatures />
        </Container>
      </section>

      <section className='py-5 text-center'>
        <Container>
          <h2 className='fw-bold mb-4'>Ready to take control of your filament?</h2>
          <p className='lead text-muted mb-5 mx-auto' style={{ maxWidth: '600px' }}>
            Don&apos;t miss out. Once these 100 lifetime seats are gone, FilaMeter Pro will
            transition to a higher pricing model. Get in early and never pay again.
          </p>
          <Link
            href={CTA_LINK}
            className='btn btn-danger btn-lg fw-bold px-5 py-3 shadow-sm rounded-pill'>
            Get Pro Lifetime for $39.99
          </Link>
        </Container>
      </section>
    </PageLayout>
  );
}
