import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("patients");
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "male",
    chronicDiseases: "",
    medicalHistory: "",
  });
  const [referralData, setReferralData] = useState({
    patientId: "",
    type: "lab_test",
    description: "",
  });

  const clinicId = parseInt(localStorage.getItem("clinicId") || "0");
  const staffId = parseInt(localStorage.getItem("staffId") || "0");

  // Queries
  const patientsQuery = trpc.patient.getByClinic.useQuery({ clinicId });
  const referralsQuery = trpc.referral.getByClinicAndType.useQuery({
    clinicId,
    type: "lab_test",
  });

  // Mutations
  const createPatientMutation = trpc.patient.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء ملف المريض بنجاح!");
      setNewPatient({ name: "", age: "", gender: "male", chronicDiseases: "", medicalHistory: "" });
      patientsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createReferralMutation = trpc.referral.create.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال الطلب بنجاح!");
      setReferralData({ patientId: "", type: "lab_test", description: "" });
      referralsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    createPatientMutation.mutate({
      clinicId,
      name: newPatient.name,
      age: newPatient.age ? parseInt(newPatient.age) : undefined,
      gender: newPatient.gender as any,
      chronicDiseases: newPatient.chronicDiseases,
      medicalHistory: newPatient.medicalHistory,
    });
  };

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralData.patientId) {
      toast.error("اختر مريضاً أولاً");
      return;
    }
    createReferralMutation.mutate({
      clinicId,
      patientId: parseInt(referralData.patientId),
      doctorId: staffId,
      type: referralData.type as any,
      description: referralData.description,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">لوحة تحكم الطبيب</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patients">المرضى</TabsTrigger>
            <TabsTrigger value="referrals">الطلبات</TabsTrigger>
            <TabsTrigger value="results">النتائج</TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إضافة مريض جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePatient} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="اسم المريض"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="العمر"
                      type="number"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    />
                  </div>
                  <Select value={newPatient.gender} onValueChange={(value) => setNewPatient({ ...newPatient, gender: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="الأمراض المزمنة"
                    value={newPatient.chronicDiseases}
                    onChange={(e) => setNewPatient({ ...newPatient, chronicDiseases: e.target.value })}
                  />
                  <textarea
                    placeholder="التاريخ المرضي"
                    className="w-full p-2 border rounded"
                    value={newPatient.medicalHistory}
                    onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                  />
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    {createPatientMutation.isPending ? "جاري الإضافة..." : "إضافة المريض"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Patients List */}
            <div className="grid gap-4">
              {patientsQuery.data?.map((patient) => (
                <Card key={patient.id}>
                  <CardHeader>
                    <CardTitle>{patient.name}</CardTitle>
                    <CardDescription>
                      العمر: {patient.age} - {patient.gender === "male" ? "ذكر" : "أنثى"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إرسال طلب جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateReferral} className="space-y-4">
                  <Select value={referralData.patientId} onValueChange={(value) => setReferralData({ ...referralData, patientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المريض" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientsQuery.data?.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={referralData.type} onValueChange={(value) => setReferralData({ ...referralData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab_test">اختبار مختبري</SelectItem>
                      <SelectItem value="radiology">أشعة</SelectItem>
                      <SelectItem value="prescription">وصفة دواء</SelectItem>
                    </SelectContent>
                  </Select>
                  <textarea
                    placeholder="وصف الطلب"
                    className="w-full p-2 border rounded"
                    value={referralData.description}
                    onChange={(e) => setReferralData({ ...referralData, description: e.target.value })}
                  />
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    {createReferralMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>النتائج والتقارير</CardTitle>
                <CardDescription>عرض نتائج التحاليل والأشعات</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">لا توجد نتائج حالياً</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
