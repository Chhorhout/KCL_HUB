import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HRMSSidebar } from '../components/HRMSSidebar'

type Department = {
  id: string
  name: string
}

type DepartmentWithCount = Department & {
  employeeCount?: number
}

type Employee = {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  hireDate: string
  departmentId: string
}

const API_BASE_URL = 'http://localhost:5045/api/Department'
const EMPLOYEE_API_URL = 'http://localhost:5045/api/Employee'

export function DepartmentList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Read initial state from URL
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
  const searchFromUrl = searchParams.get('search') || ''
  
  const [departments, setDepartments] = useState<DepartmentWithCount[]>([])
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({})
  const [employeesByDepartment, setEmployeesByDepartment] = useState<Record<string, Employee[]>>({})
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set())
  const [employeePageByDepartment, setEmployeePageByDepartment] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchFromUrl)
  const [currentPage, setCurrentPage] = useState(pageFromUrl)
  const [pageSize] = useState(4)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [employeesPerPage] = useState(6) // Number of employee cards to show per page
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({ name: '' })

  // Navigate to employees filtered by department
  const viewEmployees = (departmentId: string) => {
    navigate(`/hrms/employee?departmentId=${departmentId}`)
  }

  // Fetch employee counts and employees for departments
  const fetchEmployeeCounts = async (departmentIds: string[]) => {
    try {
      const counts: Record<string, number> = {}
      const employeesByDept: Record<string, Employee[]> = {}
      
      // Initialize counts and employee arrays for all departments
      departmentIds.forEach(id => {
        counts[id] = 0
        employeesByDept[id] = []
      })
      
      // Fetch all employees and group by department
      const response = await axios.get(EMPLOYEE_API_URL)
      if (Array.isArray(response.data)) {
        response.data.forEach((emp: Employee) => {
          // Only process employees that belong to one of the departments we're displaying
          if (emp.departmentId && departmentIds.includes(emp.departmentId)) {
            counts[emp.departmentId] = (counts[emp.departmentId] || 0) + 1
            if (!employeesByDept[emp.departmentId]) {
              employeesByDept[emp.departmentId] = []
            }
            employeesByDept[emp.departmentId].push(emp)
          }
        })
        setEmployeeCounts(counts)
        setEmployeesByDepartment(employeesByDept)
      }
    } catch (err) {
      console.error('Error fetching employee counts:', err)
      // Don't show error to user, just log it
    }
  }

  // Toggle department expansion to show/hide employees
  const toggleDepartment = (departmentId: string) => {
    const newExpanded = new Set(expandedDepartments)
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId)
    } else {
      newExpanded.add(departmentId)
      // Initialize page to 1 when expanding
      setEmployeePageByDepartment(prev => ({ ...prev, [departmentId]: 1 }))
    }
    setExpandedDepartments(newExpanded)
  }

  // Set employee page for a specific department
  const setEmployeePage = (departmentId: string, page: number) => {
    setEmployeePageByDepartment(prev => ({ ...prev, [departmentId]: page }))
  }

  // Get paginated employees for a department
  const getPaginatedEmployees = (employees: Employee[], departmentId: string) => {
    const currentPage = employeePageByDepartment[departmentId] || 1
    const startIndex = (currentPage - 1) * employeesPerPage
    const endIndex = startIndex + employeesPerPage
    return employees.slice(startIndex, endIndex)
  }

  // Get total pages for employees in a department
  const getEmployeePages = (employees: Employee[]) => {
    return Math.ceil(employees.length / employeesPerPage)
  }

  // Get employee count for a department
  const getEmployeeCount = (departmentId: string) => {
    return employeeCounts[departmentId] || 0
  }

  // Fetch departments from API with pagination using axios
  const fetchDepartments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters for server-side pagination
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL departments (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (searchQuery.trim()) {
        // Don't send page/pageSize when searching - we'll filter client-side
        // Optionally send search to backend for server-side filtering too
        params.search = searchQuery.trim()
      } else {
        // Normal pagination when not searching
        params.page = currentPage.toString()
        params.pageSize = pageSize.toString()
      }
      
      console.log('Fetching departments with params:', params)
      
      // Use axios to fetch data - easier to access response headers
      const response = await axios.get(API_BASE_URL, {
        params,
        // headers: {
        //   'Content-Type': 'application/json',
        // },
      })

      console.log('Response status:', response.status)
      console.log('All response headers:', response.headers)
      console.log('Response headers keys:', Object.keys(response.headers))
      
      // IMPORTANT: Check if custom headers are accessible
      // If only 'content-type' is visible, the server needs to expose headers via CORS
      const availableHeaders = Object.keys(response.headers)
      console.log('Available headers count:', availableHeaders.length)
      console.log('⚠️ CORS Issue: If pagination headers are missing, add Access-Control-Expose-Headers to server')
      
      const data = response.data
      console.log('Fetched departments data:', data)
      console.log('Number of departments:', Array.isArray(data) ? data.length : 0)
      
      // Read pagination headers from response
      // Note: Headers are only accessible if server exposes them via Access-Control-Expose-Headers
      const totalCountHeader = 
        response.headers['x-total-count'] || 
        response.headers['X-Total-Count'] ||
        response.headers['X-TOTAL-COUNT']
      
      const totalPagesHeader = 
        response.headers['x-total-pages'] || 
        response.headers['X-Total-Pages'] ||
        response.headers['X-TOTAL-PAGES']
      
      const currentPageHeader = 
        response.headers['x-current-page'] || 
        response.headers['X-Current-Page'] ||
        response.headers['X-CURRENT-PAGE']
      
      console.log('Pagination headers found:', {
        'X-Total-Count': totalCountHeader || 'NOT ACCESSIBLE (CORS issue)',
        'X-Total-Pages': totalPagesHeader || 'NOT ACCESSIBLE (CORS issue)',
        'X-Current-Page': currentPageHeader || 'NOT ACCESSIBLE (CORS issue)',
      })
      
      if (!totalCountHeader || !totalPagesHeader) {
        console.warn('⚠️ Pagination headers not accessible! Server needs to add:')
        console.warn('   Access-Control-Expose-Headers: X-Total-Count, X-Total-Pages, X-Current-Page, X-Page-Size')
      }
      
      // Update pagination state from response headers (only if not searching)
      // When searching, pagination will be updated after client-side filtering
      if (!searchQuery.trim()) {
        if (totalCountHeader) {
          const count = parseInt(totalCountHeader, 10)
          if (!isNaN(count)) {
            console.log('Setting totalCount from header:', count)
            setTotalCount(count)
          } else {
            console.warn('X-Total-Count header is not a valid number:', totalCountHeader)
            // Fallback: use data length if available
            if (Array.isArray(data)) {
              setTotalCount(data.length)
            }
          }
        } else {
          console.warn('X-Total-Count header not found in response')
          // Fallback: use data length if available
          if (Array.isArray(data)) {
            const fallbackCount = data.length
            console.log('Using fallback totalCount from data length:', fallbackCount)
            setTotalCount(fallbackCount)
          } else {
            setTotalCount(0)
          }
        }
        
        if (totalPagesHeader) {
          const pages = parseInt(totalPagesHeader, 10)
          if (!isNaN(pages)) {
            console.log('Setting totalPages from header:', pages)
            setTotalPages(pages)
          } else {
            console.warn('X-Total-Pages header is not a valid number:', totalPagesHeader)
            // Fallback: calculate from totalCount
            const calculatedPages = Math.ceil(totalCount / pageSize)
            setTotalPages(calculatedPages || 1)
          }
        } else {
          console.warn('X-Total-Pages header not found in response')
          // Fallback: calculate from totalCount or data length
          const calculatedPages = Math.ceil(totalCount / pageSize)
          console.log('Using fallback totalPages calculated from totalCount:', calculatedPages || 1)
          setTotalPages(calculatedPages || 1)
        }
      }
      
      // Set departments data with client-side filtering by name
      if (Array.isArray(data)) {
        console.log('Setting departments:', data.length, 'items')
        console.log('Departments data:', data)
        
        // Client-side filtering: filter by department name if search query exists
        let filteredData = data
        if (searchQuery.trim()) {
          const searchLower = searchQuery.trim().toLowerCase()
          filteredData = data.filter((dept: Department) => 
            dept.name.toLowerCase().includes(searchLower)
          )
          console.log(`Filtered ${data.length} departments to ${filteredData.length} matching "${searchQuery}"`)
        }
        
        setDepartments(filteredData)
        setError(null) // Clear any errors on success
        
        // Update total count and pagination based on filtered results when searching
        if (searchQuery.trim()) {
          setTotalCount(filteredData.length)
          // Show all filtered results on one page (no pagination when searching)
          setTotalPages(1)
          // Reset to page 1 when showing filtered results
          if (currentPage !== 1) {
            setCurrentPage(1)
          }
        }
        
        // Fetch employee counts for each department
        fetchEmployeeCounts(filteredData.map(d => d.id))
      } else {
        console.error('Invalid data format, expected array:', data)
        setDepartments([])
        setError('Invalid response format from server')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred while fetching departments'
        console.error('Axios error:', err.response?.status, errorMessage)
        setError(errorMessage)
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching departments'
        console.error('Error fetching departments:', err)
        setError(errorMessage)
      }
      setDepartments([])
    } finally {
      setLoading(false)
      console.log('Fetch completed, loading set to false')
    }
  }

  // Add new department
  const handleAdd = async () => {
    try {
      setError(null)
      await axios.post(API_BASE_URL, { name: formData.name }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await fetchDepartments()
      // Employee counts will be refreshed automatically when departments are fetched
      setShowModal(false)
      setFormData({ name: '' })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to add department'
        setError(errorMessage)
        console.error('Error adding department:', err.response?.status, errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to add department')
        console.error('Error adding department:', err)
      }
    }
  }

  // Update department
  const handleUpdate = async () => {
    if (!editingDepartment) return

    try {
      setError(null)
      await axios.put(`${API_BASE_URL}/${editingDepartment.id}`, { name: formData.name }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await fetchDepartments()
      setShowModal(false)
      setEditingDepartment(null)
      setFormData({ name: '' })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to update department'
        setError(errorMessage)
        console.error('Error updating department:', err.response?.status, errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update department')
        console.error('Error updating department:', err)
      }
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (dept: Department) => {
    setDeletingDepartment(dept)
    setShowDeleteModal(true)
  }

  // Delete department
  const handleDelete = async () => {
    if (!deletingDepartment) return

    try {
      setError(null)
      await axios.delete(`${API_BASE_URL}/${deletingDepartment.id}`)

      await fetchDepartments()
      setShowDeleteModal(false)
      setDeletingDepartment(null)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to delete department'
        setError(errorMessage)
        console.error('Error deleting department:', err.response?.status, errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete department')
        console.error('Error deleting department:', err)
      }
    }
  }

  // Open modal for add
  const openAddModal = () => {
    setEditingDepartment(null)
    setFormData({ name: '' })
    setShowModal(true)
  }

  // Open modal for edit
  const openEditModal = (dept: Department) => {
    setEditingDepartment(dept)
    setFormData({ name: dept.name })
    setShowModal(true)
  }

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingDepartment) {
      handleUpdate()
    } else {
      handleAdd()
    }
  }

  // Update URL when page or search changes
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString())
    }
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    }
    
    // Only update if URL is different to avoid loops
    const currentUrl = searchParams.toString()
    const newUrl = params.toString()
    if (currentUrl !== newUrl) {
      setSearchParams(params, { replace: true })
    }
  }, [currentPage, searchQuery, searchParams, setSearchParams])

  // Reset to page 1 when search changes
  useEffect(() => {
    // Reset to page 1 when search query changes
    if (currentPage !== 1 && searchQuery.trim()) {
      setCurrentPage(1)
    }
    // Also collapse all expanded departments when searching
    if (searchQuery.trim()) {
      setExpandedDepartments(new Set())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  // Debounced search effect - wait 500ms after user stops typing before fetching
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Fetching departments - Page:', currentPage, 'Search:', searchQuery)
      fetchDepartments()
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery])

  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left - now fixed in component */}
      <HRMSSidebar />

      {/* Main content area */}
      <main className="flex-1 ml-72 px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Department Records</h1>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => navigate('/hrms/employee')}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  title="View all employees"
                >
                  View Employees →
                </button>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by department name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  // Force immediate search on Enter
                  fetchDepartments()
                }
              }}
              className="w-full px-4 py-2 pl-10 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                title="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0 overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[30%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
              </colgroup>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    EMPLOYEES
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    ACTION
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable Table Body - Only this scrolls */}
          <div className="overflow-y-auto max-h-[600px] flex-1">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[30%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
              </colgroup>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">
                      Loading departments...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-red-600">
                      Error: {error}
                    </td>
                  </tr>
                ) : departments.length > 0 ? (
                  departments.map((dept) => {
                    const empCount = getEmployeeCount(dept.id)
                    const employees = employeesByDepartment[dept.id] || []
                    const isExpanded = expandedDepartments.has(dept.id)
                    return (
                      <>
                        <tr key={dept.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleDepartment(dept.id)}
                                className="text-slate-400 hover:text-slate-600 transition"
                                title={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                <svg
                                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => viewEmployees(dept.id)}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                title="View employees in this department"
                              >
                                {dept.name}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900">
                            {dept.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => toggleDepartment(dept.id)}
                              className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition"
                              title={`${isExpanded ? 'Hide' : 'Show'} ${empCount} employee${empCount !== 1 ? 's' : ''}`}
                            >
                              <svg
                                className="w-5 h-5 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                              </svg>
                              <span className="font-medium">{empCount}</span>
                              <span className="text-slate-500 text-xs">employee{empCount !== 1 ? 's' : ''}</span>
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => viewEmployees(dept.id)}
                              className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50 transition"
                              title="View Employees"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => openEditModal(dept)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition"
                              title="Edit"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDeleteModal(dept)}
                              className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition"
                              title="Delete"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Employee List - Card View */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="px-6 py-6 bg-gradient-to-br from-slate-50 to-slate-100">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base font-bold text-slate-800">
                                  Employees in {dept.name}
                                </h4>
                                <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                                  {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
                                </span>
                              </div>
                              {employees.length > 0 ? (
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {getPaginatedEmployees(employees, dept.id).map((emp) => (
                                    <div
                                      key={emp.id}
                                      className="bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-5 group"
                                    >
                                      <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                            <svg
                                              className="w-6 h-6 text-white"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                              />
                                            </svg>
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                            {emp.firstName} {emp.lastName}
                                          </h5>
                                          <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                              <svg
                                                className="w-4 h-4 text-slate-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                              </svg>
                                              <span className="truncate">{emp.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                              <svg
                                                className="w-4 h-4 text-slate-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                />
                                              </svg>
                                              <span>{emp.phoneNumber}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-4 pt-4 border-t border-slate-200">
                                        <button
                                          onClick={() => navigate(`/hrms/employee?departmentId=${dept.id}`)}
                                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg font-medium text-sm transition-colors group-hover:bg-blue-100"
                                        >
                                          <span>View Details</span>
                                          <svg
                                            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 5l7 7-7 7"
                                            />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                    ))}
                                  </div>
                                  
                                  {/* Pagination for Employees */}
                                  {employees.length > employeesPerPage && (() => {
                                    const totalEmployeePages = getEmployeePages(employees)
                                    const currentEmployeePage = employeePageByDepartment[dept.id] || 1
                                    return (
                                      <div className="flex items-center justify-between pt-4 border-t border-slate-300">
                                        <div className="text-sm text-slate-600">
                                          Showing {((currentEmployeePage - 1) * employeesPerPage) + 1} to {Math.min(currentEmployeePage * employeesPerPage, employees.length)} of {employees.length} employees
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => setEmployeePage(dept.id, 1)}
                                            disabled={currentEmployeePage === 1}
                                            className="px-3 py-1.5 border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-sm font-medium"
                                            title="First page"
                                          >
                                            ««
                                          </button>
                                          <button
                                            onClick={() => setEmployeePage(dept.id, currentEmployeePage - 1)}
                                            disabled={currentEmployeePage === 1}
                                            className="px-3 py-1.5 border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-sm font-medium"
                                            title="Previous page"
                                          >
                                            ‹
                                          </button>
                                          
                                          {/* Page Numbers */}
                                          {totalEmployeePages <= 7 ? (
                                            // Show all pages if 7 or fewer
                                            Array.from({ length: totalEmployeePages }, (_, i) => i + 1).map((page) => (
                                              <button
                                                key={page}
                                                onClick={() => setEmployeePage(dept.id, page)}
                                                className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                                                  currentEmployeePage === page
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                                                }`}
                                              >
                                                {page}
                                              </button>
                                            ))
                                          ) : (
                                            // Show first, current area, and last
                                            <>
                                              <button
                                                onClick={() => setEmployeePage(dept.id, 1)}
                                                className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                                                  currentEmployeePage === 1
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                                                }`}
                                              >
                                                1
                                              </button>
                                              {currentEmployeePage > 3 && <span className="px-2 text-sm text-slate-500">...</span>}
                                              
                                              {(() => {
                                                const pages: number[] = []
                                                const start = Math.max(2, currentEmployeePage - 1)
                                                const end = Math.min(totalEmployeePages - 1, currentEmployeePage + 1)
                                                for (let i = start; i <= end; i++) {
                                                  if (i !== 1 && i !== totalEmployeePages) {
                                                    pages.push(i)
                                                  }
                                                }
                                                return pages.map((page) => (
                                                  <button
                                                    key={page}
                                                    onClick={() => setEmployeePage(dept.id, page)}
                                                    className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                                                      currentEmployeePage === page
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                        : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                  >
                                                    {page}
                                                  </button>
                                                ))
                                              })()}
                                              
                                              {currentEmployeePage < totalEmployeePages - 2 && <span className="px-2 text-sm text-slate-500">...</span>}
                                              <button
                                                onClick={() => setEmployeePage(dept.id, totalEmployeePages)}
                                                className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                                                  currentEmployeePage === totalEmployeePages
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                                                }`}
                                              >
                                                {totalEmployeePages}
                                              </button>
                                            </>
                                          )}
                                          
                                          <button
                                            onClick={() => setEmployeePage(dept.id, currentEmployeePage + 1)}
                                            disabled={currentEmployeePage === totalEmployeePages}
                                            className="px-3 py-1.5 border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-sm font-medium"
                                            title="Next page"
                                          >
                                            ›
                                          </button>
                                          <button
                                            onClick={() => setEmployeePage(dept.id, totalEmployeePages)}
                                            disabled={currentEmployeePage === totalEmployeePages}
                                            className="px-3 py-1.5 border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-sm font-medium"
                                            title="Last page"
                                          >
                                            »»
                                          </button>
                                        </div>
                                      </div>
                                    )
                                  })()}
                                </>
                              ) : (
                                <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
                                  <svg
                                    className="w-12 h-12 text-slate-400 mx-auto mb-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                  <p className="text-sm font-medium text-slate-600">No employees in this department</p>
                                  <p className="text-xs text-slate-500 mt-1">Add employees to get started</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">
                      No departments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* First Page Button */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || totalPages === 0}
                className="px-3 py-1.5 border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-sm font-medium"
                title="First page"
              >
                ««
              </button>
              
              {/* Previous Page Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || totalPages === 0}
                className="px-3 py-1.5 border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-sm font-medium"
                title="Previous page"
              >
                ‹
              </button>
              
              {/* Page Number Buttons - Constructed from server pagination headers (X-Total-Pages) */}
              {totalPages > 0 ? (
                (() => {
                  const pages: number[] = []
                  
                  // Use totalPages from server response header (X-Total-Pages)
                  if (totalPages <= 7) {
                    // Show all pages if 7 or fewer
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i)
                    }
                  } else {
                    // Show first page, current page area, and last page
                    pages.push(1)
                    if (currentPage > 3) pages.push(-1) // Ellipsis
                    
                    const start = Math.max(2, currentPage - 1)
                    const end = Math.min(totalPages - 1, currentPage + 1)
                    for (let i = start; i <= end; i++) {
                      pages.push(i)
                    }
                    
                    if (currentPage < totalPages - 2) pages.push(-1) // Ellipsis
                    pages.push(totalPages)
                  }
                  
                  return pages.map((page, idx) => {
                    if (page === -1) {
                      return <span key={`ellipsis-${idx}`} className="px-2 text-sm text-slate-500">...</span>
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                        title={`Page ${page} of ${totalPages} (from server header)`}
                      >
                        {page}
                      </button>
                    )
                  })
                })()
              ) : (
                <span className="px-2 text-sm text-slate-500">No pages available</span>
              )}
              
              {/* Next Page Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-sm font-medium"
                title="Next page"
              >
                ›
              </button>
              
              {/* Last Page Button */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-sm font-medium"
                title="Last page"
              >
                »»
              </button>
            </div>
            <div className="text-sm text-slate-600">
              {totalCount > 0 ? (
                <>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
                </>
              ) : (
                'No records'
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header with Icon */}
            <div className={`${editingDepartment ? 'bg-blue-600' : 'bg-green-600'} px-6 py-4`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  {editingDepartment ? (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {editingDepartment ? 'Edit Department' : 'Add New Department'}
                </h2>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter department name"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Enter a unique name for the department
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingDepartment(null)
                    setFormData({ name: '' })
                  }}
                  className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-lg text-white font-medium transition shadow-md hover:shadow-lg ${
                    editingDepartment
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {editingDepartment ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Update Department
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Department
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center ring-4 ring-red-100">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Delete Department</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Are you sure you want to delete "{deletingDepartment.name}"?
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. This will permanently delete the department.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingDepartment(null)
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





