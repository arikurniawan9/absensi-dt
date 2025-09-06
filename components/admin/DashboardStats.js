// components/admin/DashboardStats.js
export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm font-medium text-gray-500">{stat.name}</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}