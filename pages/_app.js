import '../styles/globals.css';
import '../styles/admin.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminThemeProvider from '../components/admin/AdminThemeProvider';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      {isAdminPage ? (
        <AdminThemeProvider>
          <Component {...pageProps} />
        </AdminThemeProvider>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}

export default MyApp;
