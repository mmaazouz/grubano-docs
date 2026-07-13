import { createElement as h } from 'react'
import type { MetaRecord } from 'nextra'

// Séparateur de catégorie avec icône Material (maquette .side__gh)
const cat = (icon: string, label: string) =>
  h('span', { className: 'sb-cat' }, h('span', { className: 'ms sb-cat__ic' }, icon), h('span', { className: 'sb-cat__t' }, label))

// ترتيب الشريط الجانبي = الكتالوج v5 (حسب الجمهور). يعكس content/fr/guides/_meta.ts.
// ⚠️ ترجمة آلية — تحتاج مراجعة بشرية.
export default {
  '-- clients': { type: 'separator', title: cat('restaurant', 'العملاء') },
  'espace-clients': { title: 'ابدأ هنا', display: 'hidden', theme: { toc: false } },
  'parcours-client': { title: 'المسار: أول طلب', display: 'hidden' },
  consumer: 'الطلب والتتبّع',
  'consumer-loyalty': 'الولاء والإحالة',
  'consumer-account': 'حسابي',

  '-- restaurant': { type: 'separator', title: cat('storefront', 'المطاعم') },
  'espace-restaurateurs': { title: 'ابدأ هنا', display: 'hidden', theme: { toc: false } },
  'parcours-restaurateur': { title: 'المسار: بداية موفقة', display: 'hidden' },
  'quick-start': 'ابدأ في 15 دقيقة',
  restaurant: 'لوحة التحكم',
  menu: 'القائمة والمسح بالذكاء الاصطناعي',
  stocks: 'إدارة المخزون',
  loyalty: 'برنامج الولاء',
  reservations: 'الحجوزات وداخل المطعم',
  promotions: 'العروض الترويجية والتخفيضات',
  kds: 'شاشة المطبخ (KDS)',
  reviews: 'مراجعات العملاء',
  analytics: 'التحليلات وموجز الذكاء الاصطناعي',
  'supplier-orders': 'الطلب من المورّدين',
  finances: 'المالية والمدفوعات',
  pro: 'الترقية إلى Pro',

  '-- supplier': { type: 'separator', title: cat('local_shipping', 'المورّدون') },
  'espace-fournisseurs': { title: 'ابدأ هنا', display: 'hidden', theme: { toc: false } },
  supplier: 'بيع المستلزمات',
  'supplier-catalog': 'الكتالوج والمناطق والطلبات',

  '-- franchise': { type: 'separator', title: cat('hub', 'أصحاب الامتياز') },
  'espace-franchises': { title: 'ابدأ هنا', display: 'hidden', theme: { toc: false } },
  'parcours-franchise': { title: 'المسار: إطلاق امتياز', display: 'hidden' },
  franchise: 'الامتياز على Grubano',
  'franchise-operations': 'إدارة شبكتك',

  '-- creators': { type: 'separator', title: cat('restaurant_menu', 'المبتكرون') },
  creators: 'مبتكر الوصفات',

  '-- affiliate': { type: 'separator', title: cat('link', 'الشركاء بالعمولة') },
  affiliate: 'برنامج الشراكة بالعمولة',

  '-- influencer': { type: 'separator', title: cat('campaign', 'المؤثرون') },
  influencer: 'كن مؤثراً',

  '-- driver': { type: 'separator', title: cat('two_wheeler', 'عمال التوصيل') },
  'espace-livreurs': { title: 'ابدأ هنا', display: 'hidden', theme: { toc: false } },
  'parcours-livreur': { title: 'المسار: كن عامل توصيل', display: 'hidden' },
  driver: 'كن عامل توصيل والمهام',
  'driver-earnings': 'الأرباح والسحوبات',
  'driver-tracking': 'تتبّع التوصيلة',

  '-- resources': { type: 'separator', title: cat('folder_open', 'الموارد') },
  'payments-security': 'المدفوعات والأمان',
} satisfies MetaRecord
