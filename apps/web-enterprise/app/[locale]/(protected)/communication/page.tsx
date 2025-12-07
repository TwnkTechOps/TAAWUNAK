"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { CommunicationHub } from "components/communication/CommunicationHub";

function CommunicationHubPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <CommunicationHub />
    </main>
  );
}

export default function CommunicationPage() {
  return (
    <ProtectedRoute>
      <CommunicationHubPage />
    </ProtectedRoute>
  );
}

