// components/admin/DashboardStats.js
export default function DashboardStats({ stats }) {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className={`${colors[index % colors.length]} text-white overflow-hidden shadow rounded-lg`}>
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm font-medium">{stat.name}</div>
            <div className="mt-1 text-3xl font-semibold">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}