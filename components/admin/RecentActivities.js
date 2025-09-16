// components/admin/RecentActivities.js
export default function RecentActivities({ activities }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Aktivitas Terbaru</h3>
      </div>
      <div className="p-6">
        <div className="flow-root">
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {activity.user?.nama?.charAt(0) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.user?.nama || 'Pengguna Tidak Dikenal'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.activity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}