import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AMSSidebar } from '../components/AMSSidebar'
import { API_BASE_URLS } from '../config/api'

type AssetStatus = {
  id: string
  status: string
  description: string
  assetId: string
  // API returns these directly
  assetName?: string
}

type AssetStatusHistory = {
  id: string
  name: string
  assetId: string
  // API returns these directly
  assetName?: string
}

type Asset = {
  id: string
  name: string
  serialNumber: string
}

const API_BASE_URL = `${API_BASE_URLS.AMS}/AssetStatus`
const HISTORY_API_URL = `${API_BASE_URLS.AMS}/AssetStatusHistory`
const ASSET_API_URL = `${API_BASE_URLS.AMS}/Assets`

export function AssetStatusList() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Read initial state from URL
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
  const searchFromUrl = searchParams.get('search') || ''
  const tabFromUrl = (searchParams.get('tab') || 'status') as 'status' | 'history'
  const historyPageFromUrl = parseInt(searchParams.get('historyPage') || '1', 10)
  const historySearchFromUrl = searchParams.get('historySearch') || ''
  
  const [assetStatuses, setAssetStatuses] = useState<AssetStatus[]>([])
  const [statusHistory, setStatusHistory] = useState<AssetStatusHistory[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchFromUrl)
  const [historySearchQuery, setHistorySearchQuery] = useState(historySearchFromUrl)
  const [currentPage, setCurrentPage] = useState(pageFromUrl)
  const [historyPage, setHistoryPage] = useState(historyPageFromUrl)
  const [pageSize] = useState(12)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [historyTotalCount, setHistoryTotalCount] = useState(0)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState<'status' | 'history'>(tabFromUrl)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const editingStatusIdRef = useRef<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [deletingStatus, setDeletingStatus] = useState<AssetStatus | null>(null)
  const [editingStatus, setEditingStatus] = useState<AssetStatus | null>(null)
  const [editingHistory, setEditingHistory] = useState<AssetStatusHistory | null>(null)
  const [formData, setFormData] = useState({
    status: '',
    description: '',
    assetId: '',
  })
  const [historyFormData, setHistoryFormData] = useState({
    name: '',
    assetId: '',
  })

  // Fetch assets
  const fetchAssets = async () => {
    try {
      const response = await axios.get(ASSET_API_URL)
      if (Array.isArray(response.data)) {
        setAssets(response.data)
      } else {
        console.warn('Assets API returned non-array data:', response.data)
        setAssets([])
      }
    } catch (err) {
      console.error('Error fetching assets:', err)
      setAssets([])
    }
  }

  // Get asset name by ID
  const getAssetName = (id: string | undefined) => {
    if (!id) return 'N/A'
    const asset = assets.find((a) => a.id === id)
    return asset ? asset.name : 'N/A'
  }

  // Fetch asset statuses
  const fetchAssetStatuses = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: Record<string, string> = {
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      console.log('Fetching asset statuses with params:', params)

      const response = await axios.get(API_BASE_URL, {
        params,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', response.status)

      if (response.status === 200) {
        const data = response.data
        console.log('Fetched asset statuses data:', data)

        // Handle pagination headers
        const totalCountHeader = response.headers['x-total-count']
        const totalPagesHeader = response.headers['x-total-pages']

        if (totalCountHeader) {
          const total = parseInt(totalCountHeader, 10)
          setTotalCount(total)
          if (totalPagesHeader) {
            setTotalPages(parseInt(totalPagesHeader, 10))
          } else {
            const calculatedPages = Math.ceil(total / pageSize)
            setTotalPages(calculatedPages || 1)
          }
        } else {
          // Set maintenance records data with client-side filtering
          if (Array.isArray(data)) {
            let filteredData = data
            if (searchQuery.trim()) {
              const searchLower = searchQuery.trim().toLowerCase()
              filteredData = data.filter((status: AssetStatus) => {
                const statusText = (status.status || '').toLowerCase()
                const description = (status.description || '').toLowerCase()
                const assetName = (status.assetName || getAssetName(status.assetId) || '').toLowerCase()
                return statusText.includes(searchLower) || description.includes(searchLower) || assetName.includes(searchLower)
              })
              console.log(`Filtered ${data.length} statuses to ${filteredData.length} matching "${searchQuery}"`)
            }
            setAssetStatuses(filteredData)
            setTotalCount(filteredData.length)
            const calculatedPages = Math.ceil(filteredData.length / pageSize)
            setTotalPages(calculatedPages || 1)
          } else {
            console.warn('API returned non-array data:', data)
            setAssetStatuses([])
            setTotalCount(0)
            setTotalPages(1)
          }
        }

        // Set asset statuses data
        if (Array.isArray(data)) {
          setAssetStatuses(data)
        } else {
          console.warn('API returned non-array data:', data)
          setAssetStatuses([])
        }
      }
    } catch (err: any) {
      console.error('Error fetching asset statuses:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch asset statuses')
      setAssetStatuses([])
      setTotalCount(0)
      setTotalPages(1)
    } finally {
      console.log('Fetch completed, loading set to false')
      setLoading(false)
    }
  }

  // Fetch asset status history
  const fetchStatusHistory = async () => {
    try {
      setHistoryLoading(true)
      setError(null)

      const params: Record<string, string> = {}
      
      // When searching, fetch ALL history (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (historySearchQuery.trim()) {
        // Fetch all for client-side filtering
      } else {
        params.page = historyPage.toString()
        params.pageSize = pageSize.toString()
      }

      const response = await axios.get(HISTORY_API_URL, {
        params,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 200) {
        const data = response.data

        if (Array.isArray(data)) {
          let filteredData = data
          
          // Client-side filtering when searching
          if (historySearchQuery.trim()) {
            const searchLower = historySearchQuery.trim().toLowerCase()
            filteredData = data.filter((history: AssetStatusHistory) => {
              const nameMatch = history.name.toLowerCase().includes(searchLower)
              const assetMatch = (history.assetName || getAssetName(history.assetId)).toLowerCase().includes(searchLower)
              return nameMatch || assetMatch
            })
          }

          // Handle pagination headers (only if not searching)
          const totalCountHeader = response.headers['x-total-count']
          const totalPagesHeader = response.headers['x-total-pages']

          if (!historySearchQuery.trim()) {
            if (totalCountHeader) {
              const total = parseInt(totalCountHeader, 10)
              setHistoryTotalCount(total)
              if (totalPagesHeader) {
                setHistoryTotalPages(parseInt(totalPagesHeader, 10))
              } else {
                const calculatedPages = Math.ceil(total / pageSize)
                setHistoryTotalPages(calculatedPages || 1)
              }
            } else {
              setHistoryTotalCount(data.length)
              const calculatedPages = Math.ceil(data.length / pageSize)
              setHistoryTotalPages(calculatedPages || 1)
            }
          } else {
            // When searching, update count based on filtered results
            setHistoryTotalCount(filteredData.length)
            setHistoryTotalPages(1)
            if (historyPage !== 1) {
              setHistoryPage(1)
            }
          }

          setStatusHistory(filteredData)
        } else {
          console.warn('History API returned non-array data:', data)
          setStatusHistory([])
          setHistoryTotalCount(0)
          setHistoryTotalPages(1)
        }
      }
    } catch (err: any) {
      console.error('Error fetching status history:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch status history')
      setStatusHistory([])
      setHistoryTotalCount(0)
      setHistoryTotalPages(1)
    } finally {
      setHistoryLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    console.log('AssetStatusList: Component mounted, starting data fetch')
    const initializeData = async () => {
      try {
        console.log('Initial mount - fetching asset statuses')
        await fetchAssets()
        await fetchAssetStatuses()
        await fetchStatusHistory()
      } catch (err) {
        console.error('Error initializing data:', err)
        setError('Failed to initialize data')
        setLoading(false)
      }
    }
    initializeData()
  }, [])

  // Update URL when page, search, tab, or pagination changes
  useEffect(() => {
    const params = new URLSearchParams()
    
    // Always set the active tab
    params.set('tab', activeTab)
    
    // Set page based on active tab
    if (activeTab === 'status') {
      if (currentPage > 1) {
        params.set('page', currentPage.toString())
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim())
      }
    } else if (activeTab === 'history') {
      if (historyPage > 1) {
        params.set('historyPage', historyPage.toString())
      }
      if (historySearchQuery.trim()) {
        params.set('historySearch', historySearchQuery.trim())
      }
    }
    
    setSearchParams(params, { replace: true })
  }, [activeTab, currentPage, historyPage, searchQuery, historySearchQuery, setSearchParams])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchAssetStatuses()
      } else {
        setCurrentPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch when page changes
  useEffect(() => {
    fetchAssetStatuses()
  }, [currentPage])

  // Fetch history when history page or search changes
  useEffect(() => {
    if (activeTab === 'history') {
      fetchStatusHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyPage, historySearchQuery, activeTab])

  // Handle add
  const handleAdd = () => {
    setEditingStatus(null)
    editingStatusIdRef.current = null
    setFormData({
      status: '',
      description: '',
      assetId: '',
    })
    setShowModal(true)
  }

  // Handle update
  const handleUpdate = (status: AssetStatus) => {
    setEditingStatus(status)
    editingStatusIdRef.current = status.id
    setFormData({
      status: status.status || '',
      description: status.description || '',
      assetId: status.assetId || '',
    })
    setShowModal(true)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deletingStatus) return

    try {
      setError(null)
      await axios.delete(`${API_BASE_URL}/${deletingStatus.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      await fetchAssetStatuses()
      setShowDeleteModal(false)
      setDeletingStatus(null)
    } catch (err: any) {
      console.error('Error deleting asset status:', err)
      setError(err.response?.data?.message || err.message || 'Failed to delete asset status')
    }
  }

  // Open delete modal
  const openDeleteModal = (status: AssetStatus) => {
    setDeletingStatus(status)
    setShowDeleteModal(true)
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.status.trim()) {
      setError('Status is required')
      return
    }

    if (!formData.assetId) {
      setError('Asset is required')
      return
    }

    try {
      setError(null)
      const payload = {
        status: formData.status.trim(),
        description: formData.description.trim(),
        assetId: formData.assetId,
      }

      if (editingStatus) {
        // Update existing
        await axios.put(`${API_BASE_URL}/${editingStatus.id}`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } else {
        // Create new
        await axios.post(API_BASE_URL, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }

      await fetchAssetStatuses()
      await fetchStatusHistory()
      setShowModal(false)
      setEditingStatus(null)
      editingStatusIdRef.current = null
      setFormData({
        status: '',
        description: '',
        assetId: '',
      })
    } catch (err: any) {
      console.error('Error saving asset status:', err)
      setError(err.response?.data?.message || err.message || 'Failed to save asset status')
    }
  }

  // Handle history add
  const handleHistoryAdd = () => {
    setEditingHistory(null)
    setHistoryFormData({
      name: '',
      assetId: '',
    })
    setShowHistoryModal(true)
  }

  // Handle history update
  const handleHistoryUpdate = (history: AssetStatusHistory) => {
    setEditingHistory(history)
    setHistoryFormData({
      name: history.name || '',
      assetId: history.assetId || '',
    })
    setShowHistoryModal(true)
  }

  // Handle history submit
  const handleHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!historyFormData.name.trim()) {
      setError('History name is required')
      return
    }

    if (!historyFormData.assetId) {
      setError('Asset is required')
      return
    }

    try {
      setError(null)
      const payload = {
        name: historyFormData.name.trim(),
        assetId: historyFormData.assetId,
      }

      if (editingHistory) {
        // Update existing
        await axios.put(`${HISTORY_API_URL}/${editingHistory.id}`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } else {
        // Create new
        await axios.post(HISTORY_API_URL, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }

      await fetchStatusHistory()
      setShowHistoryModal(false)
      setEditingHistory(null)
      setHistoryFormData({
        name: '',
        assetId: '',
      })
    } catch (err: any) {
      console.error('Error saving status history:', err)
      setError(err.response?.data?.message || err.message || 'Failed to save status history')
    }
  }


  return (
    <div className="flex h-screen bg-slate-50">
      <AMSSidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Asset Status</h1>
              <p className="text-sm text-slate-600 mt-1">Manage asset statuses and history</p>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'status' ? (
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Status
                </button>
              ) : (
                <button
                  onClick={handleHistoryAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add History
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 border-b border-slate-200">
            <button
              onClick={() => {
                setActiveTab('status')
                setHistoryPage(1) // Reset history page when switching tabs
              }}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'status'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Status
            </button>
            <button
              onClick={() => {
                setActiveTab('history')
                fetchStatusHistory() // Fetch history when switching to history tab
              }}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-4">
              {activeTab === 'status' && (
                <div className="flex-1 relative">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
              )}
              {activeTab === 'history' && (
                <div className="flex-1 relative">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {historySearchQuery && (
                    <button
                      onClick={() => {
                        setHistorySearchQuery('')
                        setHistoryPage(1)
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
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="flex-1 overflow-hidden bg-white mx-6 my-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
            {/* Scrollable Table Body */}
            <div ref={scrollContainerRef} className="overflow-y-auto max-h-[600px] flex-1">
              {activeTab === 'status' ? (
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[20%]" />
                    <col className="w-[30%]" />
                    <col className="w-[30%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">
                          Loading...
                        </td>
                      </tr>
                    ) : assetStatuses.length > 0 ? (
                      assetStatuses.map((status) => (
                        <tr key={status.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {status.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900">
                            {status.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {status.assetName || getAssetName(status.assetId) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleUpdate(status)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => openDeleteModal(status)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                          No asset statuses found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[35%]" />
                    <col className="w-[35%]" />
                    <col className="w-[30%]" />
                  </colgroup>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {historyLoading ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">
                          Loading...
                        </td>
                      </tr>
                    ) : statusHistory.length > 0 ? (
                      statusHistory.map((history) => (
                        <tr key={history.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm text-slate-900">
                            {history.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {history.assetName || getAssetName(history.assetId) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleHistoryUpdate(history)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                          No status history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {activeTab === 'status' && totalCount > 0 && (
              <div className="border-t border-slate-200 px-6 py-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1 || totalPages <= 1}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                    title="First page"
                  >
                    &lt;&lt;&lt;
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || totalPages <= 1}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                    title="Previous page"
                  >
                    &lt;
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-default"
                  >
                    {currentPage}
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages <= 1}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                    title="Next page"
                  >
                    &gt;
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages <= 1}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                    title="Last page"
                  >
                    &gt;&gt;&gt;
                  </button>
                </div>
                <div className="text-sm text-slate-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
                </div>
              </div>
            )}
            {activeTab === 'history' && historyTotalCount > 0 && (
              <div className="border-t border-slate-200 px-6 py-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHistoryPage(1)}
                    disabled={historyPage === 1 || historyTotalPages <= 1}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                    title="First page"
                  >
                    &lt;&lt;&lt;
                  </button>
                  <button
                    onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                    disabled={historyPage === 1 || historyTotalPages <= 1}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                    title="Previous page"
                  >
                    &lt;
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-default"
                  >
                    {historyPage}
                  </button>
                  <button
                    onClick={() => setHistoryPage((prev) => Math.min(historyTotalPages, prev + 1))}
                    disabled={historyPage === historyTotalPages || historyTotalPages <= 1}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                    title="Next page"
                  >
                    &gt;
                  </button>
                  <button
                    onClick={() => setHistoryPage(historyTotalPages)}
                    disabled={historyPage === historyTotalPages || historyTotalPages <= 1}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                    title="Last page"
                  >
                    &gt;&gt;&gt;
                  </button>
                </div>
                <div className="text-sm text-slate-600">
                  Showing {((historyPage - 1) * pageSize) + 1} to {Math.min(historyPage * pageSize, historyTotalCount)} of {historyTotalCount} records
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingStatus ? 'Edit Asset Status' : 'Add Asset Status'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <input
                  id="status"
                  type="text"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please enter status"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Please enter description"
                />
              </div>

              <div>
                <label htmlFor="assetId" className="block text-sm font-medium text-slate-700 mb-2">
                  Asset <span className="text-red-500">*</span>
                </label>
                <select
                  id="assetId"
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Please select an asset...</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingStatus(null)
                    editingStatusIdRef.current = null
                    setFormData({
                      status: '',
                      description: '',
                      assetId: '',
                    })
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingStatus ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Add/Edit Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingHistory ? 'Edit Status History' : 'Add Status History'}
              </h2>
            </div>
            <form onSubmit={handleHistorySubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="historyName" className="block text-sm font-medium text-slate-700 mb-2">
                  History Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="historyName"
                  type="text"
                  value={historyFormData.name}
                  onChange={(e) => setHistoryFormData({ ...historyFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please enter history name"
                  required
                />
              </div>

              <div>
                <label htmlFor="historyAssetId" className="block text-sm font-medium text-slate-700 mb-2">
                  Asset <span className="text-red-500">*</span>
                </label>
                <select
                  id="historyAssetId"
                  value={historyFormData.assetId}
                  onChange={(e) => setHistoryFormData({ ...historyFormData, assetId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Please select an asset...</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowHistoryModal(false)
                    setEditingHistory(null)
                    setHistoryFormData({
                      name: '',
                      assetId: '',
                    })
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingHistory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Delete Asset Status</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-4">
                Are you sure you want to delete the status <strong>{deletingStatus.status}</strong> for asset{' '}
                <strong>{deletingStatus.assetName || getAssetName(deletingStatus.assetId)}</strong>? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletingStatus(null)
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
        </div>
      )}
    </div>
  )
}

