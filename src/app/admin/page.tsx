"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/server/better-auth/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPage() {
    const router = useRouter();
    const { data: session, isPending: isSessionPending } = authClient.useSession();
    const [status, setStatus] = useState<string>("");

    const recalculateMutation = api.donation.recalculate.useMutation({
        onSuccess: () => {
            setStatus("Aggregates recalculated successfully!");
        },
        onError: (error) => {
            setStatus(`Error: ${error.message}`);
        },
    });

    useEffect(() => {
        if (!isSessionPending && !session) {
            router.push("/sign-in"); 
        }
    }, [session, isSessionPending, router]);

    if (isSessionPending) {
        return <div className="p-8">Loading...</div>;
    }

    if (!session) {
        return null; 
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <h3 className="font-medium">Recalculate Aggregates</h3>
                                    <p className="text-sm text-gray-500">
                                        Manually trigger a recalculation of all donation statistics.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => recalculateMutation.mutate()}
                                    disabled={recalculateMutation.isPending}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-black text-white hover:bg-gray-800"
                                >
                                    {recalculateMutation.isPending ? "Recalculating..." : "Recalculate"}
                                </button>
                            </div>
                            {status && (
                                <p className={`text-sm ${status.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
                                    {status}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
