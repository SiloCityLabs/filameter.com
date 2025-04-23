// --- React ---
import { Container, Row, Col } from "react-bootstrap";
// --- Next ---
import type { Metadata } from "next";
import Link from "next/link";
// --- Layout ---
import PageLayout from "@/components/PageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy outlining how Techreanimate collects, uses, maintains and discloses user information.",
  keywords: [
    "privacy policy",
    "data collection",
    "user data",
    "cookies",
    "techreanimate",
  ],
};

export default function PrivacyPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <PageLayout>
      <Container className="py-3" fluid>
        <Row>
          <Col>
            <Container
              id="privacy-policy-content-wrapper"
              className="shadow-lg p-3 p-md-4 bg-body rounded"
            >
              <Row className="justify-content-md-center">
                <Col lg={9} xl={8}>
                  <h1 className="text-center">Privacy Policy</h1>
                  <hr className="mb-4" />

                  <p className="lead mb-4">
                    This Privacy Policy governs the manner in which
                    Techreanimate collects, uses, maintains and discloses
                    information collected from users (each, a &quot;User&quot;)
                    of the{" "}
                    <a href={appUrl} target="_blank" rel="noopener noreferrer">
                      {appUrl}
                    </a>{" "}
                    website (&quot;Site&quot;). This privacy policy applies to
                    the Site and all products and services offered by
                    Techreanimate.
                  </p>

                  <section className="mt-4">
                    <h2>What information do we collect?</h2>
                    <p>
                      We collect information from you when you register on our
                      site, place an order, subscribe to our newsletter, respond
                      to a survey or fill out a form.
                    </p>
                    <p>
                      When ordering or registering on our site, as appropriate,
                      you may be asked to enter your: name, e-mail address,
                      mailing address, phone number or other details. You may,
                      however, visit our site anonymously.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h2>What do we use your information for?</h2>
                    <p>
                      Any of the information we collect from you may be used in
                      one of the following ways:
                    </p>
                    <ul className="list-group list-group-flush mt-3 mb-3">
                      <li className="list-group-item ps-0">
                        <strong>To personalize your experience:</strong> Your
                        information helps us to better respond to your
                        individual needs.
                      </li>
                      <li className="list-group-item ps-0">
                        <strong>To improve our website:</strong> We continually
                        strive to improve our website offerings based on the
                        information and feedback we receive from you.
                      </li>
                      <li className="list-group-item ps-0">
                        <strong>To improve customer service:</strong> Your
                        information helps us to more effectively respond to your
                        customer service requests and support needs.
                      </li>
                      <li className="list-group-item ps-0">
                        <strong>To process transactions:</strong> Your
                        information, whether public or private, will not be
                        sold, exchanged, transferred, or given to any other
                        company for any reason whatsoever, without your consent,
                        other than for the express purpose of delivering the
                        purchased product or service requested.
                      </li>
                      <li className="list-group-item ps-0">
                        <strong>To administer features:</strong> Such as a
                        contest, promotion, survey or other site feature.
                      </li>
                      <li className="list-group-item ps-0">
                        <strong>To send periodic emails:</strong> The email
                        address you provide may be used to send you information
                        and updates, in addition to receiving occasional company
                        news, updates, etc.
                        <small className="d-block text-muted mt-1">
                          Note: If at any time you would like to unsubscribe
                          from receiving future emails, we include detailed
                          unsubscribe instructions at the bottom of each email.
                        </small>
                      </li>
                    </ul>
                  </section>

                  <section className="mt-4">
                    <h2>How do we protect your information?</h2>
                    <p>
                      We implement a variety of security measures to maintain
                      the safety of your personal information when you place an
                      order or enter, submit, or access your personal
                      information.
                    </p>
                    <p>
                      We may offer the use of a secure server. All supplied
                      sensitive/credit information is transmitted via Secure
                      Socket Layer (SSL) technology and then encrypted into our
                      Payment gateway provider&apos;s database only to be
                      accessible by those authorized with special access rights
                      to such systems, and are required to keep the information
                      confidential.
                    </p>
                    <p>
                      After a transaction, your private information (credit
                      cards, social security numbers, financials, etc.) may not
                      be stored on our servers.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h2>Do we use cookies?</h2>
                    <p>
                      Yes. Cookies are small files that a site or its service
                      provider transfers to your computer&apos;s hard drive
                      through your Web browser (if you allow) that enables the
                      site&apos;s or service provider&apos;s systems to
                      recognize your browser and capture and remember certain
                      information.
                    </p>
                    <p>
                      We use cookies to understand and save your preferences for
                      future visits and compile aggregate data about site
                      traffic and site interaction so that we can offer better
                      site experiences and tools in the future.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h2>Do we disclose any information to outside parties?</h2>
                    <p>
                      We do not sell, trade, or otherwise transfer to outside
                      parties your personally identifiable information. This
                      does not include trusted third parties who assist us in
                      operating our website, conducting our business, or
                      servicing you, so long as those parties agree to keep this
                      information confidential. We may also release your
                      information when we believe release is appropriate to
                      comply with the law, enforce our site policies, or protect
                      ours or others rights, property, or safety. However,
                      non-personally identifiable visitor information may be
                      provided to other parties for marketing, advertising, or
                      other uses.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h2>Third party links</h2>
                    <p>
                      Occasionally, at our discretion, we may include or offer
                      third party products or services on our website. These
                      third party sites have separate and independent privacy
                      policies. We therefore have no responsibility or liability
                      for the content and activities of these linked sites.
                      Nonetheless, we seek to protect the integrity of our site
                      and welcome any feedback about these sites.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h2>California Online Privacy Protection Act Compliance</h2>
                    <p>
                      Because we value your privacy we have taken the necessary
                      precautions to be in compliance with the California Online
                      Privacy Protection Act. We therefore will not distribute
                      your personal information to outside parties without your
                      consent.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h2>Childrens Online Privacy Protection Act Compliance</h2>
                    <p>
                      We are in compliance with the requirements of COPPA
                      (Childrens Online Privacy Protection Act), we do not
                      knowingly collect any information from anyone under 13
                      years of age. Our website, products and services are all
                      directed to people who are at least 13 years old or older.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h2>Online Privacy Policy Only</h2>
                    <p>
                      This online privacy policy applies only to information
                      collected through our website and not to information
                      collected offline.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h2>Terms and Conditions</h2>
                    <p>
                      Please also visit our Terms and Conditions section
                      establishing the use, disclaimers, and limitations of
                      liability governing the use of our website at{" "}
                      <Link href="/terms">Terms and Conditions</Link>.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h2>Your Consent</h2>
                    <p>
                      By using our site, you consent to our website&apos;s
                      privacy policy.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h2>Changes to our Privacy Policy</h2>
                    <p>
                      If we decide to change our privacy policy, we will post
                      those changes on this page. Policy changes will apply only
                      to information collected after the date of the change.
                    </p>
                    <p className="text-muted mt-2 small">
                      This policy was last modified on October 26, 2013 4:17PM
                      EST
                    </p>
                  </section>

                  <section className="mt-5 border-top pt-4">
                    <h2>Contacting Us</h2>
                    <p>
                      If there are any questions regarding this privacy policy
                      you may contact us.
                    </p>
                    <address className="mt-3">
                      <abbr title="Phone">P:</abbr> 716-698-9236
                    </address>
                  </section>
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
}
