import Head from "next/head";
import Link from "next/link";
import { Container, Row, Col } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="This is the privacy policy." />
        <meta name="keywords" content="privacy policy" />
      </Head>
      <div className="main-container">
        <Header showBadge={true} />
        <Container className="main-content" fluid>
          <Row>
            <Col>
              <h2 className="text-center">Privacy Policy</h2>

              <Container
                id="privacy-policy"
                className="shadow-lg p-3 mb-5 bg-body rounded text-center"
              >
                <Row className="justify-content-md-center">
                  <Col lg={8}>
                    <p>
                      This Privacy Policy governs the manner in which
                      Techreanimate collects, uses, maintains and discloses
                      information collected from users (each, a
                      &quot;User&quot;) of the {process.env.NEXT_PUBLIC_APP_URL}{" "}
                      website (&quot;Site&quot;). This privacy policy applies to
                      the Site and all products and services offered by
                      Techreanimate.
                    </p>
                    <br />
                    <h1>What information do we collect?</h1>
                    <p>
                      We collect information from you when you register on our
                      site, place an order, subscribe to our newsletter, respond
                      to a survey or fill out a form.
                    </p>
                    <p>
                      When ordering or registering on our site, as appropriate,
                      you may be asked to enter your: name, e-mail address,
                      mailing address, phone number or Techreanimate. You may,
                      however, visit our site anonymously.
                    </p>
                    <br />
                    <h1>What do we use your information for?</h1>
                    <p>
                      Any of the information we collect from you may be used in
                      one of the following ways:
                    </p>
                    <ol style={{ listStyle: "circle", padding: "20px" }}>
                      <li>
                        To personalize your experience - (your information helps
                        us to better respond to your individual needs)
                      </li>
                      <li>
                        To improve our website - (we continually strive to
                        improve our website offerings based on the information
                        and feedback we receive from you)
                      </li>
                      <li>
                        To improve customer service - (your information helps us
                        to more effectively respond to your customer service
                        requests and support needs)
                      </li>
                      <li>
                        To process transactions - Your information, whether
                        public or private, will not be sold, exchanged,
                        transferred, or given to any other company for any
                        reason whatsoever, without your consent, other than for
                        the express purpose of delivering the purchased product
                        or service requested.
                      </li>
                      <li>
                        To administer a contest, promotion, survey or other site
                        feature
                      </li>
                      <li>
                        To send periodic emails - The email address you provide
                        for order processing, may be used to send you
                        information and updates pertaining to your order, in
                        addition to receiving occasional company news, updates,
                        related product or service information, etc. Note: If at
                        any time you would like to unsubscribe from receiving
                        future emails, we include detailed unsubscribe
                        instructions at the bottom of each email.
                      </li>
                    </ol>
                    <br />
                    <h1>How do we protect your information?</h1>
                    <p>
                      We implement a variety of security measures to maintain
                      the safety of your personal information when you place an
                      order or enter, submit, or access your personal
                      information.
                    </p>
                    <p>
                      We offer the use of a secure server. All supplied
                      sensitive/credit information is transmitted via Secure
                      Socket Layer (SSL) technology and then encrypted into our
                      Payment gateway providers database only to be accessible
                      by those authorized with special access rights to such
                      systems, and are required to?keep the information
                      confidential.
                    </p>
                    <p>
                      After a transaction, your private information (credit
                      cards, social security numbers, financials, etc.) will not
                      be stored on our servers.
                    </p>
                    <br />
                    <h1>Do we use cookies?</h1>
                    <p>
                      Yes (Cookies are small files that a site or its service
                      provider transfers to your computers hard drive through
                      your Web browser (if you allow) that enables the sites or
                      service providers systems to recognize your browser and
                      capture and remember certain information
                    </p>
                    <p>
                      We use cookies to help us remember and process the items
                      in your shopping cart.
                    </p>
                    <p>
                      If you prefer, you can choose to have your computer warn
                      you each time a cookie is being sent, or you can choose to
                      turn off all cookies via your browser settings. Like most
                      websites, if you turn your cookies off, some of our
                      services may not function properly. However, you can still
                      place orders by contacting customer service.
                    </p>
                    <br />
                    <h1>Do we disclose any information to outside parties?</h1>
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
                    <br />
                    <h1>Third party links</h1>
                    <p>
                      Occasionally, at our discretion, we may include or offer
                      third party products or services on our website. These
                      third party sites have separate and independent privacy
                      policies. We therefore have no responsibility or liability
                      for the content and activities of these linked sites.
                      Nonetheless, we seek to protect the integrity of our site
                      and welcome any feedback about these sites.
                    </p>
                    <br />
                    <h1>California Online Privacy Protection Act Compliance</h1>
                    <p>
                      Because we value your privacy we have taken the necessary
                      precautions to be in compliance with the California Online
                      Privacy Protection Act. We therefore will not distribute
                      your personal information to outside parties without your
                      consent.
                    </p>
                    <p>
                      As part of the California Online Privacy Protection Act,
                      all users of our site may make any changes to their
                      information at anytime by logging into their account and
                      going to the &apos;My Account&apos; page.
                    </p>
                    <br />
                    <h1>Childrens Online Privacy Protection Act Compliance</h1>
                    <p>
                      We are in compliance with the requirements of COPPA
                      (Childrens Online Privacy Protection Act), we do not
                      collect any information from anyone under 13 years of age.
                      Our website, products and services are all directed to
                      people who are at least 13 years old or older.
                    </p>
                    <br />
                    <h1>Online Privacy Policy Only</h1>
                    <p>
                      This online privacy policy applies only to information
                      collected through our website and not to information
                      collected offline.
                    </p>
                    <br />
                    <h1>Terms and Conditions</h1>
                    <p>
                      Please also visit our Terms and Conditions section
                      establishing the use, disclaimers, and limitations of
                      liability governing the use of our website at{" "}
                      <Link href="/terms">
                        {process.env.NEXT_PUBLIC_APP_URL}/terms
                      </Link>
                    </p>
                    <br />
                    <h1>Your Consent</h1>
                    <p>
                      By using our site, you consent to our websites privacy
                      policy.
                    </p>
                    <br />
                    <h1>Changes to our Privacy Policy</h1>
                    <p>
                      If we decide to change our privacy policy, we will post
                      those changes on this page, and/or update the Privacy
                      Policy modification date below.
                    </p>
                    <p>
                      This policy was last modified on 10/26/2013 4:17PM EST
                    </p>
                    <br />
                    <h1>Contacting Us</h1>
                    <p>
                      If there are any questions regarding this privacy policy
                      you may contact us using the information below.
                    </p>
                    <br />
                    7166989236
                    <br />
                  </Col>
                </Row>
              </Container>
            </Col>
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
