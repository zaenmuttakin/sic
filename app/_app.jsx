import Head from "next/head";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const headColor = "#faf5ff";
  return (
    <>
      <Head>
        <meta name="theme-color" content={headColor} />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
