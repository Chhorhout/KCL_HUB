import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AMSSidebar } from '../components/AMSSidebar'
import { API_BASE_URLS } from '../config/api'

type TemporaryUser = {
  id: string
  name: string
  description: string
}

type TemporaryUsedRecord = {
  id: string
  name: string
  description: string
  assetId: string
  temporaryUserId: string
  assetName?: string
  temporaryUserName?: string
}

type TemporaryUsedRequest = {
  id: string
  name: string
  description: string
  temporaryUsedRecordId: string
  assetId: string
  temporaryUsedRecordName?: string
  assetName?: string
}

type Asset = {
  id: string
  name: string
  serialNumber: string
}

const API_BASE_URL = `${API_BASE_URLS.AMS}/TemporaryUser`
const TEMPORARY_USED_RECORD_API_URL = `${API_BASE_URLS.AMS}/TemporaryUsedRecords`
const TEMPORARY_USED_REQUEST_API_URL = `${API_BASE_URLS.AMS}/TemporaryUsedRequest`
const ASSET_API_URL = `${API_BASE_URLS.AMS}/Assets`

export function TemporaryUserList() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Read initial state from URL
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
  const searchFromUrl = searchParams.get('search') || ''
  const tabFromUrl = (searchParams.get('tab') || 'temporary-user') as 'temporary-user' | 'temporary-used-record' | 'temporary-used-request'
  const recordPageFromUrl = parseInt(searchParams.get('recordPage') || '1', 10)
  const requestPageFromUrl = parseInt(searchParams.get('requestPage') || '1', 10)
  const recordSearchFromUrl = searchParams.get('recordSearch') || ''
  const requestSearchFromUrl = searchParams.get('requestSearch') || ''
  
  const [temporaryUsers, setTemporaryUsers] = useState<TemporaryUser[]>([])
  const [temporaryUsedRecords, setTemporaryUsedRecords] = useState<TemporaryUsedRecord[]>([])
  const [temporaryUsedRequests, setTemporaryUsedRequests] = useState<TemporaryUsedRequest[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchFromUrl)
  const [recordSearchQuery, setRecordSearchQuery] = useState(recordSearchFromUrl)
  const [requestSearchQuery, setRequestSearchQuery] = useState(requestSearchFromUrl)
  const [currentPage, setCurrentPage] = useState(pageFromUrl)
  const [pageSize] = useState(12)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState<'temporary-user' | 'temporary-used-record' | 'temporary-used-request'>(tabFromUrl)
  
  // Pagination for each tab
  const [recordPage, setRecordPage] = useState(recordPageFromUrl)
  const [recordTotalCount, setRecordTotalCount] = useState(0)
  const [recordTotalPages, setRecordTotalPages] = useState(1)
  
  const [requestPage, setRequestPage] = useState(requestPageFromUrl)
  const [requestTotalCount, setRequestTotalCount] = useState(0)
  const [requestTotalPages, setRequestTotalPages] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)
  const editingTemporaryUserIdRef = useRef<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showDeleteRecordModal, setShowDeleteRecordModal] = useState(false)
  const [showDeleteRequestModal, setShowDeleteRequestModal] = useState(false)
  const [deletingTemporaryUser, setDeletingTemporaryUser] = useState<TemporaryUser | null>(null)
  const [editingTemporaryUser, setEditingTemporaryUser] = useState<TemporaryUser | null>(null)
  const [editingRecord, setEditingRecord] = useState<TemporaryUsedRecord | null>(null)
  const [editingRequest, setEditingRequest] = useState<TemporaryUsedRequest | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<TemporaryUsedRecord | null>(null)
  const [deletingRequest, setDeletingRequest] = useState<TemporaryUsedRequest | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [recordFormData, setRecordFormData] = useState({ name: '', description: '', assetId: '', temporaryUserId: '' })
  const [requestFormData, setRequestFormData] = useState({ name: '', description: '', temporaryUsedRecordId: '', assetId: '' })

  // Fetch assets
  const fetchAssets = async () => {
    try {
      const response = await axios.get(ASSET_API_URL)
      if (Array.isArray(response.data)) {
        setAssets(response.data)
      }
    } catch (err) {
      console.error('Error fetching assets:', err)
      setAssets([])
    }
  }

  // Fetch temporary used records with pagination
  const fetchTemporaryUsedRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL records (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (recordSearchQuery.trim()) {
        // Fetch all for client-side filtering
      } else {
        params.page = recordPage.toString()
        params.pageSize = pageSize.toString()
      }
      
      const response = await axios.get(TEMPORARY_USED_RECORD_API_URL, { params })
      const data = response.data
      const totalCountHeader = response.headers['x-total-count'] || response.headers['X-Total-Count']
      const totalPagesHeader = response.headers['x-total-pages'] || response.headers['X-Total-Pages']
      
      if (Array.isArray(data)) {
        let filteredData = data
        
        // Client-side filtering when searching
        if (recordSearchQuery.trim()) {
          const searchLower = recordSearchQuery.trim().toLowerCase()
          filteredData = data.filter((record: TemporaryUsedRecord) => {
            const nameMatch = record.name.toLowerCase().includes(searchLower)
            const descriptionMatch = (record.description || '').toLowerCase().includes(searchLower)
            const assetMatch = (record.assetName || getAssetName(record.assetId)).toLowerCase().includes(searchLower)
            const userMatch = (record.temporaryUserName || getTemporaryUserName(record.temporaryUserId)).toLowerCase().includes(searchLower)
            return nameMatch || descriptionMatch || assetMatch || userMatch
          })
        }
        
        // Update pagination state from response headers (only if not searching)
        if (!recordSearchQuery.trim()) {
          if (totalCountHeader) {
            setRecordTotalCount(parseInt(totalCountHeader, 10))
            if (totalPagesHeader) {
              setRecordTotalPages(parseInt(totalPagesHeader, 10))
            } else {
              setRecordTotalPages(Math.ceil(parseInt(totalCountHeader, 10) / pageSize) || 1)
            }
          } else {
            setRecordTotalCount(data.length)
            setRecordTotalPages(Math.ceil(data.length / pageSize) || 1)
          }
        } else {
          // When searching, update count based on filtered results
          setRecordTotalCount(filteredData.length)
          setRecordTotalPages(1)
          if (recordPage !== 1) {
            setRecordPage(1)
          }
        }
        
        setTemporaryUsedRecords(filteredData)
      }
    } catch (err) {
      console.error('Error fetching temporary used records:', err)
      setError('Failed to fetch temporary used records')
      setTemporaryUsedRecords([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch temporary used requests with pagination
  const fetchTemporaryUsedRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL requests (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (requestSearchQuery.trim()) {
        // Fetch all for client-side filtering
      } else {
        params.page = requestPage.toString()
        params.pageSize = pageSize.toString()
      }
      
      const response = await axios.get(TEMPORARY_USED_REQUEST_API_URL, { params })
      const data = response.data
      const totalCountHeader = response.headers['x-total-count'] || response.headers['X-Total-Count']
      const totalPagesHeader = response.headers['x-total-pages'] || response.headers['X-Total-Pages']
      
      if (Array.isArray(data)) {
        let filteredData = data
        
        // Client-side filtering when searching
        if (requestSearchQuery.trim()) {
          const searchLower = requestSearchQuery.trim().toLowerCase()
          filteredData = data.filter((request: TemporaryUsedRequest) => {
            const nameMatch = request.name.toLowerCase().includes(searchLower)
            const descriptionMatch = (request.description || '').toLowerCase().includes(searchLower)
            const recordMatch = (request.temporaryUsedRecordName || getTemporaryUsedRecordName(request.temporaryUsedRecordId)).toLowerCase().includes(searchLower)
            const assetMatch = (request.assetName || getAssetName(request.assetId)).toLowerCase().includes(searchLower)
            return nameMatch || descriptionMatch || recordMatch || assetMatch
          })
        }
        
        // Update pagination state from response headers (only if not searching)
        if (!requestSearchQuery.trim()) {
          if (totalCountHeader) {
            setRequestTotalCount(parseInt(totalCountHeader, 10))
            if (totalPagesHeader) {
              setRequestTotalPages(parseInt(totalPagesHeader, 10))
            } else {
              setRequestTotalPages(Math.ceil(parseInt(totalCountHeader, 10) / pageSize) || 1)
            }
          } else {
            setRequestTotalCount(data.length)
            setRequestTotalPages(Math.ceil(data.length / pageSize) || 1)
          }
        } else {
          // When searching, update count based on filtered results
          setRequestTotalCount(filteredData.length)
          setRequestTotalPages(1)
          if (requestPage !== 1) {
            setRequestPage(1)
          }
        }
        
        setTemporaryUsedRequests(filteredData)
      }
    } catch (err) {
      console.error('Error fetching temporary used requests:', err)
      setError('Failed to fetch temporary used requests')
      setTemporaryUsedRequests([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch temporary users from API with pagination
  const fetchTemporaryUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL temporary users (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      } else {
        params.page = currentPage.toString()
        params.pageSize = pageSize.toString()
      }
      
      console.log('Fetching temporary users with params:', params)
      
      const response = await axios.get(API_BASE_URL, {
        params,
      })

      const data = response.data
      console.log('Fetched temporary users data:', data)
      
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
      
      // Set temporary users data with client-side filtering by name or description
      if (Array.isArray(data)) {
        let filteredData = data
        if (searchQuery.trim()) {
          const searchLower = searchQuery.trim().toLowerCase()
          filteredData = data.filter((tu: TemporaryUser) => 
            tu.name.toLowerCase().includes(searchLower) ||
            (tu.description && tu.description.toLowerCase().includes(searchLower))
          )
          console.log(`Filtered ${data.length} temporary users to ${filteredData.length} matching "${searchQuery}"`)
        }
        
        setTemporaryUsers(filteredData)
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
        if (!searchQuery.trim() && editingTemporaryUserIdRef.current && scrollContainerRef.current) {
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollPositionRef.current
              editingTemporaryUserIdRef.current = null
            }
          }, 50)
        }
      } else {
        console.error('Invalid data format, expected array:', data)
        setTemporaryUsers([])
        setError('Invalid response format from server')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred while fetching temporary users'
        setError(errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching temporary users')
      }
      setTemporaryUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Add new temporary user
  const handleAdd = async () => {
    try {
      setError(null)
      
      const name = (formData.name || '').trim()
      const description = (formData.description || '').trim()
      
      if (!name) {
        setError('Name is required')
        return
      }
      
      const payload = {
        name: name,
        description: description || '',
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
        description: '',
      })
      
      await fetchTemporaryUsers()
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
          const errorMessage = errorData.title || errorData.message || err.message || 'Failed to add temporary user'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to add temporary user')
      }
    }
  }

  // Update temporary user
  const handleUpdate = async () => {
    if (!editingTemporaryUser) return

    try {
      setError(null)
      
      // Store current scroll position before update
      if (scrollContainerRef.current) {
        scrollPositionRef.current = scrollContainerRef.current.scrollTop
      }
      editingTemporaryUserIdRef.current = editingTemporaryUser.id
      
      const name = (formData.name || '').trim()
      const description = (formData.description || '').trim()
      
      if (!name) {
        setError('Name is required')
        return
      }
      
      const payload = {
        name: name,
        description: description || '',
      }
      
      await axios.put(`${API_BASE_URL}/${editingTemporaryUser.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await fetchTemporaryUsers()
      
      setShowModal(false)
      setEditingTemporaryUser(null)
      setFormData({
        name: '',
        description: '',
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
          const errorMessage = errorData.title || errorData.message || err.message || 'Failed to update temporary user'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update temporary user')
      }
    }
  }

  // Delete temporary user
  const handleDelete = async () => {
    if (!deletingTemporaryUser) return

    try {
      setError(null)
      await axios.delete(`${API_BASE_URL}/${deletingTemporaryUser.id}`)
      await fetchTemporaryUsers()
      setShowDeleteModal(false)
      setDeletingTemporaryUser(null)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to delete temporary user'
        setError(errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete temporary user')
      }
    }
  }

  // Helper functions
  const getAssetName = (id: string | undefined) => {
    if (!id) return 'N/A'
    const asset = assets.find((a) => a.id === id)
    return asset ? asset.name : 'N/A'
  }

  const getTemporaryUserName = (id: string | undefined) => {
    if (!id) return 'N/A'
    const user = temporaryUsers.find((u) => u.id === id)
    return user ? user.name : 'N/A'
  }

  const getTemporaryUsedRecordName = (id: string | undefined) => {
    if (!id) return 'N/A'
    const record = temporaryUsedRecords.find((r) => r.id === id)
    return record ? record.name : 'N/A'
  }

  // ========== Temporary Used Record CRUD Operations ==========
  const handleAddRecord = async () => {
    if (!recordFormData.name.trim() || !recordFormData.assetId || !recordFormData.temporaryUserId) {
      setError('Name, Asset, and Temporary User are required')
      return
    }
    try {
      setError(null)
      await axios.post(TEMPORARY_USED_RECORD_API_URL, {
        name: recordFormData.name.trim(),
        description: recordFormData.description.trim(),
        assetId: recordFormData.assetId,
        temporaryUserId: recordFormData.temporaryUserId,
      })
      await fetchTemporaryUsedRecords()
      setShowRecordModal(false)
      setRecordFormData({ name: '', description: '', assetId: '', temporaryUserId: '' })
      setEditingRecord(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add temporary used record')
    }
  }

  const handleUpdateRecord = async () => {
    if (!editingRecord || !recordFormData.name.trim() || !recordFormData.assetId || !recordFormData.temporaryUserId) {
      setError('Name, Asset, and Temporary User are required')
      return
    }
    try {
      setError(null)
      await axios.put(`${TEMPORARY_USED_RECORD_API_URL}/${editingRecord.id}`, {
        name: recordFormData.name.trim(),
        description: recordFormData.description.trim(),
        assetId: recordFormData.assetId,
        temporaryUserId: recordFormData.temporaryUserId,
      })
      await fetchTemporaryUsedRecords()
      setShowRecordModal(false)
      setRecordFormData({ name: '', description: '', assetId: '', temporaryUserId: '' })
      setEditingRecord(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update temporary used record')
    }
  }

  const handleDeleteRecord = async () => {
    if (!deletingRecord) return
    try {
      setError(null)
      await axios.delete(`${TEMPORARY_USED_RECORD_API_URL}/${deletingRecord.id}`)
      await fetchTemporaryUsedRecords()
      setShowDeleteRecordModal(false)
      setDeletingRecord(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete temporary used record')
    }
  }

  // ========== Temporary Used Request CRUD Operations ==========
  const handleAddRequest = async () => {
    if (!requestFormData.name.trim() || !requestFormData.temporaryUsedRecordId || !requestFormData.assetId) {
      setError('Name, Temporary Used Record, and Asset are required')
      return
    }
    try {
      setError(null)
      await axios.post(TEMPORARY_USED_REQUEST_API_URL, {
        name: requestFormData.name.trim(),
        description: requestFormData.description.trim(),
        temporaryUsedRecordId: requestFormData.temporaryUsedRecordId,
        assetId: requestFormData.assetId,
      })
      await fetchTemporaryUsedRequests()
      setShowRequestModal(false)
      setRequestFormData({ name: '', description: '', temporaryUsedRecordId: '', assetId: '' })
      setEditingRequest(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add temporary used request')
    }
  }

  const handleUpdateRequest = async () => {
    if (!editingRequest || !requestFormData.name.trim() || !requestFormData.temporaryUsedRecordId || !requestFormData.assetId) {
      setError('Name, Temporary Used Record, and Asset are required')
      return
    }
    try {
      setError(null)
      await axios.put(`${TEMPORARY_USED_REQUEST_API_URL}/${editingRequest.id}`, {
        name: requestFormData.name.trim(),
        description: requestFormData.description.trim(),
        temporaryUsedRecordId: requestFormData.temporaryUsedRecordId,
        assetId: requestFormData.assetId,
      })
      await fetchTemporaryUsedRequests()
      setShowRequestModal(false)
      setRequestFormData({ name: '', description: '', temporaryUsedRecordId: '', assetId: '' })
      setEditingRequest(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update temporary used request')
    }
  }

  const handleDeleteRequest = async () => {
    if (!deletingRequest) return
    try {
      setError(null)
      await axios.delete(`${TEMPORARY_USED_REQUEST_API_URL}/${deletingRequest.id}`)
      await fetchTemporaryUsedRequests()
      setShowDeleteRequestModal(false)
      setDeletingRequest(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete temporary used request')
    }
  }


  // Open modal for add
  const openAddModal = () => {
    setEditingTemporaryUser(null)
    setFormData({
      name: '',
      description: '',
    })
    setShowModal(true)
  }

  // Open modal for edit
  const openEditModal = (tu: TemporaryUser) => {
    setEditingTemporaryUser(tu)
    setFormData({
      name: tu.name,
      description: tu.description || '',
    })
    setShowModal(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (tu: TemporaryUser) => {
    setDeletingTemporaryUser(tu)
    setShowDeleteModal(true)
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim()) {
      setError('Please fill in the required field (Name)')
      return
    }
    
    if (editingTemporaryUser) {
      await handleUpdate()
    } else {
      await handleAdd()
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchTemporaryUsers(),
        fetchAssets(),
      ])
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'temporary-used-record') {
      fetchTemporaryUsedRecords()
    } else if (activeTab === 'temporary-used-request') {
      fetchTemporaryUsedRequests()
      // Also fetch records for dropdown (all records, not paginated)
      if (temporaryUsedRecords.length === 0) {
        axios.get(TEMPORARY_USED_RECORD_API_URL).then((response) => {
          if (Array.isArray(response.data)) {
            setTemporaryUsedRecords(response.data)
          }
        }).catch((err) => {
          console.error('Error fetching temporary used records for dropdown:', err)
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, recordPage, requestPage, recordSearchQuery, requestSearchQuery])


  // Update URL when page, search, tab, or pagination changes
  useEffect(() => {
    const params = new URLSearchParams()
    
    // Always set the active tab
    params.set('tab', activeTab)
    
    // Set page based on active tab
    if (activeTab === 'temporary-user') {
      if (currentPage > 1) {
        params.set('page', currentPage.toString())
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim())
      }
    } else if (activeTab === 'temporary-used-record') {
      if (recordPage > 1) {
        params.set('recordPage', recordPage.toString())
      }
      if (recordSearchQuery.trim()) {
        params.set('recordSearch', recordSearchQuery.trim())
      }
    } else if (activeTab === 'temporary-used-request') {
      if (requestPage > 1) {
        params.set('requestPage', requestPage.toString())
      }
      if (requestSearchQuery.trim()) {
        params.set('requestSearch', requestSearchQuery.trim())
      }
    }
    
    const currentUrl = searchParams.toString()
    const newUrl = params.toString()
    if (currentUrl !== newUrl) {
      setSearchParams(params, { replace: true })
    }
  }, [activeTab, currentPage, recordPage, requestPage, searchQuery, recordSearchQuery, requestSearchQuery, searchParams, setSearchParams])

  // Reset to page 1 when search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    const urlPage = parseInt(params.get('page') || '1', 10)
    
    if (urlPage === 1 && currentPage !== 1 && searchQuery) {
      setCurrentPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  // Debounced search effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'temporary-user') {
        fetchTemporaryUsers()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, activeTab])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'temporary-used-record') {
        fetchTemporaryUsedRecords()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordSearchQuery, activeTab])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'temporary-used-request') {
        fetchTemporaryUsedRequests()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestSearchQuery, activeTab])

  return (
    <div className="flex min-h-screen">
      <AMSSidebar />

      <main className="flex-1 ml-72 px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                {activeTab === 'temporary-user' && 'Temporary User'}
                {activeTab === 'temporary-used-record' && 'Temporary Used Record'}
                {activeTab === 'temporary-used-request' && 'Temporary Used Request'}
              </h1>
            </div>
            {activeTab === 'temporary-user' && (
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            )}
            {activeTab === 'temporary-used-record' && (
              <button
                onClick={() => {
                  setEditingRecord(null)
                  setRecordFormData({ name: '', description: '', assetId: '', temporaryUserId: '' })
                  setShowRecordModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Record
              </button>
            )}
            {activeTab === 'temporary-used-request' && (
              <button
                onClick={() => {
                  setEditingRequest(null)
                  setRequestFormData({ name: '', description: '', temporaryUsedRecordId: '', assetId: '' })
                  setShowRequestModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Request
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-1 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('temporary-user')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'temporary-user'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temporary User
            </button>
            <button
              onClick={() => setActiveTab('temporary-used-record')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'temporary-used-record'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temporary Used Record
            </button>
            <button
              onClick={() => setActiveTab('temporary-used-request')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'temporary-used-request'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temporary Used Request
            </button>
          </div>

          {/* Search Bar */}
          {activeTab === 'temporary-user' && (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchTemporaryUsers()
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
          )}
          {activeTab === 'temporary-used-record' && (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={recordSearchQuery}
                onChange={(e) => setRecordSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchTemporaryUsedRecords()
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
              {recordSearchQuery && (
                <button
                  onClick={() => {
                    setRecordSearchQuery('')
                    setRecordPage(1)
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
          {activeTab === 'temporary-used-request' && (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={requestSearchQuery}
                onChange={(e) => setRequestSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchTemporaryUsedRequests()
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
              {requestSearchQuery && (
                <button
                  onClick={() => {
                    setRequestSearchQuery('')
                    setRequestPage(1)
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <div className="font-semibold mb-2">Error:</div>
            <div className="whitespace-pre-wrap">{error}</div>
          </div>
        )}

        {/* Table Container */}
        {activeTab === 'temporary-user' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0 overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[55%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    DESCRIPTION
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
                <col className="w-[30%]" />
                <col className="w-[55%]" />
                <col className="w-[15%]" />
              </colgroup>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : temporaryUsers.length > 0 ? (
                  temporaryUsers.map((tu) => (
                    <tr key={tu.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {tu.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        <div className="max-w-md truncate" title={tu.description}>
                          {tu.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(tu)}
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
                            onClick={() => openDeleteModal(tu)}
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
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">
                      No temporary users found
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
        )}

        {/* Temporary Used Record Table */}
        {activeTab === 'temporary-used-record' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Asset</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Temporary User</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Loading...</td>
                    </tr>
                  ) : temporaryUsedRecords.length > 0 ? (
                    temporaryUsedRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{record.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{record.description || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{record.assetName || getAssetName(record.assetId)}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{record.temporaryUserName || getTemporaryUserName(record.temporaryUserId)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingRecord(record); setRecordFormData({ name: record.name, description: record.description || '', assetId: record.assetId, temporaryUserId: record.temporaryUserId }); setShowRecordModal(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => { setDeletingRecord(record); setShowDeleteRecordModal(true) }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No temporary used records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {recordTotalCount > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button onClick={() => setRecordPage(1)} disabled={recordPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;&lt;&lt;</button>
                  <button onClick={() => setRecordPage(p => Math.max(1, p - 1))} disabled={recordPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;</button>
                  <button disabled className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-default">{recordPage}</button>
                  <button onClick={() => setRecordPage(p => Math.min(recordTotalPages, p + 1))} disabled={recordPage === recordTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;</button>
                  <button onClick={() => setRecordPage(recordTotalPages)} disabled={recordPage === recordTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;&gt;&gt;</button>
                </div>
                <div className="text-sm text-slate-600">
                  Showing {((recordPage - 1) * pageSize) + 1} to {Math.min(recordPage * pageSize, recordTotalCount)} of {recordTotalCount} records
                </div>
              </div>
            )}
          </div>
        )}

        {/* Temporary Used Request Table */}
        {activeTab === 'temporary-used-request' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Temporary Used Record</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Asset</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Loading...</td>
                    </tr>
                  ) : temporaryUsedRequests.length > 0 ? (
                    temporaryUsedRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{request.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{request.description || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{request.temporaryUsedRecordName || getTemporaryUsedRecordName(request.temporaryUsedRecordId)}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{request.assetName || getAssetName(request.assetId)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingRequest(request); setRequestFormData({ name: request.name, description: request.description || '', temporaryUsedRecordId: request.temporaryUsedRecordId, assetId: request.assetId }); setShowRequestModal(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => { setDeletingRequest(request); setShowDeleteRequestModal(true) }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No temporary used requests found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {requestTotalCount > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button onClick={() => setRequestPage(1)} disabled={requestPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;&lt;&lt;</button>
                  <button onClick={() => setRequestPage(p => Math.max(1, p - 1))} disabled={requestPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;</button>
                  <button disabled className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-default">{requestPage}</button>
                  <button onClick={() => setRequestPage(p => Math.min(requestTotalPages, p + 1))} disabled={requestPage === requestTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;</button>
                  <button onClick={() => setRequestPage(requestTotalPages)} disabled={requestPage === requestTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;&gt;&gt;</button>
                </div>
                <div className="text-sm text-slate-600">
                  Showing {((requestPage - 1) * pageSize) + 1} to {Math.min(requestPage * pageSize, requestTotalCount)} of {requestTotalCount} records
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className={`${editingTemporaryUser ? 'bg-blue-600' : 'bg-green-600'} px-6 py-4`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  {editingTemporaryUser ? (
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
                  {editingTemporaryUser ? 'Edit Temporary User' : 'Add New Temporary User'}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Please enter name"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Please enter description"
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTemporaryUser(null)
                    setFormData({
                      name: '',
                      description: '',
                    })
                  }}
                  className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-lg text-white font-medium transition shadow-md hover:shadow-lg ${
                    editingTemporaryUser
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {editingTemporaryUser ? 'Update Temporary User' : 'Add Temporary User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTemporaryUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center ring-4 ring-red-100">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Delete Temporary User</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Are you sure you want to delete "{deletingTemporaryUser.name}"?
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. This will permanently delete the temporary user.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingTemporaryUser(null)
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

      {/* Temporary Used Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingRecord ? 'Edit Temporary Used Record' : 'Add Temporary Used Record'}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={recordFormData.name} onChange={(e) => setRecordFormData({ ...recordFormData, name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea value={recordFormData.description} onChange={(e) => setRecordFormData({ ...recordFormData, description: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Asset <span className="text-red-500">*</span></label>
                  <select value={recordFormData.assetId} onChange={(e) => setRecordFormData({ ...recordFormData, assetId: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Please select asset</option>
                    {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Temporary User <span className="text-red-500">*</span></label>
                  <select value={recordFormData.temporaryUserId} onChange={(e) => setRecordFormData({ ...recordFormData, temporaryUserId: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Please select temporary user</option>
                    {temporaryUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button onClick={() => { setShowRecordModal(false); setEditingRecord(null); setRecordFormData({ name: '', description: '', assetId: '', temporaryUserId: '' }) }} className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">Cancel</button>
                <button onClick={editingRecord ? handleUpdateRecord : handleAddRecord} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">{editingRecord ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Used Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingRequest ? 'Edit Temporary Used Request' : 'Add Temporary Used Request'}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={requestFormData.name} onChange={(e) => setRequestFormData({ ...requestFormData, name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea value={requestFormData.description} onChange={(e) => setRequestFormData({ ...requestFormData, description: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Temporary Used Record <span className="text-red-500">*</span></label>
                  <select value={requestFormData.temporaryUsedRecordId} onChange={(e) => setRequestFormData({ ...requestFormData, temporaryUsedRecordId: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Please select temporary used record</option>
                    {temporaryUsedRecords.map((record) => <option key={record.id} value={record.id}>{record.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Asset <span className="text-red-500">*</span></label>
                  <select value={requestFormData.assetId} onChange={(e) => setRequestFormData({ ...requestFormData, assetId: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Please select asset</option>
                    {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button onClick={() => { setShowRequestModal(false); setEditingRequest(null); setRequestFormData({ name: '', description: '', temporaryUsedRecordId: '', assetId: '' }) }} className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">Cancel</button>
                <button onClick={editingRequest ? handleUpdateRequest : handleAddRequest} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">{editingRequest ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modals */}
      {showDeleteRecordModal && deletingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Temporary Used Record</h2>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete "{deletingRecord.name}"?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowDeleteRecordModal(false); setDeletingRecord(null) }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDeleteRecord} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteRequestModal && deletingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Temporary Used Request</h2>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete "{deletingRequest.name}"?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowDeleteRequestModal(false); setDeletingRequest(null) }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDeleteRequest} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

