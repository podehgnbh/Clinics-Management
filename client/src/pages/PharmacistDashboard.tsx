import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PharmacistDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReferral, setSelectedReferral] = useState<number | null>(null);

  const clinicId = parseInt(localStorage.getItem("clinicId") || "0");

  // Queries
  const referralsQuery = trpc.referral.getByClinicAndType.useQuery({
    clinicId,
    type: "prescription",
  });

  // Mutations
  const updateStatusMutation = trpc.referral.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الوصفة بنجاح!");
      referralsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCompletePrescription = () => {
    if (!selectedReferral) {
      toast.error("اختر وصفة أولاً");
      return;
    }
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">لوحة تحكم الصيدلي</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">الوصفات المعلقة ({pendingReferrals.length})</TabsTrigger>
            <TabsTrigger value="completed">المكتملة ({completedReferrals.length})</TabsTrigger>
          </TabsList>

          {/* Pending Prescriptions */}
          <TabsContent value="pending" className="space-y-6">
            <div className="grid gap-4">
              {pendingReferrals.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 text-center">لا توجد وصفات معلقة</p>
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
                      <CardTitle>وصفة #{referral.id}</CardTitle>
                      <CardDescription>
                        المريض: {referral.patientId} - {referral.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        تاريخ الإنشاء: {new Date(referral.createdAt).toLocaleDateString("ar-SA")}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {selectedReferral && (
              <Card className="border-blue-500">
                <CardHeader>
                  <CardTitle>تفاصيل الوصفة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">الأدوية المطلوبة:</h3>
                    <p className="text-gray-600">سيتم عرض تفاصيل الأدوية هنا</p>
                  </div>
                  <Button
                    onClick={handleCompletePrescription}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending ? "جاري التحديث..." : "تم تحضير الوصفة"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Completed Prescriptions */}
          <TabsContent value="completed">
            <div className="grid gap-4">
              {completedReferrals.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 text-center">لا توجد وصفات مكتملة</p>
                  </CardContent>
                </Card>
              ) : (
                completedReferrals.map((referral) => (
                  <Card key={referral.id}>
                    <CardHeader>
                      <CardTitle>وصفة #{referral.id}</CardTitle>
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
