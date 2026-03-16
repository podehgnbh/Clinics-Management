import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function LabTechnicianDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReferral, setSelectedReferral] = useState<number | null>(null);
  const [uploadData, setUploadData] = useState({
    testName: "",
    notes: "",
    file: null as File | null,
  });

  const clinicId = parseInt(localStorage.getItem("clinicId") || "0");

  // Queries
  const referralsQuery = trpc.referral.getByClinicAndType.useQuery({
    clinicId,
    type: "lab_test",
  });

  // Mutations
  const updateStatusMutation = trpc.referral.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الحالة بنجاح!");
      referralsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleUploadResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferral) {
      toast.error("اختر طلباً أولاً");
      return;
    }
    // TODO: Implement file upload
    updateStatusMutation.mutate({
      referralId: selectedReferral,
      status: "completed",
    });
  };

  const pendingReferrals = referralsQuery.data?.filter((r) => r.status === "pending") || [];
  const completedReferrals = referralsQuery.data?.filter((r) => r.status === "completed") || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">لوحة تحكم فني المختبر</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">الطلبات المعلقة ({pendingReferrals.length})</TabsTrigger>
            <TabsTrigger value="completed">المكتملة ({completedReferrals.length})</TabsTrigger>
          </TabsList>

          {/* Pending Referrals */}
          <TabsContent value="pending" className="space-y-6">
            <div className="grid gap-4">
              {pendingReferrals.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 text-center">لا توجد طلبات معلقة</p>
                  </CardContent>
                </Card>
              ) : (
                pendingReferrals.map((referral) => (
                  <Card
                    key={referral.id}
                    className={`cursor-pointer transition ${
                      selectedReferral === referral.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedReferral(referral.id)}
                  >
                    <CardHeader>
                      <CardTitle>طلب #{referral.id}</CardTitle>
                      <CardDescription>
                        المريض: {referral.patientId} - {referral.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>

            {selectedReferral && (
              <Card className="border-blue-500">
                <CardHeader>
                  <CardTitle>رفع نتيجة التحليل</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUploadResult} className="space-y-4">
                    <Input
                      placeholder="اسم التحليل"
                      value={uploadData.testName}
                      onChange={(e) => setUploadData({ ...uploadData, testName: e.target.value })}
                      required
                    />
                    <textarea
                      placeholder="ملاحظات"
                      className="w-full p-2 border rounded"
                      value={uploadData.notes}
                      onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رفع ملف PDF
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                        className="w-full"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending ? "جاري الرفع..." : "رفع النتيجة"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Completed Referrals */}
          <TabsContent value="completed">
            <div className="grid gap-4">
              {completedReferrals.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 text-center">لا توجد نتائج مكتملة</p>
                  </CardContent>
                </Card>
              ) : (
                completedReferrals.map((referral) => (
                  <Card key={referral.id}>
                    <CardHeader>
                      <CardTitle>طلب #{referral.id}</CardTitle>
                      <CardDescription>
                        تم الإكمال بنجاح - {referral.completedAt?.toString()}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
