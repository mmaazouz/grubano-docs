// Root redirect — with i18n every real page lives under /<locale>/. The bare
// `/` route exists only to send visitors to the default locale (FR).
// Implemented as a static meta-refresh + JS fallback so it works on a plain
// FTP host with no server-side redirect support.

export const metadata = {
  title: 'Grubano Documentation',
  description: 'Documentation officielle de Grubano',
  robots: { index: false, follow: true },
}

// We can't set arbitrary <meta http-equiv> from `metadata.other` reliably,
// so render the redirect in the page body via a <head>-promoted element.
export default function RootRedirect() {
  return (
    <>
      {/* Next.js hoists meta tags rendered inside the page into <head>. */}
      <meta httpEquiv="refresh" content="0; url=/fr/" />
      <link rel="canonical" href="/fr/" />
      <noscript>
        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '2rem' }}>
          Redirection vers la documentation française…
          {' '}
          <a href="/fr/">Cliquer ici si ça ne se fait pas automatiquement</a>.
          <br />
          Redirecting to French documentation…
          {' '}
          <a href="/fr/">Click here if you are not redirected automatically</a>.
        </p>
      </noscript>
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html:
            "var l=navigator.language||'';location.replace(l.toLowerCase().indexOf('en')===0?'/en/':'/fr/');",
        }}
      />
    </>
  )
}
