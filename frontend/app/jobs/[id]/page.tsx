import { Suspense } from "react";
import JobDetailsClient from "./job-details-client";

export default function JobDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-gray-600">Loading job details...</p>
        </div>
      }
    >
      <JobDetailsClient />
    </Suspense>
  );
}