import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AMSSidebar } from '../components/AMSSidebar'
import { API_BASE_URLS } from '../config/api'

const API_BASE_URL = API_BASE_URLS.AMS

interface DashboardStats {
  totalAssets: number
  totalMaintenanceRecords: number
  totalOwners: number
  totalMaintainers: number
  totalCategories: number
  totalLocations: number
  totalSuppliers: number
  totalTemporaryUsers: number
}

export function AMSDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    totalMaintenanceRecords: 0,
    totalOwners: 0,
    totalMaintainers: 0,
    totalCategories: 0,
    totalLocations: 0,
    totalSuppliers: 0,
    totalTemporaryUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const [
          assetsRes,
          maintenanceRes,
          ownersRes,
          maintainersRes,
          categoriesRes,
          locationsRes,
          suppliersRes,
          temporaryUsersRes,
        ] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/Assets`, { params: { pageNumber: 1, pageSize: 1 } }),
          axios.get(`${API_BASE_URL}/MaintenanceRecord`, { params: { pageNumber: 1, pageSize: 1 } }),
          axios.get(`${API_BASE_URL}/Owner`, { params: { pageNumber: 1, pageSize: 1 } }),
          axios.get(`${API_BASE_URL}/Maintainer`, { params: { pageNumber: 1, pageSize: 1 } }),
          axios.get(`${API_BASE_URL}/Categories`, { params: { pageNumber: 1, pageSize: 1 } }),
          axios.get(`${API_BASE_URL}/Location`, { params: { pageNumber: 1, pageSize: 1 } }),
          axios.get(`${API_BASE_URL}/Suppliers`, { params: { pageNumber: 1, pageSize: 1 } }),
          axios.get(`${API_BASE_URL}/TemporaryUser`, { params: { pageNumber: 1, pageSize: 1 } }),
        ])

        const getTotalCount = (result: PromiseSettledResult<any>) => {
          if (result.status === 'fulfilled') {
            const totalCount = result.value.headers['x-total-count']
            return totalCount ? parseInt(totalCount, 10) : 0
          }
          return 0
        }

        setStats({
          totalAssets: getTotalCount(assetsRes),
          totalMaintenanceRecords: getTotalCount(maintenanceRes),
          totalOwners: getTotalCount(ownersRes),
          totalMaintainers: getTotalCount(maintainersRes),
          totalCategories: getTotalCount(categoriesRes),
          totalLocations: getTotalCount(locationsRes),
          totalSuppliers: getTotalCount(suppliersRes),
          totalTemporaryUsers: getTotalCount(temporaryUsersRes),
        })
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Failed to load dashboard statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Assets',
      getValue: () => stats.totalAssets,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/ams/asset',
    },
    {
      title: 'Maintenance Records',
      getValue: () => stats.totalMaintenanceRecords,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/ams/maintainer',
    },
    {
      title: 'Owners',
      getValue: () => stats.totalOwners,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      link: '/ams/owner',
    },
    {
      title: 'Maintainers',
      getValue: () => stats.totalMaintainers,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      link: '/ams/maintainer',
    },
    {
      title: 'Categories',
      getValue: () => stats.totalCategories,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      link: '/ams/category',
    },
    {
      title: 'Locations',
      getValue: () => stats.totalLocations,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      link: '/ams/location',
    },
    {
      title: 'Suppliers',
      getValue: () => stats.totalSuppliers,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      link: '/ams/supplier',
    },
    {
      title: 'Temporary Users',
      getValue: () => stats.totalTemporaryUsers,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      link: '/ams/temporary-user',
    },
  ]

  const quickAccessItems = [
    {
      title: 'Manage Assets',
      description: 'View, add, edit, and manage all assets',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      link: '/ams/asset',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Maintenance Records',
      description: 'Track and manage maintenance activities',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      link: '/ams/maintainer',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Invoices',
      description: 'Manage purchase invoices and records',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      link: '/ams/invoice',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Owners',
      description: 'Manage asset owners and ownership records',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      link: '/ams/owner',
      color: 'from-orange-500 to-orange-600',
    },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left */}
      <AMSSidebar />

      {/* Main content area */}
      <main className="flex-1 ml-72 px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AMS Dashboard</h1>
          <p className="text-slate-600">Asset Management System Overview</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Statistics Overview</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
                  <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, index) => (
                <Link
                  key={index}
                  to={card.link}
                  className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${card.bgColor} group-hover:scale-110 transition-transform`}>
                      <div className={card.textColor}>{card.icon}</div>
                    </div>
                    <svg
                      className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 mb-1">{card.title}</h3>
                  <p className="text-2xl font-bold text-slate-900">{card.getValue().toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickAccessItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className={`bg-gradient-to-r ${item.color} rounded-lg p-6 text-white hover:shadow-xl transition-all transform hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white bg-opacity-20 p-2 rounded-lg">{item.icon}</div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-white text-opacity-90 text-sm">{item.description}</p>
                  </div>
                  <svg className="w-6 h-6 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Welcome to AMS Dashboard</h3>
              <p className="text-slate-700 mb-4">
                Manage your assets efficiently with our comprehensive Asset Management System. Track maintenance records,
                manage owners, suppliers, and locations all in one place.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Asset Tracking</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Maintenance Management</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Inventory Control</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Reporting</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
