/**
 * Contact strip — dark navy CTA that closes the home page and (later) each
 * landing/article. Support endpoint is a mailto: placeholder until the real
 * support tool is wired in.
 */

const COPY: Record<string, { title: string; subtitle: string; button: string }> = {
  fr: {
    title: 'Vous ne trouvez pas votre réponse ?',
    subtitle: 'Notre équipe support vous répond dans toutes les langues de Grubano.',
    button: 'Contacter le support',
  },
  en: {
    title: "Can't find your answer?",
    subtitle: 'Our support team replies in every Grubano language.',
    button: 'Contact support',
  },
}

export function ContactStrip({ locale = 'fr' }: { locale?: string }) {
  const t = COPY[locale] ?? COPY.fr
  return (
    <section className="gb-sec">
      <div className="gb-contact">
        <div className="gb-contact__m">
          <b>{t.title}</b>
          <span>{t.subtitle}</span>
        </div>
        <a
          className="gb-contact__btn"
          href="mailto:support@grubano.com"
        >
          <span className="ms">mail</span>
          {t.button}
        </a>
      </div>
    </section>
  )
}
