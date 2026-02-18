import SchoolNetTrendChart from "../components/dashboard/SchoolNetTrendChart";

export default function Dashboard() {
  return (
    <main className="space-y-6">
      <SchoolNetTrendChart endpoint="/dashboard/school-analytics" />
    </main>
  );
}

