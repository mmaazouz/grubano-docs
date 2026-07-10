import type { MetaRecord } from 'nextra'

// Orden del sidebar = catálogo v5 (por público). Refleja content/fr/guides/_meta.ts.
export default {
  '-- clients': { type: 'separator', title: 'Clientes' },
  consumer: 'Pedir y seguir',
  'consumer-loyalty': 'Fidelidad y recomendación',
  'consumer-account': 'Mi cuenta',

  '-- restaurant': { type: 'separator', title: 'Restaurantes' },
  'quick-start': 'Empezar en 15 minutos',
  restaurant: 'Panel de control',
  menu: 'Menú y escaneo IA',
  stocks: 'Gestión de stock',
  loyalty: 'Programa de fidelidad',
  reservations: 'Reservas y en sala',
  finances: 'Finanzas y pagos',
  pro: 'Pasar a Pro',

  '-- supplier': { type: 'separator', title: 'Proveedores' },
  supplier: 'Vender sus suministros',
  'supplier-catalog': 'Catálogo, zonas y pedidos',

  '-- franchise': { type: 'separator', title: 'Franquiciados' },
  franchise: 'La franquicia en Grubano',
  'franchise-operations': 'Gestionar su red',

  '-- creators': { type: 'separator', title: 'Creadores' },
  creators: 'Creador de recetas',

  '-- affiliate': { type: 'separator', title: 'Afiliados' },
  affiliate: 'Programa de afiliación',

  '-- influencer': { type: 'separator', title: 'Influencers' },
  influencer: 'Convertirse en influencer',

  '-- driver': { type: 'separator', title: 'Repartidores' },
  driver: 'Ser repartidor y misiones',
  'driver-earnings': 'Remuneración y retiros',
  'driver-tracking': 'Seguimiento de la entrega',

  '-- resources': { type: 'separator', title: 'Recursos' },
  'payments-security': 'Pagos y seguridad',
  privacy: 'Privacidad y datos',
  legal: 'Aviso legal y condiciones',
} satisfies MetaRecord
