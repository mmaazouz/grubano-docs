import { createElement as h } from 'react'
import type { MetaRecord } from 'nextra'

// Séparateur de catégorie avec icône Material (maquette .side__gh)
const cat = (icon: string, label: string) =>
  h('span', { className: 'sb-cat' }, h('span', { className: 'ms sb-cat__ic' }, icon), h('span', { className: 'sb-cat__t' }, label))

// ترتيب الشريط الجانبي = الكتالوج v5 (حسب الجمهور). يعكس content/fr/guides/_meta.ts.
// ⚠️ ترجمة آلية — تحتاج مراجعة بشرية.
export default {
  '-- clients': { type: 'separator', title: cat('restaurant', 'العملاء') },
  consumer: 'الطلب والتتبّع',
  'consumer-loyalty': 'الولاء والإحالة',
  'consumer-account': 'حسابي',

  '-- restaurant': { type: 'separator', title: cat('storefront', 'المطاعم') },
  'quick-start': 'ابدأ في 15 دقيقة',
  restaurant: 'لوحة التحكم',
  menu: 'القائمة والمسح بالذكاء الاصطناعي',
  stocks: 'إدارة المخزون',
  loyalty: 'برنامج الولاء',
  reservations: 'الحجوزات وداخل المطعم',
  finances: 'المالية والمدفوعات',
  pro: 'الترقية إلى Pro',

  '-- supplier': { type: 'separator', title: cat('local_shipping', 'المورّدون') },
  supplier: 'بيع المستلزمات',
  'supplier-catalog': 'الكتالوج والمناطق والطلبات',

  '-- franchise': { type: 'separator', title: cat('hub', 'أصحاب الامتياز') },
  franchise: 'الامتياز على Grubano',
  'franchise-operations': 'إدارة شبكتك',

  '-- creators': { type: 'separator', title: cat('restaurant_menu', 'المبتكرون') },
  creators: 'مبتكر الوصفات',

  '-- affiliate': { type: 'separator', title: cat('link', 'الشركاء بالعمولة') },
  affiliate: 'برنامج الشراكة بالعمولة',

  '-- influencer': { type: 'separator', title: cat('campaign', 'المؤثرون') },
  influencer: 'كن مؤثراً',

  '-- driver': { type: 'separator', title: cat('two_wheeler', 'عمال التوصيل') },
  driver: 'كن عامل توصيل والمهام',
  'driver-earnings': 'الأرباح والسحوبات',
  'driver-tracking': 'تتبّع التوصيلة',

  '-- resources': { type: 'separator', title: cat('folder_open', 'الموارد') },
  'payments-security': 'المدفوعات والأمان',
} satisfies MetaRecord
