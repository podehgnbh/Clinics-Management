import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const ROLES = [
  { value: "doctor", label: "طبيب" },
  { value: "lab_technician", label: "فني مختبر" },
  { value: "radiologist", label: "فني أشعة" },
  { value: "pharmacist", label: "صيدلي" },
];

export default function StaffRegistration() {
  const clinicId = parseInt(localStorage.getItem("clinicId") || "0");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
  });

  const registerMutation = trpc.staff.register.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الموظف بنجاح!");
      setFormData({ name: "", email: "", password: "", role: "doctor" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId) {
      toast.error("يجب تسجيل العيادة أولاً");
      return;
    }
    registerMutation.mutate({
      clinicId,
      ...formData,
      role: formData.role as any,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">تسجيل الموظفين</CardTitle>
          <CardDescription>أضف أعضاء فريقك الطبي</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاسم الكامل
              </label>
              <Input
                type="text"
                placeholder="أدخل الاسم الكامل"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                placeholder="أدخل البريد الإلكتروني"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <Input
                type="password"
                placeholder="أدخل كلمة المرور"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الدور الوظيفي
              </label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "جاري التسجيل..." : "إضافة الموظف"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
