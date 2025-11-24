import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AMSSidebar } from '../components/AMSSidebar'
import { API_BASE_URLS } from '../config/api'

type Category = {
  id: string
  name: string
}

const API_BASE_URL = `${API_BASE_URLS.AMS}/Categories`

export function CategoryList() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Read initial state from URL
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
  const searchFromUrl = searchParams.get('search') || ''
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchFromUrl)
  const [currentPage, setCurrentPage] = useState(pageFromUrl)
  const [pageSize] = useState(12)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)
  const editingCategoryIdRef = useRef<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
  })

  // Fetch categories from API with pagination
  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL categories (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      } else {
        params.page = currentPage.toString()
        params.pageSize = pageSize.toString()
      }
      
      console.log('Fetching categories with params:', params)
      
      const response = await axios.get(API_BASE_URL, {
        params,
      })

      const data = response.data
      console.log('Fetched categories data:', data)
      
      // Read pagination headers
      const headers = response.headers
      const totalCountHeader = 
        headers['x-total-count'] || 
        headers['X-Total-Count'] ||
        headers['X-TOTAL-COUNT']
      
      const totalPagesHeader = 
        headers['x-total-pages'] || 
        headers['X-Total-Pages'] ||
        headers['X-TOTAL-PAGES']
      
      // Update pagination state from response headers (only if not searching)
      if (!searchQuery.trim()) {
        if (totalCountHeader) {
          const count = parseInt(totalCountHeader, 10)
          if (!isNaN(count)) {
            setTotalCount(count)
          } else if (Array.isArray(data)) {
            setTotalCount(data.length)
          }
        } else if (Array.isArray(data)) {
          setTotalCount(data.length)
        }
        
        if (totalPagesHeader) {
          const pages = parseInt(totalPagesHeader, 10)
          if (!isNaN(pages)) {
            setTotalPages(pages)
          } else {
            const calculatedPages = Math.ceil(totalCount / pageSize)
            setTotalPages(calculatedPages || 1)
          }
        } else {
          const calculatedPages = Math.ceil(totalCount / pageSize)
          setTotalPages(calculatedPages || 1)
        }
      }
      
      // Set categories data with client-side filtering by name
      if (Array.isArray(data)) {
        let filteredData = data
        if (searchQuery.trim()) {
          const searchLower = searchQuery.trim().toLowerCase()
          filteredData = data.filter((cat: Category) => 
            cat.name.toLowerCase().includes(searchLower)
          )
          console.log(`Filtered ${data.length} categories to ${filteredData.length} matching "${searchQuery}"`)
        }
        
        setCategories(filteredData)
        setError(null)
        
        // Update total count and pagination based on filtered results when searching
        if (searchQuery.trim()) {
          setTotalCount(filteredData.length)
          setTotalPages(1)
          if (currentPage !== 1) {
            setCurrentPage(1)
          }
        }
        
        // Restore scroll position after update
        if (!searchQuery.trim() && editingCategoryIdRef.current && scrollContainerRef.current) {
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollPositionRef.current
              editingCategoryIdRef.current = null
            }
          }, 50)
        }
      } else {
        console.error('Invalid data format, expected array:', data)
        setCategories([])
        setError('Invalid response format from server')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred while fetching categories'
        setError(errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching categories')
      }
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  // Add new category
  const handleAdd = async () => {
    try {
      setError(null)
      
      const name = (formData.name || '').trim()
      
      if (!name) {
        setError('Name is required')
        return
      }
      
      const payload = {
        name: name,
      }
      
      await axios.post(API_BASE_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      setSearchQuery('')
      setCurrentPage(1)
      setShowModal(false)
      setFormData({
        name: '',
      })
      
      await fetchCategories()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data || {}
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages
              return `${field}: ${msg}`
            })
            .join('\n')
          setError(`Validation errors:\n${validationErrors}`)
        } else {
          const errorMessage = errorData.title || errorData.message || err.message || 'Failed to add category'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to add category')
      }
    }
  }

  // Update category
  const handleUpdate = async () => {
    if (!editingCategory) return

    try {
      setError(null)
      
      // Store current scroll position before update
      if (scrollContainerRef.current) {
        scrollPositionRef.current = scrollContainerRef.current.scrollTop
      }
      editingCategoryIdRef.current = editingCategory.id
      
      const name = (formData.name || '').trim()
      
      if (!name) {
        setError('Name is required')
        return
      }
      
      const payload = {
        name: name,
      }
      
      await axios.put(`${API_BASE_URL}/${editingCategory.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await fetchCategories()
      
      setShowModal(false)
      setEditingCategory(null)
      setFormData({
        name: '',
      })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data || {}
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages
              return `${field}: ${msg}`
            })
            .join('\n')
          setError(`Validation errors:\n${validationErrors}`)
        } else {
          const errorMessage = errorData.title || errorData.message || err.message || 'Failed to update category'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update category')
      }
    }
  }

  // Delete category
  const handleDelete = async () => {
    if (!deletingCategory) return

    try {
      setError(null)
      await axios.delete(`${API_BASE_URL}/${deletingCategory.id}`)
      await fetchCategories()
      setShowDeleteModal(false)
      setDeletingCategory(null)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to delete category'
        setError(errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete category')
      }
    }
  }

  // Open modal for add
  const openAddModal = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
    })
    setShowModal(true)
  }

  // Open modal for edit
  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
    })
    setShowModal(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category)
    setShowDeleteModal(true)
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim()) {
      setError('Please fill in the required field (Name)')
      return
    }
    
    if (editingCategory) {
      await handleUpdate()
    } else {
      await handleAdd()
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchCategories()
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
    
    const currentUrl = searchParams.toString()
    const newUrl = params.toString()
    if (currentUrl !== newUrl) {
      setSearchParams(params, { replace: true })
    }
  }, [currentPage, searchQuery, searchParams, setSearchParams])

  // Reset to page 1 when search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    const urlPage = parseInt(params.get('page') || '1', 10)
    
    if (urlPage === 1 && currentPage !== 1 && searchQuery) {
      setCurrentPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCategories()
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery])

  return (
    <div className="flex min-h-screen">
      <AMSSidebar />

      <main className="flex-1 ml-72 px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Category</h1>
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
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  fetchCategories()
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
                <col className="w-[80%]" />
                <col className="w-[20%]" />
              </colgroup>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    NAME
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    ACTION
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable Table Body */}
          <div ref={scrollContainerRef} className="overflow-y-auto max-h-[600px] flex-1">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[80%]" />
                <col className="w-[20%]" />
              </colgroup>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-sm text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(category)}
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
                            onClick={() => openDeleteModal(category)}
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
                    <td colSpan={2} className="px-6 py-4 text-center text-sm text-slate-500">
                      No categories found
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
              
              {/* Page Number Buttons */}
              {totalPages > 0 ? (
                (() => {
                  const pages: number[] = []
                  
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i)
                    }
                  } else {
                    pages.push(1)
                    if (currentPage > 3) pages.push(-1)
                    
                    const start = Math.max(2, currentPage - 1)
                    const end = Math.min(totalPages - 1, currentPage + 1)
                    for (let i = start; i <= end; i++) {
                      pages.push(i)
                    }
                    
                    if (currentPage < totalPages - 2) pages.push(-1)
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
                        title={`Page ${page} of ${totalPages}`}
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className={`${editingCategory ? 'bg-blue-600' : 'bg-green-600'} px-6 py-4`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  {editingCategory ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Please enter category name"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
                    setFormData({
                      name: '',
                    })
                  }}
                  className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-lg text-white font-medium transition shadow-md hover:shadow-lg ${
                    editingCategory
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center ring-4 ring-red-100">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Delete Category</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Are you sure you want to delete "{deletingCategory.name}"?
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. This will permanently delete the category.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingCategory(null)
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

