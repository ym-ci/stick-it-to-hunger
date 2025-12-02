"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/server/better-auth/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const dynamic = 'force-dynamic';


export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [status, setStatus] = useState<string>("");

  // Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [role, setRole] = useState<"Student" | "Staff" | "Community">(
    "Student",
  );
  const [house, setHouse] = useState<
    "Hyperion" | "Themis" | "Crius" | "Thea" | "Oceanus" | ""
  >("");
  const [formStatus, setFormStatus] = useState("");

  const { data: donorSuggestions } = api.donation.searchDonors.useQuery(
    { query: name },
    { enabled: name.length >= 2 },
  );

  const createMutation = api.donation.create.useMutation({
    onSuccess: () => {
      setFormStatus("Donation added successfully!");
      setName("");
      setAmount("");
      setRole("Student");
      setHouse("");
      // Clear success message after 3 seconds
      setTimeout(() => setFormStatus(""), 3000);
    },
    onError: (error) => {
      setFormStatus(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("");

    createMutation.mutate({
      name,
      amount: parseFloat(amount),
      role,
      house: house || undefined,
    });
  };

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
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Admin Dashboard</h1>

        <Card>
          <CardHeader>
            <CardTitle>Add Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    list="donor-suggestions"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Donor Name"
                  />
                  <datalist id="donor-suggestions">
                    {donorSuggestions?.map((suggestion) => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="amount"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Amount (kg)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="role"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) =>
                      setRole(
                        e.target.value as "Student" | "Staff" | "Community",
                      )
                    }
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                    <option value="Community">Community</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="house"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    House (Optional)
                  </label>
                  <select
                    id="house"
                    value={house}
                    onChange={(e) =>
                      setHouse(
                        e.target.value as
                          | "Hyperion"
                          | "Themis"
                          | "Crius"
                          | "Thea"
                          | "Oceanus"
                          | "",
                      )
                    }
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select House...</option>
                    <option value="Hyperion">Hyperion</option>
                    <option value="Themis">Themis</option>
                    <option value="Crius">Crius</option>
                    <option value="Thea">Thea</option>
                    <option value="Oceanus">Oceanus</option>
                  </select>
                </div>
              </div>

              {formStatus && (
                <p
                  className={`text-sm ${formStatus.startsWith("Error") ? "text-red-600" : "text-green-600"}`}
                >
                  {formStatus}
                </p>
              )}

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="ring-offset-background focus-visible:ring-ring inline-flex h-10 w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 md:w-auto"
              >
                {createMutation.isPending ? "Adding..." : "Add Donation"}
              </button>
            </form>
          </CardContent>
        </Card>

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
                  className="ring-offset-background focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  {recalculateMutation.isPending
                    ? "Recalculating..."
                    : "Recalculate"}
                </button>
              </div>
              {status && (
                <p
                  className={`text-sm ${status.startsWith("Error") ? "text-red-600" : "text-green-600"}`}
                >
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
