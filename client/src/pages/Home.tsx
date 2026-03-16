import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-blue-600">نظام إدارة العيادات الطبية</h1>
          <p className="text-gray-600 mt-2">نظام متكامل لإدارة العيادات والمرضى والتحاليل والأشعات</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-lg hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="text-2xl">ابدأ الآن</CardTitle>
              <CardDescription>إنشاء عيادة جديدة أو تسجيل الدخول</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate("/clinic-registration")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                تسجيل عيادة جديدة
              </Button>
              <Button
                onClick={() => navigate("/staff-registration")}
                variant="outline"
                className="w-full"
              >
                تسجيل موظف جديد
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="text-2xl">المميزات</CardTitle>
              <CardDescription>ما يقدمه النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ إدارة ملفات المرضى الإلكترونية</li>
                <li>✅ نظام إحالات إلكتروني متقدم</li>
                <li>✅ تخزين آمن للتحاليل والأشعات</li>
                <li>✅ إشعارات فورية للفريق الطبي</li>
                <li>✅ إدارة الوصفات الطبية</li>
                <li>✅ نظام Multi-tenant آمن</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">الأدوار المتاحة</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { role: "الطبيب", desc: "إدارة المرضى والطلبات", icon: "👨‍⚕️" },
              { role: "فني المختبر", desc: "معالجة التحاليل", icon: "🔬" },
              { role: "فني الأشعة", desc: "معالجة الأشعات", icon: "🩻" },
              { role: "الصيدلي", desc: "إدارة الأدوية", icon: "💊" },
            ].map((item, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold text-gray-900">{item.role}</h3>
                  <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>معلومات النظام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>الأمان:</strong> نظام Multi-tenant متقدم يضمن عزل كامل لبيانات كل عيادة عن الأخرى.
            </p>
            <p>
              <strong>التخزين:</strong> جميع الملفات تُخزن بشكل آمن على خوادم موثوقة مع نسخ احتياطية دورية.
            </p>
            <p>
              <strong>الإشعارات:</strong> نظام إشعارات فوري يضمن وصول التنبيهات الهامة للفريق الطبي بسرعة.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
