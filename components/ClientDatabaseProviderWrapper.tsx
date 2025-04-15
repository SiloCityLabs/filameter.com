"use client";

import React from "react";
import dynamic from "next/dynamic";
import Spinner from "react-bootstrap/Spinner";

const DynamicDatabaseProviderInternal = dynamic(
  () =>
    import("@/contexts/DatabaseContext").then((mod) => mod.DatabaseProvider),
  {
    ssr: false,
    loading: () => (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Database Context...</span>
        </Spinner>
      </div>
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
