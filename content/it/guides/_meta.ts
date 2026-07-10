import type { MetaRecord } from 'nextra'

// Ordine della sidebar = catalogo v5 (per pubblico). Rispecchia content/fr/guides/_meta.ts.
export default {
  '-- clients': { type: 'separator', title: 'Clienti' },
  consumer: 'Ordinare e seguire',
  'consumer-loyalty': 'Fedeltà e passaparola',
  'consumer-account': 'Il mio account',

  '-- restaurant': { type: 'separator', title: 'Ristoratori' },
  'quick-start': 'Iniziare in 15 minuti',
  restaurant: 'Pannello di controllo',
  menu: 'Menù e scansione IA',
  stocks: 'Gestione delle scorte',
  loyalty: 'Programma fedeltà',
  reservations: 'Prenotazioni e sala',
  finances: 'Finanze e versamenti',
  pro: 'Passare a Pro',

  '-- supplier': { type: 'separator', title: 'Fornitori' },
  supplier: 'Vendere le proprie forniture',
  'supplier-catalog': 'Catalogo, zone e ordini',

  '-- franchise': { type: 'separator', title: 'Franchising' },
  franchise: 'Il franchising su Grubano',
  'franchise-operations': 'Gestire la propria rete',

  '-- creators': { type: 'separator', title: 'Creatori' },
  creators: 'Creatore di ricette',

  '-- affiliate': { type: 'separator', title: 'Affiliati' },
  affiliate: 'Programma di affiliazione',

  '-- influencer': { type: 'separator', title: 'Influencer' },
  influencer: 'Diventare influencer',

  '-- driver': { type: 'separator', title: 'Rider' },
  driver: 'Diventare rider e missioni',
  'driver-earnings': 'Compensi e prelievi',
  'driver-tracking': 'Tracciamento della consegna',

  '-- resources': { type: 'separator', title: 'Risorse' },
  'payments-security': 'Pagamenti e sicurezza',
  privacy: 'Privacy e dati',
  legal: 'Note legali e condizioni',
} satisfies MetaRecord
