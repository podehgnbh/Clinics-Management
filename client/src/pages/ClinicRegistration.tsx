import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ClinicRegistration() {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [verificationCode, setVerificationCode] = useState("");

  const registerMutation = trpc.clinic.register.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
      setStep("verify");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const verifyMutation = trpc.clinic.verify.useMutation({
    onSuccess: (data) => {
      toast.success("تم التحقق من العيادة بنجاح!");
      localStorage.setItem("clinicId", data.clinicId.toString());
      // Redirect to staff registration
      window.location.href = "/staff-registration";
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    verifyMutation.mutate({
      email: formData.email,
      verificationCode,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">نظام إدارة العيادات</CardTitle>
          <CardDescription>
            {step === "register" ? "تسجيل عيادة جديدة" : "التحقق من البريد الإلكتروني"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم العيادة
                </label>
                <Input
                  type="text"
                  placeholder="أدخل اسم العيادة"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <Input
                  type="tel"
                  placeholder="أدخل رقم الهاتف"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "جاري التسجيل..." : "التالي"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                تم إرسال رمز التحقق إلى {formData.email}
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رمز التحقق
                </label>
                <Input
                  type="text"
                  placeholder="أدخل رمز التحقق المكون من 6 أرقام"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? "جاري التحقق..." : "تحقق"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep("register");
                  setVerificationCode("");
                }}
              >
                العودة
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
