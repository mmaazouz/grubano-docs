/**
 * HeroStats — bandeau de chiffres clés sous le pitch d'une page éditoriale
 * (maquette discover.html : .hero__stats / .stat). Classes av-stats stylées
 * dans app/article-v5.css. Server component, zéro JS client.
 */
export function HeroStats({
  items = [],
}: {
  items?: { value: string; label: string }[]
}) {
  return (
    <div className="av-stats">
      {items.map((it, i) => (
        <div className="av-stats__it" key={i}>
          <b>{it.value}</b>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  )
}
