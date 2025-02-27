import { useEffect } from "react";
import { useRouter } from "next/router";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/public/styles/_fw.css";
import "@/public/styles/main.css";
//DB
import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";
import idbAdapter from "pouchdb-adapter-idb";
import { DatabaseProvider } from "@/contexts/DatabaseContext";

PouchDB.plugin(PouchDBFind);
PouchDB.plugin(idbAdapter);

const GA_TRACKING_ID = "G-ZSE5YNKGXV";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      window.gtag("config", GA_TRACKING_ID, {
        page_path: url,
      });
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    // If the component is unmounted, unsubscribe from the event
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      {GA_TRACKING_ID !== "" && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        </>
      )}
      <DatabaseProvider>
        <Component {...pageProps} />
      </DatabaseProvider>
    </>
  );
}

export default MyApp;
