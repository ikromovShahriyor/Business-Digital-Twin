"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdvisorTerminal } from "@/components/advisor/AdvisorTerminal";

export default function AdvisorPage() {
  return (
    <DashboardLayout>
      <AdvisorTerminal />
    </DashboardLayout>
  );
}
