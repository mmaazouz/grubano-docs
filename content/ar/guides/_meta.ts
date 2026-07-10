import type { MetaRecord } from 'nextra'

// ترتيب الشريط الجانبي = الكتالوج v5 (حسب الجمهور). يعكس content/fr/guides/_meta.ts.
// ⚠️ ترجمة آلية — تحتاج مراجعة بشرية.
export default {
  '-- clients': { type: 'separator', title: 'العملاء' },
  consumer: 'الطلب والتتبّع',
  'consumer-loyalty': 'الولاء والإحالة',
  'consumer-account': 'حسابي',

  '-- restaurant': { type: 'separator', title: 'المطاعم' },
  'quick-start': 'ابدأ في 15 دقيقة',
  restaurant: 'لوحة التحكم',
  menu: 'القائمة والمسح بالذكاء الاصطناعي',
  stocks: 'إدارة المخزون',
  loyalty: 'برنامج الولاء',
  reservations: 'الحجوزات وداخل المطعم',
  finances: 'المالية والمدفوعات',
  pro: 'الترقية إلى Pro',

  '-- supplier': { type: 'separator', title: 'المورّدون' },
  supplier: 'بيع المستلزمات',
  'supplier-catalog': 'الكتالوج والمناطق والطلبات',

  '-- franchise': { type: 'separator', title: 'أصحاب الامتياز' },
  franchise: 'الامتياز على Grubano',
  'franchise-operations': 'إدارة شبكتك',

  '-- creators': { type: 'separator', title: 'المبتكرون' },
  creators: 'مبتكر الوصفات',

  '-- affiliate': { type: 'separator', title: 'الشركاء بالعمولة' },
  affiliate: 'برنامج الشراكة بالعمولة',

  '-- influencer': { type: 'separator', title: 'المؤثرون' },
  influencer: 'كن مؤثراً',

  '-- driver': { type: 'separator', title: 'عمال التوصيل' },
  driver: 'كن عامل توصيل والمهام',
  'driver-earnings': 'الأرباح والسحوبات',
  'driver-tracking': 'تتبّع التوصيلة',

  '-- resources': { type: 'separator', title: 'الموارد' },
  'payments-security': 'المدفوعات والأمان',
  privacy: 'الخصوصية والبيانات',
  legal: 'الإشعارات القانونية والشروط',
} satisfies MetaRecord
