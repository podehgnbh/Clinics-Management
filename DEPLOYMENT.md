# دليل الاستضافة والنشر - نظام إدارة العيادات

## 📋 المحتويات
1. [الاستضافة على Render](#الاستضافة-على-render)
2. [قاعدة البيانات PlanetScale](#قاعدة-البيانات-planetscale)
3. [متغيرات البيئة](#متغيرات-البيئة)
4. [التشغيل المحلي](#التشغيل-المحلي)

---

## 🚀 الاستضافة على Render

### الخطوة 1: إنشاء حساب على Render
1. اذهب إلى [render.com](https://render.com)
2. سجل دخول باستخدام GitHub (podehgnbh)
3. اضغط على "New +" → "Web Service"

### الخطوة 2: ربط GitHub
1. اختر "GitHub" كمصدر
2. اختر المستودع: `Clinics-Management`
3. اختر الفرع: `main`

### الخطوة 3: إعدادات النشر
- **Name:** clinic-management-system
- **Runtime:** Node
- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `pnpm start`

### الخطوة 4: متغيرات البيئة
أضف المتغيرات التالية في قسم "Environment":

```
DATABASE_URL=mysql://user:password@host/database
JWT_SECRET=your-secret-key-here
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
```

### الخطوة 5: النشر
اضغط على "Create Web Service" وسيبدأ النشر تلقائياً

---

## 🗄️ قاعدة البيانات PlanetScale

### الخطوة 1: إنشاء حساب
1. اذهب إلى [planetscale.com](https://planetscale.com)
2. سجل دخول مجاني
3. اضغط على "Create a database"

### الخطوة 2: إنشاء قاعدة البيانات
- **Database name:** clinic_management
- **Region:** اختر الأقرب لك

### الخطوة 3: الحصول على رابط الاتصال
1. اذهب إلى "Connect"
2. اختر "Node.js"
3. انسخ رابط الاتصال (CONNECTION STRING)

### الخطوة 4: تحديث متغيرات البيئة
استخدم الرابط في متغير `DATABASE_URL`

---

## 🔐 متغيرات البيئة

### المتغيرات المطلوبة:

| المتغير | الوصف | مثال |
|--------|-------|------|
| `DATABASE_URL` | رابط قاعدة البيانات | `mysql://user:pass@host/db` |
| `JWT_SECRET` | مفتاح التشفير | `your-secret-key` |
| `VITE_APP_ID` | معرف التطبيق | `your-app-id` |
| `OAUTH_SERVER_URL` | رابط خادم OAuth | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | بوابة تسجيل الدخول | `https://oauth.manus.im` |

---

## 💻 التشغيل المحلي

### المتطلبات:
- Node.js 18+
- pnpm
- MySQL 8+

### الخطوات:

**1. تثبيت المكتبات:**
```bash
pnpm install
```

**2. إعداد قاعدة البيانات:**
```bash
pnpm db:push
```

**3. تشغيل خادم التطوير:**
```bash
pnpm dev
```

**4. افتح المتصفح:**
```
http://localhost:3000
```

---

## 📝 ملاحظات مهمة

### الأمان:
- ✅ لا تشارك التوكنات أو المفاتيح السرية
- ✅ استخدم متغيرات البيئة فقط
- ✅ فعّل HTTPS على الاستضافة

### الأداء:
- ✅ استخدم CDN للملفات الثابتة
- ✅ فعّل الضغط (gzip)
- ✅ استخدم caching للقاعدة

### النسخ الاحتياطية:
- ✅ فعّل النسخ الاحتياطية التلقائية
- ✅ احفظ بيانات المرضى بشكل آمن

---

## 🆘 استكشاف الأخطاء

### المشكلة: قاعدة البيانات لا تتصل
**الحل:**
- تحقق من رابط الاتصال
- تأكد من أن قاعدة البيانات تعمل
- تحقق من جدار الحماية

### المشكلة: الموقع يحمّل ببطء
**الحل:**
- تحقق من موارد الخادم
- استخدم CDN
- قلل حجم الملفات

### المشكلة: خطأ في التوثيق
**الحل:**
- تحقق من متغيرات البيئة
- تأكد من صحة التوكنات
- أعد تشغيل الخادم

---

## 📞 الدعم

للمزيد من المساعدة:
- 📖 [وثائق Render](https://render.com/docs)
- 📖 [وثائق PlanetScale](https://planetscale.com/docs)
- 🐛 [GitHub Issues](https://github.com/podehgnbh/Clinics-Management/issues)

---

**تم الإنشاء:** 2026-03-16
**آخر تحديث:** 2026-03-16
