"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DigitalTwinCanvas } from "@/components/twin/DigitalTwinCanvas";
import { api } from "@/lib/api";
import { DigitalTwinSnapshot, DigitalTwinNodeGraph } from "@/types";

export default function DigitalTwinPage() {
  const [snapshot, setSnapshot] = useState<DigitalTwinSnapshot | null>(null);
  const [nodeGraph, setNodeGraph] = useState<DigitalTwinNodeGraph | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getTwinSnapshot(), api.getTwinNodeGraph()])
      .then(([snap, graph]) => {
        setSnapshot(snap);
        setNodeGraph(graph);
      })
      .catch((err) => console.error("Error loading twin:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      {loading || !snapshot ? (
        <div className="h-96 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DigitalTwinCanvas snapshot={snapshot} nodeGraph={nodeGraph || undefined} />
      )}
    </DashboardLayout>
  );
}
