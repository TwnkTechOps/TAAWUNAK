"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { CommunicationHub } from "components/communication/CommunicationHub";

export default function CommunicationHubPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-7xl px-5 py-8">
        <CommunicationHub />
      </main>
    </ProtectedRoute>
  );
}

