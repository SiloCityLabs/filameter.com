import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/public/styles/_fw.css";
import "@/public/styles/main.css";
//DB
import { DatabaseProvider } from "@/contexts/DatabaseContext";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const GA_TRACKING_ID = process.env.NEXT_PUBLIC_APP_GA_TRACKING_ID;

  //Register Service Worker for PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "Service Worker registered with scope:",
              registration.scope
            );
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  if (GA_TRACKING_ID !== "") {
    useEffect(() => {
      const handleRouteChange = (url) => {
        window.gtag("config", GA_TRACKING_ID, {
          page_path: url,
        });
      };

      router.events.on("routeChangeComplete", handleRouteChange);

      return () => {
        router.events.off("routeChangeComplete", handleRouteChange);
      };
    }, [router.events]);
  }

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <link rel="manifest" href="/manifest.json" />
      </Head>
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
