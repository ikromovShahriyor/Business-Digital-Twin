"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ScenarioStudio } from "@/components/simulator/ScenarioStudio";

export default function SimulatorPage() {
  return (
    <DashboardLayout>
      <ScenarioStudio />
    </DashboardLayout>
  );
}
