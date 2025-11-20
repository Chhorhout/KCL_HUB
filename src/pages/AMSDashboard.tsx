import { AMSSidebar } from '../components/AMSSidebar'

export function AMSDashboard() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left - now fixed in component */}
      <AMSSidebar />

      {/* Main content area */}
      <main className="flex-1 ml-72 px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AMS Dashboard</h1>
          <p className="text-slate-600">Attendance Management System</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Access</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              Mark Attendance
            </button>
            <button className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium">
              View Reports
            </button>
            <button className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium">
              Manage Leaves
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

