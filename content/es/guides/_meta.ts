import { createElement as h } from 'react'
import type { MetaRecord } from 'nextra'

// Séparateur de catégorie avec icône Material (maquette .side__gh)
const cat = (icon: string, label: string) =>
  h('span', { className: 'sb-cat' }, h('span', { className: 'ms sb-cat__ic' }, icon), h('span', { className: 'sb-cat__t' }, label))

// Orden del sidebar = catálogo v5 (por público). Refleja content/fr/guides/_meta.ts.
export default {
  '-- clients': { type: 'separator', title: cat('restaurant', 'Clientes') },
  consumer: 'Pedir y seguir',
  'consumer-loyalty': 'Fidelidad y recomendación',
  'consumer-account': 'Mi cuenta',

  '-- restaurant': { type: 'separator', title: cat('storefront', 'Restaurantes') },
  'quick-start': 'Empezar en 15 minutos',
  restaurant: 'Panel de control',
  menu: 'Menú y escaneo IA',
  stocks: 'Gestión de stock',
  loyalty: 'Programa de fidelidad',
  reservations: 'Reservas y en sala',
  finances: 'Finanzas y pagos',
  pro: 'Pasar a Pro',

  '-- supplier': { type: 'separator', title: cat('local_shipping', 'Proveedores') },
  supplier: 'Vender sus suministros',
  'supplier-catalog': 'Catálogo, zonas y pedidos',

  '-- franchise': { type: 'separator', title: cat('hub', 'Franquiciados') },
  franchise: 'La franquicia en Grubano',
  'franchise-operations': 'Gestionar su red',

  '-- creators': { type: 'separator', title: cat('restaurant_menu', 'Creadores') },
  creators: 'Creador de recetas',

  '-- affiliate': { type: 'separator', title: cat('link', 'Afiliados') },
  affiliate: 'Programa de afiliación',

  '-- influencer': { type: 'separator', title: cat('campaign', 'Influencers') },
  influencer: 'Convertirse en influencer',

  '-- driver': { type: 'separator', title: cat('two_wheeler', 'Repartidores') },
  driver: 'Ser repartidor y misiones',
  'driver-earnings': 'Remuneración y retiros',
  'driver-tracking': 'Seguimiento de la entrega',

  '-- resources': { type: 'separator', title: cat('folder_open', 'Recursos') },
  'payments-security': 'Pagos y seguridad',
  privacy: 'Privacidad y datos',
  legal: 'Aviso legal y condiciones',
} satisfies MetaRecord
