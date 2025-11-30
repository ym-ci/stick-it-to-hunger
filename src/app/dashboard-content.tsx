"use client";

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

export default function DashboardContent() {
  const [data] = api.donation.getDashboardData.useSuspenseQuery();

  const donationGoal = 750;
  const progressPercentage = Math.min(
    (data.totalAmount / donationGoal) * 100,
    100,
  );

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 md:p-8">
      <div className="w-full max-w-[1600px] min-w-[320px] space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
            YM Stick it to Hunger Food Drive
          </h1>
          <p className="mt-2 text-lg text-gray-600 md:text-xl">Dashboard</p>
        </div>

        {/* Progress Bar */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900">
              Donation Goal Progress
            </CardTitle>
            <CardDescription>
              {data.totalAmount.toFixed(1)} lbs of {donationGoal} lbs goal (
              {progressPercentage.toFixed(1)}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-8 w-full overflow-hidden rounded-full border border-orange-200 bg-orange-100">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 md:text-sm">
              <span>0 lbs</span>
              <span className="font-semibold text-orange-600">
                {(donationGoal - data.totalAmount).toFixed(1)} lbs remaining
              </span>
              <span>{donationGoal} lbs</span>
            </div>
          </CardContent>
        </Card>
        {/* Tables */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-900">
                Food Donated by Each House
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>House Name</TableHead>
                    <TableHead className="text-right">
                      Donations (lbs)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.houseDonations.map((house, idx) => (
                    <TableRow key={house.house}>
                      <TableCell className="font-bold text-orange-600">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {house.house}
                      </TableCell>
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
              <CardTitle className="text-red-900">
                Top 5 Student Donors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Place</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">
                      Donations (lbs)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topDonors.map((donor, idx) => (
                    <TableRow key={donor.name}>
                      <TableCell className="font-bold text-orange-600">
                        {idx + 1}
                        {idx === 0
                          ? "st"
                          : idx === 1
                            ? "nd"
                            : idx === 2
                              ? "rd"
                              : "th"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {donor.name}
                      </TableCell>
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

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">
                Total Amount Donated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600 md:text-4xl">
                {data.totalAmount.toFixed(1)} lbs
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-white to-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">
                Total Number of Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600 md:text-4xl">
                {data.totalStudents}
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-gradient-to-br from-white to-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900">
                Amount Donated by Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600 md:text-4xl">
                {data.staffAmount.toFixed(1)} lbs
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">
                Amount Donated by Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600 md:text-4xl">
                {data.studentAmount.toFixed(1)} lbs
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  );
}
