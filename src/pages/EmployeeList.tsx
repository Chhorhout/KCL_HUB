import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HRMSSidebar } from '../components/HRMSSidebar'
import { API_BASE_URLS } from '../config/api'

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

type Department = {
  id: string
  name: string
}

const API_BASE_URL = `${API_BASE_URLS.HRMS}/Employee`
const DEPARTMENT_API_URL = `${API_BASE_URLS.HRMS}/Department`

export function EmployeeList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const departmentIdFilter = searchParams.get('departmentId')
  
  // Read initial state from URL
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
  const searchFromUrl = searchParams.get('search') || ''
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchFromUrl)
  const [currentPage, setCurrentPage] = useState(pageFromUrl)
  const [pageSize] = useState(12) // Set page size to 12
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)
  const editingEmployeeIdRef = useRef<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showCreateDept, setShowCreateDept] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState('')
  const [creatingDept, setCreatingDept] = useState(false)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    hireDate: '',
    departmentId: '',
  })

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(DEPARTMENT_API_URL)
      setDepartments(response.data)
    } catch (err) {
      console.error('Error fetching departments:', err)
    }
  }

  // Get department name by ID
  const getDepartmentName = (id: string) => {
    const dept = departments.find((d) => d.id === id)
    return dept ? dept.name : id.substring(0, 8) + '...'
  }

  // Helper function to escape CSV values (handles commas, quotes, and newlines)
  const escapeCSVValue = (value: string): string => {
    if (value === null || value === undefined) return '""'
    const stringValue = String(value)
    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  // Export employees to CSV
  const exportToCSV = () => {
    if (employees.length === 0) {
      setError('No employees to export')
      return
    }

    try {
      // Prepare CSV headers
      const headers = ['Name', 'Email', 'Phone Number', 'Department', 'Date of Birth', 'Hire Date']
      
      // Convert employees data to CSV rows
      const csvRows = [
        headers.join(','), // Header row
        ...employees.map((emp) => {
          const name = escapeCSVValue(`${emp.firstName} ${emp.lastName}`)
          const email = escapeCSVValue(emp.email)
          const phone = escapeCSVValue(emp.phoneNumber)
          const department = escapeCSVValue(getDepartmentName(emp.departmentId))
          const dob = escapeCSVValue(new Date(emp.dateOfBirth).toLocaleDateString())
          const hireDate = escapeCSVValue(new Date(emp.hireDate).toLocaleDateString())
          return [name, email, phone, department, dob, hireDate].join(',')
        }),
      ]

      // Create CSV content with BOM for Excel compatibility
      const BOM = '\uFEFF'
      const csvContent = BOM + csvRows.join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      // Generate filename with current date
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `employees_${dateStr}.csv`
      
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export CSV: ' + (err instanceof Error ? err.message : 'Unknown error'))
      console.error('Error exporting CSV:', err)
    }
  }

  // Create new department
  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) {
      setError('Department name is required')
      return
    }

    try {
      setCreatingDept(true)
      setError(null)
      const response = await axios.post(DEPARTMENT_API_URL, { name: newDepartmentName.trim() }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const newDept = response.data
      await fetchDepartments()
      setFormData({ ...formData, departmentId: newDept.id })
      setNewDepartmentName('')
      setShowCreateDept(false)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to create department'
        setError(errorMessage)
        console.error('Error creating department:', err.response?.status, errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create department')
        console.error('Error creating department:', err)
      }
    } finally {
      setCreatingDept(false)
    }
  }

  // Fetch employees from API with pagination using axios
  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters for server-side pagination
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL employees (no pagination) for client-side filtering
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
      
      // Add department filter if provided
      if (departmentIdFilter) {
        params.departmentId = departmentIdFilter
      }
      
      console.log('Fetching employees with params:', params)
      
      // Use axios to fetch data - easier to access response headers
      const response = await axios.get(API_BASE_URL, {
        params,
      })

      console.log('Response status:', response.status)
      console.log('All response headers:', response.headers)
      console.log('Response headers keys:', Object.keys(response.headers))
      
      // IMPORTANT: Check if custom headers are accessible
      // If only 'content-type' is visible, the server needs to expose headers via CORS
      const availableHeaders = Object.keys(response.headers)
      console.log('Available headers count:', availableHeaders.length)
      console.log('⚠️ CORS Issue: If pagination headers are missing, add Access-Control-Expose-Headers to server')
      
      // Log all header keys to help debug
      console.log('All header keys:', availableHeaders.map(key => `"${key}"`).join(', '))
      
      const data = response.data
      console.log('Fetched employees data:', data)
      console.log('Number of employees:', Array.isArray(data) ? data.length : 0)
      
      // Read pagination headers from response
      // Note: Axios normalizes headers to lowercase, but check multiple variations
      // Also check using get() method which might work better
      const headers = response.headers
      const totalCountHeader = 
        headers['x-total-count'] || 
        headers['X-Total-Count'] ||
        headers['X-TOTAL-COUNT'] ||
        (typeof headers.get === 'function' ? headers.get('x-total-count') || headers.get('X-Total-Count') : null)
      
      const totalPagesHeader = 
        headers['x-total-pages'] || 
        headers['X-Total-Pages'] ||
        headers['X-TOTAL-PAGES'] ||
        (typeof headers.get === 'function' ? headers.get('x-total-pages') || headers.get('X-Total-Pages') : null)
      
      const currentPageHeader = 
        headers['x-current-page'] || 
        headers['X-Current-Page'] ||
        headers['X-CURRENT-PAGE'] ||
        (typeof headers.get === 'function' ? headers.get('x-current-page') || headers.get('X-Current-Page') : null)
      
      const pageSizeHeader = 
        headers['x-page-size'] || 
        headers['X-Page-Size'] ||
        headers['X-PAGE-SIZE'] ||
        (typeof headers.get === 'function' ? headers.get('x-page-size') || headers.get('X-Page-Size') : null)
      
      console.log('Pagination headers found:', {
        'X-Total-Count': totalCountHeader || 'NOT ACCESSIBLE (CORS issue)',
        'X-Total-Pages': totalPagesHeader || 'NOT ACCESSIBLE (CORS issue)',
        'X-Current-Page': currentPageHeader || 'NOT ACCESSIBLE (CORS issue)',
        'X-Page-Size': pageSizeHeader || 'NOT ACCESSIBLE (CORS issue)',
      })
      
      // Debug: Try to find headers using different methods
      if (!totalCountHeader || !totalPagesHeader) {
        console.warn('⚠️ Pagination headers not accessible! Trying alternative access methods...')
        console.warn('Available headers:', availableHeaders)
        console.warn('Server needs to add: Access-Control-Expose-Headers: X-Total-Count, X-Total-Pages, X-Current-Page, X-Page-Size')
        
        // Try accessing headers directly with different case variations
        for (const key of availableHeaders) {
          if (key.toLowerCase().includes('total') || key.toLowerCase().includes('page')) {
            console.log(`Found header: ${key} = ${headers[key]}`)
          }
        }
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
      
      // Set employees data with client-side filtering by name
      if (Array.isArray(data)) {
        console.log('Setting employees:', data.length, 'items')
        console.log('Employees data:', data)
        
        // Client-side filtering: filter by employee name (firstName + lastName) if search query exists
        let filteredData = data
        if (searchQuery.trim()) {
          const searchLower = searchQuery.trim().toLowerCase()
          filteredData = data.filter((emp: Employee) => {
            const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
            return fullName.includes(searchLower)
          })
          console.log(`Filtered ${data.length} employees to ${filteredData.length} matching "${searchQuery}"`)
        }
        
        setEmployees(filteredData)
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
        
        // Restore scroll position after update (if we're not searching and have a stored position)
        if (!searchQuery.trim() && editingEmployeeIdRef.current && scrollContainerRef.current) {
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollPositionRef.current
              editingEmployeeIdRef.current = null // Clear after restoring
            }
          }, 50)
        }
      } else {
        console.error('Invalid data format, expected array:', data)
        setEmployees([])
        setError('Invalid response format from server')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred while fetching employees'
        console.error('Axios error:', err.response?.status, errorMessage)
        setError(errorMessage)
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching employees'
        console.error('Error fetching employees:', err)
        setError(errorMessage)
      }
      setEmployees([])
    } finally {
      setLoading(false)
      console.log('Fetch completed, loading set to false')
    }
  }

  // Add new employee
  const handleAdd = async () => {
    try {
      setError(null)
      
      // Client-side validation - check both existence and non-empty after trim
      const firstName = (formData.firstName || '').trim()
      const lastName = (formData.lastName || '').trim()
      const email = (formData.email || '').trim()
      const phoneNumber = (formData.phoneNumber || '').trim()
      
      if (!firstName) {
        setError('First Name is required')
        return
      }
      if (!lastName) {
        setError('Last Name is required')
        return
      }
      if (!email) {
        setError('Email is required')
        return
      }
      if (!phoneNumber) {
        setError('Phone Number is required')
        return
      }
      if (!formData.dateOfBirth) {
        setError('Date of Birth is required')
        return
      }
      if (!formData.hireDate) {
        setError('Hire Date is required')
        return
      }
      if (!formData.departmentId || formData.departmentId.trim() === '') {
        setError('Please select a department')
        return
      }
      
      // Prepare data with proper date formatting and wrap in employeeDto
      // API expects PascalCase field names wrapped in employeeDto
      const payload = {
          FirstName: firstName,
          LastName: lastName,
          Email: email,
          PhoneNumber: phoneNumber,
          // Ensure dates are in ISO format (add time if needed)
          DateOfBirth: formData.dateOfBirth ? `${formData.dateOfBirth}T00:00:00` : formData.dateOfBirth,
          HireDate: formData.hireDate ? `${formData.hireDate}T00:00:00` : formData.hireDate,
          DepartmentId: formData.departmentId,
        
      }
      
      console.log('Adding employee with payload:', JSON.stringify(payload, null, 2))
      console.log('Form data state:', formData)
      
      // Double-check payload before sending
      if (!payload.FirstName || !payload.LastName || !payload.Email || !payload.PhoneNumber) {
        setError('Required fields are missing. Please check the form.')
        console.error('Payload validation failed:', payload)
        return
      }
      
      await axios.post(API_BASE_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Reset search and pagination to show the new employee
      setSearchQuery('')
      setCurrentPage(1)
      setShowModal(false)
      setShowCreateDept(false)
      setNewDepartmentName('')
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        hireDate: '',
        departmentId: '',
      })
      
      // Immediately fetch employees to show the new one
      await fetchEmployees()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data || {}
        
        // Handle validation errors
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages
              return `${field}: ${msg}`
            })
            .join('\n')
          setError(`Validation errors:\n${validationErrors}`)
        } else {
          const errorMessage = errorData.title || errorData.message || err.message || 'Failed to add employee'
          setError(errorMessage)
        }
        console.error('Error adding employee:', err.response?.status, err.response?.data)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to add employee')
        console.error('Error adding employee:', err)
      }
    }
  }

  // Update employee
  const handleUpdate = async () => {
    if (!editingEmployee) return

    try {
      setError(null)
      
      // Store current scroll position and employee ID before update
      if (scrollContainerRef.current) {
        scrollPositionRef.current = scrollContainerRef.current.scrollTop
      }
      editingEmployeeIdRef.current = editingEmployee.id
      
      // Client-side validation - check both existence and non-empty after trim
      const firstName = (formData.firstName || '').trim()
      const lastName = (formData.lastName || '').trim()
      const email = (formData.email || '').trim()
      const phoneNumber = (formData.phoneNumber || '').trim()
      
      if (!firstName) {
        setError('First Name is required')
        return
      }
      if (!lastName) {
        setError('Last Name is required')
        return
      }
      if (!email) {
        setError('Email is required')
        return
      }
      if (!phoneNumber) {
        setError('Phone Number is required')
        return
      }
      if (!formData.dateOfBirth) {
        setError('Date of Birth is required')
        return
      }
      if (!formData.hireDate) {
        setError('Hire Date is required')
        return
      }
      if (!formData.departmentId || formData.departmentId.trim() === '') {
        setError('Please select a department')
        return
      }
      
      // Prepare data with proper date formatting - same format as handleAdd (no nesting)
      // API expects PascalCase field names
      const payload = {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        PhoneNumber: phoneNumber,
        // Ensure dates are in ISO format (add time if needed)
        DateOfBirth: formData.dateOfBirth ? `${formData.dateOfBirth}T00:00:00` : formData.dateOfBirth,
        HireDate: formData.hireDate ? `${formData.hireDate}T00:00:00` : formData.hireDate,
        DepartmentId: formData.departmentId,
      }
      
      console.log('Updating employee with payload:', JSON.stringify(payload, null, 2))
      console.log('Form data state:', formData)
      
      // Double-check payload before sending
      if (!payload.FirstName || !payload.LastName || !payload.Email || !payload.PhoneNumber) {
        setError('Required fields are missing. Please check the form.')
        console.error('Payload validation failed:', payload)
        return
      }
      
      await axios.put(`${API_BASE_URL}/${editingEmployee.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Fetch employees - scroll position will be restored automatically in fetchEmployees
      await fetchEmployees()
      
      setShowModal(false)
      setEditingEmployee(null)
      setShowCreateDept(false)
      setNewDepartmentName('')
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        hireDate: '',
        departmentId: '',
      })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data || {}
        
        // Handle validation errors
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages
              return `${field}: ${msg}`
            })
            .join('\n')
          setError(`Validation errors:\n${validationErrors}`)
        } else {
          const errorMessage = errorData.title || errorData.message || err.message || 'Failed to update employee'
          setError(errorMessage)
        }
        console.error('Error updating employee:', err.response?.status, err.response?.data)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update employee')
        console.error('Error updating employee:', err)
      }
    }
  }

  // Open profile detail modal
  const openProfileModal = (emp: Employee) => {
    setViewingEmployee(emp)
    setShowProfileModal(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (emp: Employee) => {
    setDeletingEmployee(emp)
    setShowDeleteModal(true)
  }

  // Delete employee
  const handleDelete = async () => {
    if (!deletingEmployee) return

    try {
      setError(null)
      await axios.delete(`${API_BASE_URL}/${deletingEmployee.id}`)

      await fetchEmployees()
      setShowDeleteModal(false)
      setDeletingEmployee(null)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to delete employee'
        setError(errorMessage)
        console.error('Error deleting employee:', err.response?.status, errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete employee')
        console.error('Error deleting employee:', err)
      }
    }
  }

  // Open modal for add
  const openAddModal = () => {
    setEditingEmployee(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      hireDate: '',
      departmentId: '',
    })
    setShowModal(true)
  }

  // Open modal for edit
  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp)
    setShowCreateDept(false)
    setNewDepartmentName('')
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phoneNumber: emp.phoneNumber,
      dateOfBirth: emp.dateOfBirth.split('T')[0],
      hireDate: emp.hireDate.split('T')[0],
      departmentId: emp.departmentId,
    })
    setShowModal(true)
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Debug: Log form data before submission
    console.log('Form submitted with data:', formData)
    console.log('Editing employee:', editingEmployee)
    
    // Additional validation check before calling handlers
    if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.email?.trim() || !formData.phoneNumber?.trim()) {
      setError('Please fill in all required fields (First Name, Last Name, Email, Phone Number)')
      return
    }
    
    if (!formData.departmentId || formData.departmentId.trim() === '') {
      setError('Please select a department')
      return
    }
    
    if (editingEmployee) {
      await handleUpdate()
    } else {
      await handleAdd()
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchDepartments()
    console.log('Initial mount - fetching employees')
    fetchEmployees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update URL when page or search changes
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString())
    }
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    }
    
    // Keep departmentId if present
    if (departmentIdFilter) {
      params.set('departmentId', departmentIdFilter)
    }
    
    // Only update if URL is different to avoid loops
    const currentUrl = searchParams.toString()
    const newUrl = params.toString()
    if (currentUrl !== newUrl) {
      setSearchParams(params, { replace: true })
    }
  }, [currentPage, searchQuery, departmentIdFilter, searchParams, setSearchParams])

  // Reset to page 1 when search or departmentId changes (but not on initial load)
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    const urlPage = parseInt(params.get('page') || '1', 10)
    
    // Only reset if we're not restoring from URL and something changed
    if (urlPage === 1 && currentPage !== 1 && (searchQuery || departmentIdFilter)) {
      console.log('Search/department changed, resetting to page 1')
      setCurrentPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, departmentIdFilter])

  // Debounced search effect - wait 500ms after user stops typing before fetching
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Fetching employees - Page:', currentPage, 'Search:', searchQuery, 'Department:', departmentIdFilter)
      fetchEmployees()
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, departmentIdFilter])

  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left - now fixed in component */}
      <HRMSSidebar />

      {/* Main content area */}
      <main className="flex-1 ml-72 px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Employee Records</h1>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => navigate('/hrms/department')}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  title="View all departments"
                >
                  View Departments →
                </button>
                {departmentIdFilter && (
                  <>
                    <span className="text-slate-400">|</span>
                    <p className="text-sm text-slate-600">
                      Filtered by:{' '}
                      <button
                        onClick={() => navigate(`/hrms/department`)}
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                        title="View department details"
                      >
                        {getDepartmentName(departmentIdFilter)}
                      </button>
                    </p>
                    <span className="text-slate-400">|</span>
                    <button
                      onClick={() => navigate('/hrms/employee')}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear filter
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportToCSV}
                disabled={employees.length === 0 || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export to CSV"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
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
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  // Force immediate search on Enter
                  fetchEmployees()
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
            <div className="font-semibold mb-2">Error:</div>
            <div className="whitespace-pre-wrap">{error}</div>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0 overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[22%]" />
                <col className="w-[15%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    PHONE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    DEPARTMENT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    HIRE DATE
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    ACTION
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable Table Body - Only this scrolls */}
          <div ref={scrollContainerRef} className="overflow-y-auto max-h-[600px] flex-1">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[22%]" />
                <col className="w-[15%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[15%]" />
              </colgroup>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {emp.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {emp.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/hrms/employee?departmentId=${emp.departmentId}`)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                            title="View all employees in this department"
                          >
                            {getDepartmentName(emp.departmentId)}
                          </button>
                          <button
                            onClick={() => navigate(`/hrms/department`)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition"
                            title="View department details"
                          >
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
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(emp.hireDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openProfileModal(emp)}
                            className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50 transition"
                            title="View Profile"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(emp)}
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
                            onClick={() => openDeleteModal(emp)}
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">
                      No employees found
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
                  {totalPages > 1 && (
                    <span className="ml-2 text-slate-500">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header with Icon */}
            <div className={`${editingEmployee ? 'bg-blue-600' : 'bg-green-600'} px-6 py-4`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  {editingEmployee ? (
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
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h2>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Please enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Please enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Please enter email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Please enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Hire Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                {!showCreateDept ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={formData.departmentId}
                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                        className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      >
                        <option value="">Please select department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCreateDept(true)}
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium whitespace-nowrap"
                      >
                        + New
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDepartmentName}
                        onChange={(e) => setNewDepartmentName(e.target.value)}
                        className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Please enter department name"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleCreateDepartment()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleCreateDepartment}
                        disabled={creatingDept || !newDepartmentName.trim()}
                        className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {creatingDept ? 'Creating...' : 'Create'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateDept(false)
                          setNewDepartmentName('')
                        }}
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Create a new department or{' '}
                      <button
                        type="button"
                        onClick={() => setShowCreateDept(false)}
                        className="text-blue-600 hover:underline"
                      >
                        select existing
                      </button>
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingEmployee(null)
                    setShowCreateDept(false)
                    setNewDepartmentName('')
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phoneNumber: '',
                      dateOfBirth: '',
                      hireDate: '',
                      departmentId: '',
                    })
                  }}
                  className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-lg text-white font-medium transition shadow-md hover:shadow-lg ${
                    editingEmployee
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {editingEmployee ? (
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
                      Update Employee
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
                      Add Employee
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {showProfileModal && viewingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center ring-4 ring-white ring-opacity-30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {viewingEmployee.firstName} {viewingEmployee.lastName}
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">Employee Profile</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowProfileModal(false)
                    setViewingEmployee(null)
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
                  title="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</label>
                      <p className="text-sm font-medium text-slate-900 mt-1">
                        {viewingEmployee.firstName} {viewingEmployee.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</label>
                      <p className="text-sm text-slate-700 mt-1 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {viewingEmployee.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone Number</label>
                      <p className="text-sm text-slate-700 mt-1 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {viewingEmployee.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date of Birth</label>
                      <p className="text-sm text-slate-700 mt-1 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(viewingEmployee.dateOfBirth).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Employment Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</label>
                      <p className="text-sm text-slate-700 mt-1 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <button
                          onClick={() => {
                            setShowProfileModal(false)
                            setViewingEmployee(null)
                            navigate(`/hrms/employee?departmentId=${viewingEmployee.departmentId}`)
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {getDepartmentName(viewingEmployee.departmentId)}
                        </button>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hire Date</label>
                      <p className="text-sm text-slate-700 mt-1 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(viewingEmployee.hireDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee ID</label>
                      <p className="text-sm text-slate-700 mt-1 font-mono">
                        {viewingEmployee.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false)
                    setViewingEmployee(null)
                  }}
                  className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false)
                    setViewingEmployee(null)
                    openEditModal(viewingEmployee)
                  }}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingEmployee && (
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
                <h2 className="text-xl font-bold text-slate-900">Delete Employee</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Are you sure you want to delete "{deletingEmployee.firstName} {deletingEmployee.lastName}"?
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. This will permanently delete the employee.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingEmployee(null)
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

