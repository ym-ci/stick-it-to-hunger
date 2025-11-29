"use client";

import { Suspense } from "react";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

function DashboardContent() {
  const [data] = api.donation.getDashboardData.useSuspenseQuery();

  const chartConfig = {
    amount: {
      label: "Donations (lbs)",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-5xl font-bold text-transparent">
            YM Stick it to Hunger Food Drive
          </h1>
          <p className="mt-2 text-xl text-gray-600">Dashboard</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">Total Amount Donated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-orange-600">
                {data.totalAmount.toFixed(1)} lbs
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-white to-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Total Number of Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-600">{data.totalStudents}</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-gradient-to-br from-white to-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900">Amount Donated by Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-amber-600">
                {data.staffAmount.toFixed(1)} lbs
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">Amount Donated by Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-orange-600">
                {data.studentAmount.toFixed(1)} lbs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-900">Food Donated by Each House</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>House Name</TableHead>
                    <TableHead className="text-right">Donations (kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.houseDonations.map((house) => (
                    <TableRow key={house.house}>
                      <TableCell className="font-medium">{house.house}</TableCell>
                      <TableCell className="text-right">
                        {house.amount.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Top 5 Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Place</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Donations (lbs)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topDonors.map((donor, idx) => (
                    <TableRow key={donor.name}>
                      <TableCell className="font-bold text-orange-600">
                        {idx + 1}
                        {idx === 0 ? "st" : idx === 1 ? "nd" : idx === 2 ? "rd" : "th"}
                      </TableCell>
                      <TableCell className="font-medium">{donor.name}</TableCell>
                      <TableCell className="text-right">
                        {donor.amount.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Chart */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900">Donation Timeline</CardTitle>
            <CardDescription>Total weight of donations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <LineChart
                data={data.timeline}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-orange-200" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}-${date.getDate()}`;
                  }}
                />
                <YAxis label={{ value: "Donations (kg)", angle: -90, position: "insideLeft" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--chart-1))", r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-2xl font-semibold text-orange-600">Loading dashboard...</div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
