import { createElement as h } from 'react'
import type { MetaRecord } from 'nextra'

// Séparateur de catégorie avec icône Material (maquette .side__gh)
const cat = (icon: string, label: string) =>
  h('span', { className: 'sb-cat' }, h('span', { className: 'ms sb-cat__ic' }, icon), h('span', { className: 'sb-cat__t' }, label))

// Orden del sidebar = catálogo v5 (por público). Refleja content/fr/guides/_meta.ts.
export default {
  '-- clients': { type: 'separator', title: cat('restaurant', 'Clientes') },
  'espace-clients': { title: 'Empezar aquí', display: 'hidden', theme: { toc: false } },
  'parcours-client': { title: 'Recorrido: primer pedido', display: 'hidden' },
  consumer: 'Pedir y seguir',
  'consumer-loyalty': 'Fidelidad y recomendación',
  'consumer-account': 'Mi cuenta',

  '-- restaurant': { type: 'separator', title: cat('storefront', 'Restaurantes') },
  'espace-restaurateurs': { title: 'Empezar aquí', display: 'hidden', theme: { toc: false } },
  'parcours-restaurateur': { title: 'Recorrido: buen comienzo', display: 'hidden' },
  'quick-start': 'Empezar en 15 minutos',
  restaurant: 'Panel de control',
  menu: 'Menú y escaneo IA',
  stocks: 'Gestión de stock',
  loyalty: 'Programa de fidelidad',
  reservations: 'Reservas y en sala',
  promotions: 'Promociones y ofertas',
  kds: 'Pantalla de cocina (KDS)',
  reviews: 'Reseñas de clientes',
  analytics: 'Analíticas y briefing IA',
  'supplier-orders': 'Hacer pedidos a sus proveedores',
  finances: 'Finanzas y pagos',
  pro: 'Pasar a Pro',

  '-- supplier': { type: 'separator', title: cat('local_shipping', 'Proveedores') },
  'espace-fournisseurs': { title: 'Empezar aquí', display: 'hidden', theme: { toc: false } },
  supplier: 'Vender sus suministros',
  'supplier-catalog': 'Catálogo, zonas y pedidos',

  '-- franchise': { type: 'separator', title: cat('hub', 'Franquiciados') },
  'espace-franchises': { title: 'Empezar aquí', display: 'hidden', theme: { toc: false } },
  'parcours-franchise': { title: 'Recorrido: lanzar una franquicia', display: 'hidden' },
  franchise: 'La franquicia en Grubano',
  'franchise-operations': 'Gestionar su red',

  '-- creators': { type: 'separator', title: cat('restaurant_menu', 'Creadores') },
  creators: 'Creador de recetas',

  '-- affiliate': { type: 'separator', title: cat('link', 'Afiliados') },
  affiliate: 'Programa de afiliación',

  '-- influencer': { type: 'separator', title: cat('campaign', 'Influencers') },
  influencer: 'Convertirse en influencer',

  '-- driver': { type: 'separator', title: cat('two_wheeler', 'Repartidores') },
  'espace-livreurs': { title: 'Empezar aquí', display: 'hidden', theme: { toc: false } },
  'parcours-livreur': { title: 'Recorrido: ser repartidor', display: 'hidden' },
  driver: 'Ser repartidor y misiones',
  'driver-earnings': 'Remuneración y retiros',
  'driver-tracking': 'Seguimiento de la entrega',

  '-- resources': { type: 'separator', title: cat('folder_open', 'Recursos') },
  'payments-security': 'Pagos y seguridad',
} satisfies MetaRecord
