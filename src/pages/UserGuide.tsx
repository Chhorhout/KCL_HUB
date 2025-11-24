import { Link } from 'react-router-dom'

export function UserGuide() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">KCL Portal - Complete User Guide</h1>
          <p className="text-slate-600">Comprehensive guide to using the Asset Management System (AMS) and Human Resource Management System (HRMS)</p>
        </div>

        {/* Table of Contents */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
            <a href="#authentication" className="hover:text-blue-600">1. Authentication</a>
            <a href="#hrms" className="hover:text-blue-600">2. HRMS Module</a>
            <a href="#ams-dashboard" className="hover:text-blue-600">3. AMS Dashboard</a>
            <a href="#asset-management" className="hover:text-blue-600">4. Asset Management</a>
            <a href="#maintainer-management" className="hover:text-blue-600">5. Maintainer Management</a>
            <a href="#owner-management" className="hover:text-blue-600">6. Owner Management</a>
            <a href="#temporary-user" className="hover:text-blue-600">7. Temporary User Management</a>
            <a href="#master-data" className="hover:text-blue-600">8. Master Data Management</a>
            <a href="#common-features" className="hover:text-blue-600">9. Common Features</a>
          </div>
        </section>

        {/* Authentication Section */}
        <section id="authentication" className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            1. Authentication
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Login</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>Navigate to the login page</li>
                <li>Enter your <strong>email</strong> and <strong>password</strong></li>
                <li>Click <strong>Sign In</strong></li>
                <li>You will be redirected to the dashboard upon successful login</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Register (New Users)</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>Click <strong>Register</strong> or navigate to the registration page</li>
                <li>Fill in required information:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Full Name</li>
                    <li>Email Address</li>
                    <li>Password (and confirm password)</li>
                    <li>Select your Role</li>
                  </ul>
                </li>
                <li>Click <strong>Register</strong></li>
                <li>You will be automatically logged in after registration</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Logout</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>Click <strong>Logout</strong> button in the top right corner</li>
                <li>Confirm logout in the popup dialog</li>
                <li>You will be redirected to the login page</li>
              </ol>
            </div>
          </div>
        </section>

        {/* HRMS Section */}
        <section id="hrms" className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            2. HRMS Module
          </h2>

          {/* Department Management */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Department Management</h3>
            <p className="text-slate-700 mb-3">Go to <Link to="/hrms/department" className="text-blue-600 hover:underline">HRMS → Department</Link> from sidebar.</p>
            
            <div className="space-y-3 ml-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">View Departments</h4>
                <p className="text-slate-700">See all departments with employee counts. Click department name or count to view employees.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Add Department</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                  <li>Click <strong>Add</strong> button</li>
                  <li>Enter department name</li>
                  <li>Click <strong>Add Department</strong></li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Edit Department</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                  <li>Click <strong>Edit</strong> icon (pencil) next to department</li>
                  <li>Modify the name</li>
                  <li>Click <strong>Update Department</strong></li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Delete Department</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                  <li>Click <strong>Delete</strong> icon (trash/X) next to department</li>
                  <li>Confirm deletion in popup</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Employee Management */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Employee Management</h3>
            <p className="text-slate-700 mb-3">Go to <Link to="/hrms/employee" className="text-blue-600 hover:underline">HRMS → Employee</Link> from sidebar.</p>
            
            <div className="space-y-3 ml-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">View Employees</h4>
                <p className="text-slate-700">Browse all employees in a paginated table. Use search to filter by name or ID.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Add Employee</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                  <li>Click <strong>Add</strong> button</li>
                  <li>Fill required fields:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>First Name, Last Name</li>
                      <li>Email, Phone Number</li>
                      <li>Date of Birth, Hire Date</li>
                      <li>Department (select existing or create new)</li>
                    </ul>
                  </li>
                  <li>Click <strong>Add Employee</strong></li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Create Department While Adding Employee</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                  <li>Click <strong>+ New</strong> next to department dropdown</li>
                  <li>Enter department name</li>
                  <li>Click <strong>Create</strong></li>
                  <li>The new department will be automatically selected</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Edit Employee</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                  <li>Click <strong>Edit</strong> icon (pencil) in the employee row</li>
                  <li>Update any information</li>
                  <li>Click <strong>Update Employee</strong></li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Delete Employee</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                  <li>Click <strong>Delete</strong> icon (trash/X) in the employee row</li>
                  <li>Confirm deletion in popup</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Filter by Department</h4>
                <p className="text-slate-700">Click department name in employee list to filter. Click <strong>Clear filter</strong> to show all employees.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Export to CSV</h4>
                <p className="text-slate-700">Click <strong>Export CSV</strong> button to download employee data as CSV file.</p>
              </div>
            </div>
          </div>
        </section>

        {/* AMS Dashboard Section */}
        <section id="ams-dashboard" className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            3. AMS Dashboard
          </h2>
          <p className="text-slate-700 mb-3">Go to <Link to="/ams" className="text-blue-600 hover:underline">AMS Dashboard</Link> to view overview statistics.</p>
          <div className="space-y-2 text-slate-700 ml-4">
            <p>The dashboard displays key metrics including:</p>
            <ul className="list-disc list-inside ml-6">
              <li>Total Assets</li>
              <li>Total Maintenance Records</li>
              <li>Total Owners</li>
              <li>Total Maintainers</li>
              <li>Total Categories</li>
              <li>Total Locations</li>
              <li>Total Suppliers</li>
              <li>Total Temporary Users</li>
            </ul>
            <p className="mt-2">Click on any statistic card to navigate to the related management page.</p>
          </div>
        </section>

        {/* Asset Management Section */}
        <section id="asset-management" className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            4. Asset Management
          </h2>
          <p className="text-slate-700 mb-3">Go to <Link to="/ams/asset" className="text-blue-600 hover:underline">AMS → Asset</Link> from sidebar.</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Asset Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Manage your physical assets with full CRUD operations.</p>
                <div>
                  <h4 className="font-semibold mb-1">Add Asset</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Click <strong>Add</strong> button</li>
                    <li>Fill required fields: Name, Serial Number, Category, Location, Supplier, Asset Type, Invoice</li>
                    <li>Click <strong>Add Asset</strong></li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Edit Asset</h4>
                  <p>Click <strong>Edit</strong> icon, modify information, then click <strong>Update Asset</strong>.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Delete Asset</h4>
                  <p>Click <strong>Delete</strong> icon and confirm deletion.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Export to Excel</h4>
                  <p>Click <strong>Export Excel</strong> button to download all assets as Excel file.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Asset Type Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Manage asset types and categories.</p>
                <p>Use <strong>Add</strong> button to create new asset types. Edit or delete using respective icons.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Status Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>View and manage asset statuses.</p>
                <p>Add new statuses, edit existing ones, or delete statuses as needed.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">History Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>View complete history of asset status changes.</p>
                <p>Search through history records using the search bar.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Ownership Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Manage asset ownership records.</p>
                <p>Track which assets belong to which owners.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Maintainer Management Section */}
        <section id="maintainer-management" className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            5. Maintainer Management
          </h2>
          <p className="text-slate-700 mb-3">Go to <Link to="/ams/maintainer" className="text-blue-600 hover:underline">AMS → Maintainer</Link> from sidebar.</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Maintainer Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Manage maintainers (service providers, technicians, etc.).</p>
                <p>Add maintainers with name, email, phone, and maintainer type. Edit or delete as needed.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Maintainer Type Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Manage types of maintainers (e.g., "External Contractor", "Internal Team").</p>
                <p>Create, edit, or delete maintainer types.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Maintenance Record Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Track maintenance activities performed on assets.</p>
                <p>Link maintenance records to specific assets and maintainers.</p>
                <p>Search records by name or related asset/maintainer.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Maintenance Part Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Manage parts used in maintenance activities.</p>
                <p>Link parts to specific maintenance records.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Owner Management Section */}
        <section id="owner-management" className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            6. Owner Management
          </h2>
          <p className="text-slate-700 mb-3">Go to <Link to="/ams/owner" className="text-blue-600 hover:underline">AMS → Owner</Link> from sidebar.</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Owner Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Manage asset owners (individuals or organizations).</p>
                <p>Add owners with name and owner type. Edit or delete owners as needed.</p>
                <p>View which assets are owned by each owner.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Owner Type Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Manage types of owners (e.g., "Individual", "Company", "Department").</p>
                <p>Create, edit, or delete owner types with descriptions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Temporary User Management Section */}
        <section id="temporary-user" className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            7. Temporary User Management
          </h2>
          <p className="text-slate-700 mb-3">Go to <Link to="/ams/temporary-user" className="text-blue-600 hover:underline">AMS → Temporary User</Link> from sidebar.</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Temporary User Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Manage temporary users who may borrow or use assets.</p>
                <p>Add temporary users with name and description.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Temporary Used Record Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Track records of assets temporarily used by users.</p>
                <p>Link records to specific assets and temporary users.</p>
                <p>Search records by name, asset, or user.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Temporary Used Request Tab</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Manage requests for temporary asset usage.</p>
                <p>Link requests to temporary used records and assets.</p>
                <p>Track request status and details.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Master Data Management Section */}
        <section id="master-data" className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            8. Master Data Management
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Category</h3>
              <p className="text-slate-700 ml-4">Go to <Link to="/ams/category" className="text-blue-600 hover:underline">AMS → Category</Link>. Manage asset categories for organizing assets.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Location</h3>
              <p className="text-slate-700 ml-4">Go to <Link to="/ams/location" className="text-blue-600 hover:underline">AMS → Location</Link>. Manage physical locations where assets are stored or used.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Supplier</h3>
              <p className="text-slate-700 ml-4">Go to <Link to="/ams/supplier" className="text-blue-600 hover:underline">AMS → Supplier</Link>. Manage suppliers/vendors who provide assets. Include contact information.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Invoice</h3>
              <p className="text-slate-700 ml-4">Go to <Link to="/ams/invoice" className="text-blue-600 hover:underline">AMS → Invoice</Link>. Manage purchase invoices linked to assets.</p>
            </div>
          </div>
        </section>

        {/* Common Features Section */}
        <section id="common-features" className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            9. Common Features
          </h2>
          
          <div className="space-y-4">
            {/* Search Functionality */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Search Functionality</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Most pages include a search bar at the top:</p>
                <ul className="list-disc list-inside ml-6">
                  <li>Type to search by name or ID</li>
                  <li>Search is performed in real-time as you type</li>
                  <li>Results are filtered automatically</li>
                  <li>Clear search to show all items</li>
                </ul>
              </div>
            </div>

            {/* Pagination */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Pagination</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Navigate through large datasets using pagination controls:</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
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
                <p className="mt-3">Click page numbers to jump to specific pages. Current page is highlighted in blue.</p>
              </div>
            </div>

            {/* Tabbed Interfaces */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Tabbed Interfaces</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Some pages use tabs to organize related data:</p>
                <ul className="list-disc list-inside ml-6">
                  <li>Click tabs to switch between different views</li>
                  <li>Each tab maintains its own search and pagination state</li>
                  <li>Active tab is highlighted</li>
                  <li>URL updates to reflect current tab (bookmarkable)</li>
                </ul>
                <p className="mt-2"><strong>Example:</strong> Asset page has tabs for Assets, Asset Types, Status, History, and Ownership.</p>
              </div>
            </div>

            {/* Form Validation */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Form Validation</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>All forms include validation:</p>
                <ul className="list-disc list-inside ml-6">
                  <li>Required fields are marked with <strong className="text-red-600">red asterisk (*)</strong></li>
                  <li>Invalid input shows error messages</li>
                  <li>Submit button is disabled until all required fields are filled</li>
                  <li>Email format is validated automatically</li>
                  <li>Date fields use calendar pickers</li>
                </ul>
              </div>
            </div>

            {/* State Persistence */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">State Persistence</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>The application remembers your preferences:</p>
                <ul className="list-disc list-inside ml-6">
                  <li>Active tab is saved in URL - refresh page to stay on same tab</li>
                  <li>Pagination state is preserved</li>
                  <li>Search queries are maintained</li>
                  <li>You can bookmark specific pages with filters applied</li>
                </ul>
              </div>
            </div>

            {/* Export Functionality */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Export Functionality</h3>
              <div className="space-y-2 ml-4 text-slate-700">
                <p>Some pages support data export:</p>
                <ul className="list-disc list-inside ml-6">
                  <li><strong>Excel Export:</strong> Available on Asset page (main Assets tab)</li>
                  <li><strong>CSV Export:</strong> Available on Employee page</li>
                  <li>Exported files include all visible data</li>
                  <li>Files are named with current date</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Tips Section */}
        <section className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Tips
          </h2>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use <strong>search bar</strong> to quickly find any item by name or ID</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Click on related entity names (e.g., department, asset) to navigate to their detail pages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>All required fields are marked with <strong className="text-red-600">red asterisk (*)</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use browser back button to return to previous pages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Bookmark pages with specific filters/tabs for quick access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Refresh page to reload data - your current tab and filters are preserved</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Check error messages in red boxes for validation issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use sidebar navigation to quickly access different modules</span>
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
          <div className="space-y-2 text-slate-700">
            <p>If you encounter any issues or have questions:</p>
            <ul className="list-disc list-inside ml-6">
              <li>Contact your system administrator</li>
              <li>Check browser console (F12) for error messages</li>
              <li>Ensure you have proper permissions for the action you're trying to perform</li>
              <li>Verify all required fields are filled correctly</li>
            </ul>
          </div>
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
