import type { Metadata } from "next";
import { Container, Row, Col } from "react-bootstrap";

export const metadata: Metadata = {
  title: "Terms And Conditions",
  description: "This is the terms and conditions for using our website.",
  keywords: ["terms and conditions", "legal", "privacy policy"],
};

export default function TermsPage() {
  return (
    <Container className="main-content py-3 py-md-5" fluid>
      <Row>
        <Col>
          <Container
            id="terms-content-wrapper"
            className="shadow-lg p-3 p-md-4 mb-5 bg-body rounded"
          >
            <Row className="justify-content-md-center">
              <Col lg={9} xl={8}>
                <div style={{ padding: "10px" }}>
                  <h1 className="text-center mb-4">
                    Web Site Terms and Conditions of Use
                  </h1>
                  <hr className="mb-4" />

                  {/* --- TERMS CONTENT --- */}
                  <section>
                    <h3>1. Terms</h3>
                    <p>
                      By accessing this web site, you are agreeing to be bound
                      by these web site Terms and Conditions of Use, all
                      applicable laws and regulations, and agree that you are
                      responsible for compliance with any applicable local laws.
                      If you do not agree with any of these terms, you are
                      prohibited from using or accessing this site. The
                      materials contained in this web site are protected by
                      applicable copyright and trade mark law.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h3>2. Use License</h3>
                    <ol type="a">
                      <li>
                        Permission is granted to temporarily download one copy
                        of the materials (information or software) on
                        Techreanimate&apos;s web site for personal,
                        non-commercial transitory viewing only. This is the
                        grant of a license, not a transfer of title, and under
                        this license you may not:
                        <ol type="i" className="mt-2 mb-2">
                          <li>modify or copy the materials;</li>
                          <li>
                            use the materials for any commercial purpose, or for
                            any public display (commercial or non-commercial);
                          </li>
                          <li>
                            attempt to decompile or reverse engineer any
                            software contained on Techreanimate&apos;s web site;
                          </li>
                          <li>
                            remove any copyright or other proprietary notations
                            from the materials; or
                          </li>
                          <li>
                            transfer the materials to another person or
                            &quot;mirror&quot; the materials on any other
                            server.
                          </li>
                        </ol>
                      </li>
                      <li>
                        This license shall automatically terminate if you
                        violate any of these restrictions and may be terminated
                        by Techreanimate at any time. Upon terminating your
                        viewing of these materials or upon the termination of
                        this license, you must destroy any downloaded materials
                        in your possession whether in electronic or printed
                        format.
                      </li>
                    </ol>
                  </section>

                  <section className="mt-4">
                    <h3>3. Disclaimer</h3>
                    <ol type="a">
                      <li>
                        The materials on Techreanimate&apos;s web site are
                        provided &quot;as is&quot;. Techreanimate makes no
                        warranties, expressed or implied, and hereby disclaims
                        and negates all other warranties, including without
                        limitation, implied warranties or conditions of
                        merchantability, fitness for a particular purpose, or
                        non-infringement of intellectual property or other
                        violation of rights. Further, Techreanimate does not
                        warrant or make any representations concerning the
                        accuracy, likely results, or reliability of the use of
                        the materials on its Internet web site or otherwise
                        relating to such materials or on any sites linked to
                        this site.
                      </li>
                    </ol>
                  </section>

                  <section className="mt-4">
                    <h3>4. Limitations</h3>
                    <p>
                      In no event shall Techreanimate or its suppliers be liable
                      for any damages (including, without limitation, damages
                      for loss of data or profit, or due to business
                      interruption,) arising out of the use or inability to use
                      the materials on Techreanimate&apos;s Internet site, even
                      if Techreanimate or a Techreanimate authorized
                      representative has been notified orally or in writing of
                      the possibility of such damage. Because some jurisdictions
                      do not allow limitations on implied warranties, or
                      limitations of liability for consequential or incidental
                      damages, these limitations may not apply to you.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h3>5. Revisions and Errata</h3>
                    <p>
                      The materials appearing on Techreanimate&apos;s web site
                      could include technical, typographical, or photographic
                      errors. Techreanimate does not warrant that any of the
                      materials on its web site are accurate, complete, or
                      current. Techreanimate may make changes to the materials
                      contained on its web site at any time without notice.
                      Techreanimate does not, however, make any commitment to
                      update the materials.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h3>6. Links</h3>
                    <p>
                      Techreanimate has not reviewed all of the sites linked to
                      its Internet web site and is not responsible for the
                      contents of any such linked site. The inclusion of any
                      link does not imply endorsement by Techreanimate of the
                      site. Use of any such linked web site is at the
                      user&apos;s own risk.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h3>7. Site Terms of Use Modifications</h3>
                    <p>
                      Techreanimate may revise these terms of use for its web
                      site at any time without notice. By using this web site
                      you are agreeing to be bound by the then current version
                      of these Terms and Conditions of Use.
                    </p>
                  </section>

                  <section className="mt-4">
                    <h3>8. Governing Law</h3>
                    <p>
                      Any claim relating to Techreanimate&apos;s web site shall
                      be governed by the laws of the State of New York without
                      regard to its conflict of law provisions.
                    </p>
                    <p>
                      General Terms and Conditions applicable to Use of a Web
                      Site.
                    </p>
                  </section>

                  {/* --- PRIVACY POLICY CONTENT --- */}
                  <section className="mt-5">
                    <h2 className="text-center mb-4">Privacy Policy</h2>
                    <hr className="mb-4" />
                    <p>
                      Your privacy is very important to us. Accordingly, we have
                      developed this Policy in order for you to understand how
                      we collect, use, communicate and disclose and make use of
                      personal information. The following outlines our privacy
                      policy.
                    </p>
                    <ul className="list-unstyled mt-3">
                      <li className="mb-2">
                        <span className="fw-semibold">
                          Purpose Identification:
                        </span>{" "}
                        Before or at the time of collecting personal
                        information, we will identify the purposes for which
                        information is being collected.
                      </li>
                      <li className="mb-2">
                        <span className="fw-semibold">
                          Consent & Use Limitation:
                        </span>{" "}
                        We will collect and use personal information solely with
                        the objective of fulfilling those purposes specified by
                        us and for other compatible purposes, unless we obtain
                        the consent of the individual concerned or as required
                        by law.
                      </li>
                      <li className="mb-2">
                        <span className="fw-semibold">Data Retention:</span> We
                        will only retain personal information as long as
                        necessary for the fulfillment of those purposes.
                      </li>
                      <li className="mb-2">
                        <span className="fw-semibold">Collection Method:</span>{" "}
                        We will collect personal information by lawful and fair
                        means and, where appropriate, with the knowledge or
                        consent of the individual concerned.
                      </li>
                      <li className="mb-2">
                        <span className="fw-semibold">Data Quality:</span>{" "}
                        Personal data should be relevant to the purposes for
                        which it is to be used, and, to the extent necessary for
                        those purposes, should be accurate, complete, and
                        up-to-date.
                      </li>
                      <li className="mb-2">
                        <span className="fw-semibold">
                          Security Safeguards:
                        </span>{" "}
                        We will protect personal information by reasonable
                        security safeguards against loss or theft, as well as
                        unauthorized access, disclosure, copying, use or
                        modification.
                      </li>
                      <li className="mb-2">
                        <span className="fw-semibold">Openness:</span> We will
                        make readily available to customers information about
                        our policies and practices relating to the management of
                        personal information.
                      </li>
                    </ul>
                    <p className="mt-3">
                      We are committed to conducting our business in accordance
                      with these principles in order to ensure that the
                      confidentiality of personal information is protected and
                      maintained.
                    </p>
                  </section>

                  <hr className="mt-5" />
                  <p className="text-muted text-center mt-3 small">
                    This document was last updated on October 26, 2013 4:17PM
                    EST
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}
