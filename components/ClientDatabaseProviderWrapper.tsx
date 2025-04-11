"use client";

import React from "react";
import dynamic from "next/dynamic";

const DynamicDatabaseProviderInternal = dynamic(
  () =>
    import("@/contexts/DatabaseContext").then((mod) => mod.DatabaseProvider),
  {
    ssr: false,
    loading: () => (
      <div className="text-center p-5">Loading Database Context...</div>
    ),
  }
);

export default function ClientDatabaseProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DynamicDatabaseProviderInternal>
      {children}
    </DynamicDatabaseProviderInternal>
  );
}
