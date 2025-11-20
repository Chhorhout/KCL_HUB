import { Link } from 'react-router-dom'

export function UserGuide() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AMS Dashboard - User Guide</h1>
          <p className="text-slate-600">Learn how to use the AMS Dashboard system</p>
        </div>

        {/* Login Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>Enter your <strong>username</strong> and <strong>password</strong></li>
            <li>Click <strong>Sign In</strong></li>
          </ol>
        </section>

        {/* Logout Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>Click <strong>Logout</strong> button (top right)</li>
            <li>Confirm in the popup</li>
          </ol>
        </section>

        {/* HRMS Department Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            HRMS - Department Management
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">View Departments</h3>
              <p className="text-slate-700">Go to <Link to="/hrms/department" className="text-blue-600 hover:underline">HRMS → Department</Link> from sidebar. See all departments with employee counts.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Add Department</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>Click <strong>Add</strong> button</li>
                <li>Enter department name</li>
                <li>Click <strong>Add Department</strong></li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Edit Department</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>Click <strong>Edit</strong> icon (pencil) next to department</li>
                <li>Change the name</li>
                <li>Click <strong>Update Department</strong></li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Delete Department</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>Click <strong>Delete</strong> icon (X) next to department</li>
                <li>Confirm in popup</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">View Employees</h3>
              <p className="text-slate-700">Click department name or employee count to see employees in that department.</p>
            </div>
          </div>
        </section>

        {/* HRMS Employee Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            HRMS - Employee Management
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">View Employees</h3>
              <p className="text-slate-700">Go to <Link to="/hrms/employee" className="text-blue-600 hover:underline">HRMS → Employee</Link> from sidebar. See all employees in paginated table.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Add Employee</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>Click <strong>Add</strong> button</li>
                <li>Fill required fields:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>First Name, Last Name</li>
                    <li>Email, Phone Number</li>
                    <li>Date of Birth, Hire Date</li>
                    <li>Department (select or create new)</li>
                  </ul>
                </li>
                <li>Click <strong>Add Employee</strong></li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Create Department While Adding Employee</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>Click <strong>+ New</strong> next to department dropdown</li>
                <li>Enter department name</li>
                <li>Click <strong>Create</strong></li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Edit Employee</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>Click <strong>Edit</strong> icon (pencil)</li>
                <li>Update information</li>
                <li>Click <strong>Update Employee</strong></li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Delete Employee</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>Click <strong>Delete</strong> icon (X)</li>
                <li>Confirm in popup</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Filter by Department</h3>
              <p className="text-slate-700">Click department name in employee list to filter. Click <strong>Clear filter</strong> to show all employees.</p>
            </div>
          </div>
        </section>

        {/* Pagination Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Using Pagination
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-700 mb-1">««</div>
              <div className="text-sm text-slate-600">First page</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-700 mb-1">‹</div>
              <div className="text-sm text-slate-600">Previous</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
              <div className="text-sm text-slate-600">Page number</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-700 mb-1">›</div>
              <div className="text-sm text-slate-600">Next</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-700 mb-1">»»</div>
              <div className="text-sm text-slate-600">Last page</div>
            </div>
          </div>
        </section>

        {/* Quick Tips Section */}
        <section className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Quick Tips
          </h2>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use <strong>search bar</strong> to find departments/employees quickly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Switch between <strong>By Name</strong> and <strong>By ID</strong> filters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Click department names to navigate between related data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>All required fields marked with <strong className="text-red-600">red asterisk (*)</strong></span>
            </li>
          </ul>
        </section>

        {/* Support Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Need Help?
          </h2>
          <p className="text-slate-700">Contact your system administrator for support.</p>
        </section>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

