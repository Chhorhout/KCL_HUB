import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AMSSidebar } from '../components/AMSSidebar'
import { API_BASE_URLS } from '../config/api'

type Maintainer = {
  id: string
  name: string
  email: string
  phone: string
  maintainerTypeId: string
  maintainerTypeName?: string // API returns this directly
}

type MaintainerType = {
  id: string
  name: string
}

type MaintenanceRecord = {
  id: string
  name: string
  assetId: string
  maintainerId: string
  assetName?: string
  maintainerName?: string
}

type MaintenancePart = {
  id: string
  name: string
  description: string
  maintenanceRecordId: string
  maintenanceRecordName?: string
}

type Asset = {
  id: string
  name: string
  serialNumber: string
}

const API_BASE_URL = `${API_BASE_URLS.AMS}/Maintainer`
const MAINTAINER_TYPE_API_URL = `${API_BASE_URLS.AMS}/MaintainerType`
const MAINTENANCE_RECORD_API_URL = `${API_BASE_URLS.AMS}/MaintenanceRecord`
const MAINTENANCE_PART_API_URL = `${API_BASE_URLS.AMS}/MaintenacePart`
const ASSET_API_URL = `${API_BASE_URLS.AMS}/Assets`

export function MaintainerList() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Read initial state from URL
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
  const searchFromUrl = searchParams.get('search') || ''
  const tabFromUrl = (searchParams.get('tab') || 'maintainer') as 'maintainer' | 'maintainer-type' | 'maintenance-record' | 'maintenance-part'
  const maintainerTypePageFromUrl = parseInt(searchParams.get('maintainerTypePage') || '1', 10)
  const recordPageFromUrl = parseInt(searchParams.get('recordPage') || '1', 10)
  const partPageFromUrl = parseInt(searchParams.get('partPage') || '1', 10)
  const maintainerTypeSearchFromUrl = searchParams.get('maintainerTypeSearch') || ''
  const recordSearchFromUrl = searchParams.get('recordSearch') || ''
  const partSearchFromUrl = searchParams.get('partSearch') || ''
  
  const [maintainers, setMaintainers] = useState<Maintainer[]>([])
  const [maintainerTypes, setMaintainerTypes] = useState<MaintainerType[]>([])
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [maintenanceParts, setMaintenanceParts] = useState<MaintenancePart[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchFromUrl)
  const [maintainerTypeSearchQuery, setMaintainerTypeSearchQuery] = useState(maintainerTypeSearchFromUrl)
  const [recordSearchQuery, setRecordSearchQuery] = useState(recordSearchFromUrl)
  const [partSearchQuery, setPartSearchQuery] = useState(partSearchFromUrl)
  const [currentPage, setCurrentPage] = useState(pageFromUrl)
  const [pageSize] = useState(12)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState<'maintainer' | 'maintainer-type' | 'maintenance-record' | 'maintenance-part'>(tabFromUrl)
  
  // Pagination for each tab
  const [maintainerTypePage, setMaintainerTypePage] = useState(maintainerTypePageFromUrl)
  const [maintainerTypeTotalCount, setMaintainerTypeTotalCount] = useState(0)
  const [maintainerTypeTotalPages, setMaintainerTypeTotalPages] = useState(1)
  
  const [recordPage, setRecordPage] = useState(recordPageFromUrl)
  const [recordTotalCount, setRecordTotalCount] = useState(0)
  const [recordTotalPages, setRecordTotalPages] = useState(1)
  
  const [partPage, setPartPage] = useState(partPageFromUrl)
  const [partTotalCount, setPartTotalCount] = useState(0)
  const [partTotalPages, setPartTotalPages] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)
  const editingMaintainerIdRef = useRef<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCreateMaintainerType, setShowCreateMaintainerType] = useState(false)
  const [showMaintainerTypeModal, setShowMaintainerTypeModal] = useState(false)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showPartModal, setShowPartModal] = useState(false)
  const [showDeleteMaintainerTypeModal, setShowDeleteMaintainerTypeModal] = useState(false)
  const [showDeleteRecordModal, setShowDeleteRecordModal] = useState(false)
  const [showDeletePartModal, setShowDeletePartModal] = useState(false)
  const [newMaintainerTypeName, setNewMaintainerTypeName] = useState('')
  const [creatingMaintainerType, setCreatingMaintainerType] = useState(false)
  const [deletingMaintainer, setDeletingMaintainer] = useState<Maintainer | null>(null)
  const [editingMaintainer, setEditingMaintainer] = useState<Maintainer | null>(null)
  const [editingMaintainerType, setEditingMaintainerType] = useState<MaintainerType | null>(null)
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null)
  const [editingPart, setEditingPart] = useState<MaintenancePart | null>(null)
  const [deletingMaintainerType, setDeletingMaintainerType] = useState<MaintainerType | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<MaintenanceRecord | null>(null)
  const [deletingPart, setDeletingPart] = useState<MaintenancePart | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    maintainerTypeId: '',
  })
  const [maintainerTypeFormData, setMaintainerTypeFormData] = useState({ name: '' })
  const [recordFormData, setRecordFormData] = useState({ name: '', assetId: '', maintainerId: '' })
  const [partFormData, setPartFormData] = useState({ name: '', description: '', maintenanceRecordId: '' })

  // Fetch maintainer types (for dropdown)
  const fetchMaintainerTypes = async () => {
    try {
      const response = await axios.get(MAINTAINER_TYPE_API_URL)
      if (Array.isArray(response.data)) {
        setMaintainerTypes(response.data)
      }
    } catch (err) {
      console.error('Error fetching maintainer types:', err)
    }
  }

  // Fetch maintainer types with pagination
  const fetchMaintainerTypesPaginated = async () => {
    try {
      setLoading(true)
      setError(null)
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL maintainer types (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (maintainerTypeSearchQuery.trim()) {
        // Fetch all for client-side filtering
      } else {
        params.page = maintainerTypePage.toString()
        params.pageSize = pageSize.toString()
      }
      
      const response = await axios.get(MAINTAINER_TYPE_API_URL, { params })
      const data = response.data
      const totalCountHeader = response.headers['x-total-count'] || response.headers['X-Total-Count']
      const totalPagesHeader = response.headers['x-total-pages'] || response.headers['X-Total-Pages']
      
      if (Array.isArray(data)) {
        let filteredData = data
        
        // Client-side filtering when searching
        if (maintainerTypeSearchQuery.trim()) {
          const searchLower = maintainerTypeSearchQuery.trim().toLowerCase()
          filteredData = data.filter((type: MaintainerType) => {
            return type.name.toLowerCase().includes(searchLower)
          })
        }
        
        // Update pagination state from response headers (only if not searching)
        if (!maintainerTypeSearchQuery.trim()) {
          if (totalCountHeader) {
            setMaintainerTypeTotalCount(parseInt(totalCountHeader, 10))
            if (totalPagesHeader) {
              setMaintainerTypeTotalPages(parseInt(totalPagesHeader, 10))
            } else {
              setMaintainerTypeTotalPages(Math.ceil(parseInt(totalCountHeader, 10) / pageSize) || 1)
            }
          } else {
            setMaintainerTypeTotalCount(data.length)
            setMaintainerTypeTotalPages(Math.ceil(data.length / pageSize) || 1)
          }
        } else {
          // When searching, update count based on filtered results
          setMaintainerTypeTotalCount(filteredData.length)
          setMaintainerTypeTotalPages(1)
          if (maintainerTypePage !== 1) {
            setMaintainerTypePage(1)
          }
        }
        
        setMaintainerTypes(filteredData)
      }
    } catch (err) {
      console.error('Error fetching maintainer types:', err)
      setError('Failed to fetch maintainer types')
      setMaintainerTypes([])
    } finally {
      setLoading(false)
    }
  }

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

  // Fetch maintenance records with pagination
  const fetchMaintenanceRecords = async () => {
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
      
      const response = await axios.get(MAINTENANCE_RECORD_API_URL, { params })
      const data = response.data
      const totalCountHeader = response.headers['x-total-count'] || response.headers['X-Total-Count']
      const totalPagesHeader = response.headers['x-total-pages'] || response.headers['X-Total-Pages']
      
      if (Array.isArray(data)) {
        let filteredData = data
        
        // Client-side filtering when searching
        if (recordSearchQuery.trim()) {
          const searchLower = recordSearchQuery.trim().toLowerCase()
          filteredData = data.filter((record: MaintenanceRecord) => {
            const nameMatch = record.name.toLowerCase().includes(searchLower)
            const assetMatch = (record.assetName || getAssetName(record.assetId)).toLowerCase().includes(searchLower)
            const maintainerMatch = (record.maintainerName || getMaintainerName(record.maintainerId)).toLowerCase().includes(searchLower)
            return nameMatch || assetMatch || maintainerMatch
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
        
        setMaintenanceRecords(filteredData)
      }
    } catch (err) {
      console.error('Error fetching maintenance records:', err)
      setError('Failed to fetch maintenance records')
      setMaintenanceRecords([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch maintenance parts with pagination
  const fetchMaintenanceParts = async () => {
    try {
      setLoading(true)
      setError(null)
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL parts (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (partSearchQuery.trim()) {
        // Fetch all for client-side filtering
      } else {
        params.page = partPage.toString()
        params.pageSize = pageSize.toString()
      }
      
      const response = await axios.get(MAINTENANCE_PART_API_URL, { params })
      const data = response.data
      const totalCountHeader = response.headers['x-total-count'] || response.headers['X-Total-Count']
      const totalPagesHeader = response.headers['x-total-pages'] || response.headers['X-Total-Pages']
      
      if (Array.isArray(data)) {
        let filteredData = data
        
        // Client-side filtering when searching
        if (partSearchQuery.trim()) {
          const searchLower = partSearchQuery.trim().toLowerCase()
          filteredData = data.filter((part: MaintenancePart) => {
            const nameMatch = part.name.toLowerCase().includes(searchLower)
            const descriptionMatch = (part.description || '').toLowerCase().includes(searchLower)
            const recordMatch = (part.maintenanceRecordName || getMaintenanceRecordName(part.maintenanceRecordId)).toLowerCase().includes(searchLower)
            return nameMatch || descriptionMatch || recordMatch
          })
        }
        
        // Update pagination state from response headers (only if not searching)
        if (!partSearchQuery.trim()) {
          if (totalCountHeader) {
            setPartTotalCount(parseInt(totalCountHeader, 10))
            if (totalPagesHeader) {
              setPartTotalPages(parseInt(totalPagesHeader, 10))
            } else {
              setPartTotalPages(Math.ceil(parseInt(totalCountHeader, 10) / pageSize) || 1)
            }
          } else {
            setPartTotalCount(data.length)
            setPartTotalPages(Math.ceil(data.length / pageSize) || 1)
          }
        } else {
          // When searching, update count based on filtered results
          setPartTotalCount(filteredData.length)
          setPartTotalPages(1)
          if (partPage !== 1) {
            setPartPage(1)
          }
        }
        
        setMaintenanceParts(filteredData)
      }
    } catch (err) {
      console.error('Error fetching maintenance parts:', err)
      setError('Failed to fetch maintenance parts')
      setMaintenanceParts([])
    } finally {
      setLoading(false)
    }
  }

  // Create new maintainer type
  const handleCreateMaintainerType = async () => {
    if (!newMaintainerTypeName.trim()) {
      setError('Maintainer Type name is required')
      return
    }

    try {
      setCreatingMaintainerType(true)
      setError(null)
      const payload = {
        name: newMaintainerTypeName.trim(),
      }
      
      const response = await axios.post(MAINTAINER_TYPE_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const newMaintainerType = response.data
      await fetchMaintainerTypes()
      setFormData({ ...formData, maintainerTypeId: newMaintainerType.id })
      setNewMaintainerTypeName('')
      setShowCreateMaintainerType(false)
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
          const errorMessage = errorData.title || errorData.message || err.message || 'Failed to create maintainer type'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create maintainer type')
      }
      console.error('Error creating maintainer type:', err)
    } finally {
      setCreatingMaintainerType(false)
    }
  }

  // Get maintainer type name by ID
  const getMaintainerTypeName = (id: string) => {
    if (!id) return '-'
    const maintainerType = maintainerTypes.find((mt) => mt.id === id)
    return maintainerType ? maintainerType.name : 'Loading...'
  }

  const getAssetName = (id: string | undefined) => {
    if (!id) return 'N/A'
    const asset = assets.find((a) => a.id === id)
    return asset ? asset.name : 'N/A'
  }

  const getMaintainerName = (id: string | undefined) => {
    if (!id) return 'N/A'
    const maintainer = maintainers.find((m) => m.id === id)
    return maintainer ? maintainer.name : 'N/A'
  }

  const getMaintenanceRecordName = (id: string | undefined) => {
    if (!id) return 'N/A'
    const record = maintenanceRecords.find((r) => r.id === id)
    return record ? record.name : 'N/A'
  }

  // Fetch maintainers from API with pagination
  const fetchMaintainers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL maintainers (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      } else {
        params.page = currentPage.toString()
        params.pageSize = pageSize.toString()
      }
      
      console.log('Fetching maintainers with params:', params)
      
      const response = await axios.get(API_BASE_URL, {
        params,
      })

      const data = response.data
      console.log('Fetched maintainers data:', data)
      
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
      
      // Set maintainers data with client-side filtering by name, email, phone, or maintainer type
      if (Array.isArray(data)) {
        let filteredData = data
        if (searchQuery.trim()) {
          const searchLower = searchQuery.trim().toLowerCase()
          filteredData = data.filter((maintainer: Maintainer) => {
            const nameMatch = maintainer.name.toLowerCase().includes(searchLower)
            const emailMatch = maintainer.email?.toLowerCase().includes(searchLower) || false
            const phoneMatch = maintainer.phone?.toLowerCase().includes(searchLower) || false
            // Use maintainerTypeName from API if available, otherwise fallback to lookup
            const maintainerTypeName = maintainer.maintainerTypeName || getMaintainerTypeName(maintainer.maintainerTypeId)
            const typeMatch = maintainerTypeName.toLowerCase().includes(searchLower)
            return nameMatch || emailMatch || phoneMatch || typeMatch
          })
          console.log(`Filtered ${data.length} maintainers to ${filteredData.length} matching "${searchQuery}"`)
        }
        
        setMaintainers(filteredData)
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
        if (!searchQuery.trim() && editingMaintainerIdRef.current && scrollContainerRef.current) {
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollPositionRef.current
              editingMaintainerIdRef.current = null
            }
          }, 50)
        }
      } else {
        console.error('Invalid data format, expected array:', data)
        setMaintainers([])
        setError('Invalid response format from server')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred while fetching maintainers'
        setError(errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching maintainers')
      }
      setMaintainers([])
    } finally {
      setLoading(false)
    }
  }

  // Add new maintainer
  const handleAdd = async () => {
    try {
      setError(null)
      
      const name = (formData.name || '').trim()
      const email = (formData.email || '').trim()
      const phone = (formData.phone || '').trim()
      const maintainerTypeId = formData.maintainerTypeId
      
      if (!name) {
        setError('Name is required')
        return
      }
      if (!maintainerTypeId) {
        setError('Maintainer Type is required')
        return
      }
      
      const payload = {
        name: name,
        email: email || '',
        phone: phone || '',
        maintainerTypeId: maintainerTypeId,
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
        email: '',
        phone: '',
        maintainerTypeId: '',
      })
      
      await fetchMaintainers()
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
          const errorMessage = errorData.title || errorData.message || err.message || 'Failed to add maintainer'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to add maintainer')
      }
    }
  }

  // Update maintainer
  const handleUpdate = async () => {
    if (!editingMaintainer) return

    try {
      setError(null)
      
      // Store current scroll position before update
      if (scrollContainerRef.current) {
        scrollPositionRef.current = scrollContainerRef.current.scrollTop
      }
      editingMaintainerIdRef.current = editingMaintainer.id
      
      const name = (formData.name || '').trim()
      const email = (formData.email || '').trim()
      const phone = (formData.phone || '').trim()
      const maintainerTypeId = formData.maintainerTypeId
      
      if (!name) {
        setError('Name is required')
        return
      }
      if (!maintainerTypeId) {
        setError('Maintainer Type is required')
        return
      }
      
      const payload = {
        name: name,
        email: email || '',
        phone: phone || '',
        maintainerTypeId: maintainerTypeId,
      }
      
      await axios.put(`${API_BASE_URL}/${editingMaintainer.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await fetchMaintainers()
      
      setShowModal(false)
      setEditingMaintainer(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        maintainerTypeId: '',
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
          const errorMessage = errorData.title || errorData.message || err.message || 'Failed to update maintainer'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update maintainer')
      }
    }
  }

  // Delete maintainer
  const handleDelete = async () => {
    if (!deletingMaintainer) return

    try {
      setError(null)
      await axios.delete(`${API_BASE_URL}/${deletingMaintainer.id}`)
      await fetchMaintainers()
      setShowDeleteModal(false)
      setDeletingMaintainer(null)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to delete maintainer'
        setError(errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete maintainer')
      }
    }
  }

  // ========== Maintainer Type CRUD Operations ==========
  const handleAddMaintainerType = async () => {
    if (!maintainerTypeFormData.name.trim()) {
      setError('Name is required')
      return
    }
    try {
      setError(null)
      await axios.post(MAINTAINER_TYPE_API_URL, {
        name: maintainerTypeFormData.name.trim(),
      })
      await fetchMaintainerTypesPaginated()
      await fetchMaintainerTypes() // Also update dropdown
      setShowMaintainerTypeModal(false)
      setMaintainerTypeFormData({ name: '' })
      setEditingMaintainerType(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add maintainer type')
    }
  }

  const handleUpdateMaintainerType = async () => {
    if (!editingMaintainerType || !maintainerTypeFormData.name.trim()) {
      setError('Name is required')
      return
    }
    try {
      setError(null)
      await axios.put(`${MAINTAINER_TYPE_API_URL}/${editingMaintainerType.id}`, {
        name: maintainerTypeFormData.name.trim(),
      })
      await fetchMaintainerTypesPaginated()
      await fetchMaintainerTypes() // Also update dropdown
      setShowMaintainerTypeModal(false)
      setMaintainerTypeFormData({ name: '' })
      setEditingMaintainerType(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update maintainer type')
    }
  }

  const handleDeleteMaintainerType = async () => {
    if (!deletingMaintainerType) return
    try {
      setError(null)
      await axios.delete(`${MAINTAINER_TYPE_API_URL}/${deletingMaintainerType.id}`)
      await fetchMaintainerTypesPaginated()
      await fetchMaintainerTypes() // Also update dropdown
      setShowDeleteMaintainerTypeModal(false)
      setDeletingMaintainerType(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete maintainer type')
    }
  }

  // ========== Maintenance Record CRUD Operations ==========
  const handleAddRecord = async () => {
    if (!recordFormData.name.trim() || !recordFormData.assetId || !recordFormData.maintainerId) {
      setError('Name, Asset, and Maintainer are required')
      return
    }
    try {
      setError(null)
      await axios.post(MAINTENANCE_RECORD_API_URL, {
        name: recordFormData.name.trim(),
        assetId: recordFormData.assetId,
        maintainerId: recordFormData.maintainerId,
      })
      await fetchMaintenanceRecords()
      setShowRecordModal(false)
      setRecordFormData({ name: '', assetId: '', maintainerId: '' })
      setEditingRecord(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add maintenance record')
    }
  }

  const handleUpdateRecord = async () => {
    if (!editingRecord || !recordFormData.name.trim() || !recordFormData.assetId || !recordFormData.maintainerId) {
      setError('Name, Asset, and Maintainer are required')
      return
    }
    try {
      setError(null)
      await axios.put(`${MAINTENANCE_RECORD_API_URL}/${editingRecord.id}`, {
        name: recordFormData.name.trim(),
        assetId: recordFormData.assetId,
        maintainerId: recordFormData.maintainerId,
      })
      await fetchMaintenanceRecords()
      setShowRecordModal(false)
      setRecordFormData({ name: '', assetId: '', maintainerId: '' })
      setEditingRecord(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update maintenance record')
    }
  }

  const handleDeleteRecord = async () => {
    if (!deletingRecord) return
    try {
      setError(null)
      await axios.delete(`${MAINTENANCE_RECORD_API_URL}/${deletingRecord.id}`)
      await fetchMaintenanceRecords()
      setShowDeleteRecordModal(false)
      setDeletingRecord(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete maintenance record')
    }
  }

  // ========== Maintenance Part CRUD Operations ==========
  const handleAddPart = async () => {
    if (!partFormData.name.trim() || !partFormData.maintenanceRecordId) {
      setError('Name and Maintenance Record are required')
      return
    }
    try {
      setError(null)
      await axios.post(MAINTENANCE_PART_API_URL, {
        name: partFormData.name.trim(),
        description: partFormData.description.trim(),
        maintenanceRecordId: partFormData.maintenanceRecordId,
      })
      await fetchMaintenanceParts()
      setShowPartModal(false)
      setPartFormData({ name: '', description: '', maintenanceRecordId: '' })
      setEditingPart(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add maintenance part')
    }
  }

  const handleUpdatePart = async () => {
    if (!editingPart || !partFormData.name.trim() || !partFormData.maintenanceRecordId) {
      setError('Name and Maintenance Record are required')
      return
    }
    try {
      setError(null)
      await axios.put(`${MAINTENANCE_PART_API_URL}/${editingPart.id}`, {
        name: partFormData.name.trim(),
        description: partFormData.description.trim(),
        maintenanceRecordId: partFormData.maintenanceRecordId,
      })
      await fetchMaintenanceParts()
      setShowPartModal(false)
      setPartFormData({ name: '', description: '', maintenanceRecordId: '' })
      setEditingPart(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update maintenance part')
    }
  }

  const handleDeletePart = async () => {
    if (!deletingPart) return
    try {
      setError(null)
      await axios.delete(`${MAINTENANCE_PART_API_URL}/${deletingPart.id}`)
      await fetchMaintenanceParts()
      setShowDeletePartModal(false)
      setDeletingPart(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete maintenance part')
    }
  }


  // Open modal for add
  const openAddModal = () => {
    setEditingMaintainer(null)
    setShowCreateMaintainerType(false)
    setNewMaintainerTypeName('')
    setFormData({
      name: '',
      email: '',
      phone: '',
      maintainerTypeId: '',
    })
    setShowModal(true)
  }

  // Open modal for edit
  const openEditModal = (maintainer: Maintainer) => {
    setEditingMaintainer(maintainer)
    setShowCreateMaintainerType(false)
    setNewMaintainerTypeName('')
    setFormData({
      name: maintainer.name,
      email: maintainer.email || '',
      phone: maintainer.phone || '',
      maintainerTypeId: maintainer.maintainerTypeId,
    })
    setShowModal(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (maintainer: Maintainer) => {
    setDeletingMaintainer(maintainer)
    setShowDeleteModal(true)
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim()) {
      setError('Please fill in the required field (Name)')
      return
    }
    if (!formData.maintainerTypeId) {
      setError('Please select a Maintainer Type')
      return
    }
    
    if (editingMaintainer) {
      await handleUpdate()
    } else {
      await handleAdd()
    }
  }

  // Initial fetch on mount - fetch maintainer types first, then maintainers
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchMaintainerTypes(),
        fetchMaintainers(),
        fetchAssets(),
        fetchMaintenanceRecordsForDropdown(),
      ])
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'maintainer-type') {
      fetchMaintainerTypesPaginated()
    } else if (activeTab === 'maintenance-record') {
      fetchMaintenanceRecords()
    } else if (activeTab === 'maintenance-part') {
      fetchMaintenanceParts()
      // Also fetch maintenance records for the dropdown
      if (maintenanceRecords.length === 0) {
        fetchMaintenanceRecords()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, maintainerTypePage, recordPage, partPage])

  // Fetch maintenance records for dropdown (when not paginated)
  const fetchMaintenanceRecordsForDropdown = async () => {
    try {
      const response = await axios.get(MAINTENANCE_RECORD_API_URL)
      if (Array.isArray(response.data)) {
        setMaintenanceRecords(response.data)
      }
    } catch (err) {
      console.error('Error fetching maintenance records:', err)
    }
  }

  // Update URL when page, search, tab, or pagination changes
  useEffect(() => {
    const params = new URLSearchParams()
    
    // Always set the active tab
    params.set('tab', activeTab)
    
    // Set page based on active tab
    if (activeTab === 'maintainer') {
      if (currentPage > 1) {
        params.set('page', currentPage.toString())
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim())
      }
    } else if (activeTab === 'maintainer-type') {
      if (maintainerTypePage > 1) {
        params.set('maintainerTypePage', maintainerTypePage.toString())
      }
      if (maintainerTypeSearchQuery.trim()) {
        params.set('maintainerTypeSearch', maintainerTypeSearchQuery.trim())
      }
    } else if (activeTab === 'maintenance-record') {
      if (recordPage > 1) {
        params.set('recordPage', recordPage.toString())
      }
      if (recordSearchQuery.trim()) {
        params.set('recordSearch', recordSearchQuery.trim())
      }
    } else if (activeTab === 'maintenance-part') {
      if (partPage > 1) {
        params.set('partPage', partPage.toString())
      }
      if (partSearchQuery.trim()) {
        params.set('partSearch', partSearchQuery.trim())
      }
    }
    
    const currentUrl = searchParams.toString()
    const newUrl = params.toString()
    if (currentUrl !== newUrl) {
      setSearchParams(params, { replace: true })
    }
  }, [activeTab, currentPage, maintainerTypePage, recordPage, partPage, searchQuery, maintainerTypeSearchQuery, recordSearchQuery, partSearchQuery, searchParams, setSearchParams])

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
      if (activeTab === 'maintainer') {
        fetchMaintainers()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, activeTab])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'maintainer-type') {
        fetchMaintainerTypesPaginated()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintainerTypeSearchQuery, activeTab])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'maintenance-record') {
        fetchMaintenanceRecords()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordSearchQuery, activeTab])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'maintenance-part') {
        fetchMaintenanceParts()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partSearchQuery, activeTab])

  return (
    <div className="flex min-h-screen">
      <AMSSidebar />

      <main className="flex-1 ml-72 px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                {activeTab === 'maintainer' && 'Maintainer'}
                {activeTab === 'maintainer-type' && 'Maintainer Type'}
                {activeTab === 'maintenance-record' && 'Maintenance Record'}
                {activeTab === 'maintenance-part' && 'Maintenance Part'}
              </h1>
            </div>
            {activeTab === 'maintainer' && (
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
            {activeTab === 'maintainer-type' && (
              <button
                onClick={() => {
                  setEditingMaintainerType(null)
                  setMaintainerTypeFormData({ name: '' })
                  setShowMaintainerTypeModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Maintainer Type
              </button>
            )}
            {activeTab === 'maintenance-record' && (
              <button
                onClick={() => {
                  setEditingRecord(null)
                  setRecordFormData({ name: '', assetId: '', maintainerId: '' })
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
            {activeTab === 'maintenance-part' && (
              <button
                onClick={() => {
                  setEditingPart(null)
                  setPartFormData({ name: '', description: '', maintenanceRecordId: '' })
                  setShowPartModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Part
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-1 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('maintainer')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'maintainer'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maintainer
            </button>
            <button
              onClick={() => setActiveTab('maintainer-type')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'maintainer-type'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maintainer Type
            </button>
            <button
              onClick={() => setActiveTab('maintenance-record')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'maintenance-record'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maintenance Record
            </button>
            <button
              onClick={() => setActiveTab('maintenance-part')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'maintenance-part'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maintenance Part
            </button>
          </div>

          {/* Search Bar */}
          {activeTab === 'maintainer' && (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchMaintainers()
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
          {activeTab === 'maintainer-type' && (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={maintainerTypeSearchQuery}
                onChange={(e) => setMaintainerTypeSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchMaintainerTypesPaginated()
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
              {maintainerTypeSearchQuery && (
                <button
                  onClick={() => {
                    setMaintainerTypeSearchQuery('')
                    setMaintainerTypePage(1)
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
          {activeTab === 'maintenance-record' && (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={recordSearchQuery}
                onChange={(e) => setRecordSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchMaintenanceRecords()
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
          {activeTab === 'maintenance-part' && (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={partSearchQuery}
                onChange={(e) => setPartSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchMaintenanceParts()
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
              {partSearchQuery && (
                <button
                  onClick={() => {
                    setPartSearchQuery('')
                    setPartPage(1)
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
        {activeTab === 'maintainer' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0 overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[25%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[25%]" />
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
                    MAINTAINER TYPE
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
                <col className="w-[25%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[25%]" />
                <col className="w-[15%]" />
              </colgroup>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : maintainers.length > 0 ? (
                  maintainers.map((maintainer) => (
                    <tr key={maintainer.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {maintainer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {maintainer.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {maintainer.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {maintainer.maintainerTypeName || getMaintainerTypeName(maintainer.maintainerTypeId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(maintainer)}
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
                            onClick={() => openDeleteModal(maintainer)}
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
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">
                      No maintainers found
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

        {/* Maintainer Type Table */}
        {activeTab === 'maintainer-type' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-sm text-slate-500">Loading...</td>
                    </tr>
                  ) : maintainerTypes.length > 0 ? (
                    maintainerTypes.map((type) => (
                      <tr key={type.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{type.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingMaintainerType(type); setMaintainerTypeFormData({ name: type.name }); setShowMaintainerTypeModal(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => { setDeletingMaintainerType(type); setShowDeleteMaintainerTypeModal(true) }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-sm text-slate-500">No maintainer types found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {maintainerTypeTotalCount > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button onClick={() => setMaintainerTypePage(1)} disabled={maintainerTypePage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;&lt;&lt;</button>
                  <button onClick={() => setMaintainerTypePage(p => Math.max(1, p - 1))} disabled={maintainerTypePage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;</button>
                  <button disabled className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-default">{maintainerTypePage}</button>
                  <button onClick={() => setMaintainerTypePage(p => Math.min(maintainerTypeTotalPages, p + 1))} disabled={maintainerTypePage === maintainerTypeTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;</button>
                  <button onClick={() => setMaintainerTypePage(maintainerTypeTotalPages)} disabled={maintainerTypePage === maintainerTypeTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;&gt;&gt;</button>
                </div>
                <div className="text-sm text-slate-600">
                  Showing {((maintainerTypePage - 1) * pageSize) + 1} to {Math.min(maintainerTypePage * pageSize, maintainerTypeTotalCount)} of {maintainerTypeTotalCount} records
                </div>
              </div>
            )}
          </div>
        )}

        {/* Maintenance Record Table */}
        {activeTab === 'maintenance-record' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Asset</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Maintainer</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">Loading...</td>
                    </tr>
                  ) : maintenanceRecords.length > 0 ? (
                    maintenanceRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{record.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{record.assetName || getAssetName(record.assetId)}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{record.maintainerName || getMaintainerName(record.maintainerId)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingRecord(record); setRecordFormData({ name: record.name, assetId: record.assetId, maintainerId: record.maintainerId }); setShowRecordModal(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
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
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No maintenance records found</td>
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

        {/* Maintenance Part Table */}
        {activeTab === 'maintenance-part' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Maintenance Record</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">Loading...</td>
                    </tr>
                  ) : maintenanceParts.length > 0 ? (
                    maintenanceParts.map((part) => (
                      <tr key={part.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{part.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{part.description || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{part.maintenanceRecordName || getMaintenanceRecordName(part.maintenanceRecordId)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingPart(part); setPartFormData({ name: part.name, description: part.description || '', maintenanceRecordId: part.maintenanceRecordId }); setShowPartModal(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => { setDeletingPart(part); setShowDeletePartModal(true) }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No maintenance parts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {partTotalCount > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button onClick={() => setPartPage(1)} disabled={partPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;&lt;&lt;</button>
                  <button onClick={() => setPartPage(p => Math.max(1, p - 1))} disabled={partPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;</button>
                  <button disabled className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-default">{partPage}</button>
                  <button onClick={() => setPartPage(p => Math.min(partTotalPages, p + 1))} disabled={partPage === partTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;</button>
                  <button onClick={() => setPartPage(partTotalPages)} disabled={partPage === partTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;&gt;&gt;</button>
                </div>
                <div className="text-sm text-slate-600">
                  Showing {((partPage - 1) * pageSize) + 1} to {Math.min(partPage * pageSize, partTotalCount)} of {partTotalCount} records
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
            <div className={`${editingMaintainer ? 'bg-blue-600' : 'bg-green-600'} px-6 py-4`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  {editingMaintainer ? (
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
                  {editingMaintainer ? 'Edit Maintainer' : 'Add New Maintainer'}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Please enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Please enter phone number"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Maintainer Type <span className="text-red-500">*</span>
                </label>
                {!showCreateMaintainerType ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={formData.maintainerTypeId}
                        onChange={(e) => setFormData({ ...formData, maintainerTypeId: e.target.value })}
                        className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                        disabled={maintainerTypes.length === 0}
                      >
                        <option value="">
                          {maintainerTypes.length === 0 ? 'Loading Maintainer Types...' : 'Please select maintainer type'}
                        </option>
                        {maintainerTypes.map((mt) => (
                          <option key={mt.id} value={mt.id}>
                            {mt.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCreateMaintainerType(true)}
                        className="px-4 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium whitespace-nowrap"
                        title="Create new Maintainer Type"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">Create New Maintainer Type</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateMaintainerType(false)
                          setNewMaintainerTypeName('')
                        }}
                        className="text-slate-500 hover:text-slate-700"
                        title="Cancel"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={newMaintainerTypeName}
                        onChange={(e) => setNewMaintainerTypeName(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Please enter maintainer type name"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleCreateMaintainerType()
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCreateMaintainerType}
                        disabled={creatingMaintainerType || !newMaintainerTypeName.trim()}
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creatingMaintainerType ? 'Creating...' : 'Create Maintainer Type'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateMaintainerType(false)
                          setNewMaintainerTypeName('')
                        }}
                        className="px-4 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingMaintainer(null)
                    setShowCreateMaintainerType(false)
                    setNewMaintainerTypeName('')
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      maintainerTypeId: '',
                    })
                  }}
                  className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-lg text-white font-medium transition shadow-md hover:shadow-lg ${
                    editingMaintainer
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {editingMaintainer ? 'Update Maintainer' : 'Add Maintainer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingMaintainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center ring-4 ring-red-100">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Delete Maintainer</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Are you sure you want to delete "{deletingMaintainer.name}"?
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. This will permanently delete the maintainer.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingMaintainer(null)
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

      {/* Maintainer Type Modal */}
      {showMaintainerTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingMaintainerType ? 'Edit Maintainer Type' : 'Add Maintainer Type'}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={maintainerTypeFormData.name} onChange={(e) => setMaintainerTypeFormData({ name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button onClick={() => { setShowMaintainerTypeModal(false); setEditingMaintainerType(null); setMaintainerTypeFormData({ name: '' }) }} className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">Cancel</button>
                <button onClick={editingMaintainerType ? handleUpdateMaintainerType : handleAddMaintainerType} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">{editingMaintainerType ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={recordFormData.name} onChange={(e) => setRecordFormData({ ...recordFormData, name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Asset <span className="text-red-500">*</span></label>
                  <select value={recordFormData.assetId} onChange={(e) => setRecordFormData({ ...recordFormData, assetId: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Please select asset</option>
                    {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Maintainer <span className="text-red-500">*</span></label>
                  <select value={recordFormData.maintainerId} onChange={(e) => setRecordFormData({ ...recordFormData, maintainerId: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Please select maintainer</option>
                    {maintainers.map((maintainer) => <option key={maintainer.id} value={maintainer.id}>{maintainer.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button onClick={() => { setShowRecordModal(false); setEditingRecord(null); setRecordFormData({ name: '', assetId: '', maintainerId: '' }) }} className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">Cancel</button>
                <button onClick={editingRecord ? handleUpdateRecord : handleAddRecord} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">{editingRecord ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Part Modal */}
      {showPartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingPart ? 'Edit Maintenance Part' : 'Add Maintenance Part'}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={partFormData.name} onChange={(e) => setPartFormData({ ...partFormData, name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea value={partFormData.description} onChange={(e) => setPartFormData({ ...partFormData, description: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Maintenance Record <span className="text-red-500">*</span></label>
                  <select value={partFormData.maintenanceRecordId} onChange={(e) => setPartFormData({ ...partFormData, maintenanceRecordId: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Please select maintenance record</option>
                    {maintenanceRecords.map((record) => <option key={record.id} value={record.id}>{record.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button onClick={() => { setShowPartModal(false); setEditingPart(null); setPartFormData({ name: '', description: '', maintenanceRecordId: '' }) }} className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">Cancel</button>
                <button onClick={editingPart ? handleUpdatePart : handleAddPart} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">{editingPart ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modals */}
      {showDeleteMaintainerTypeModal && deletingMaintainerType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Maintainer Type</h2>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete "{deletingMaintainerType.name}"?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowDeleteMaintainerTypeModal(false); setDeletingMaintainerType(null) }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDeleteMaintainerType} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteRecordModal && deletingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Maintenance Record</h2>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete "{deletingRecord.name}"?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowDeleteRecordModal(false); setDeletingRecord(null) }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDeleteRecord} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showDeletePartModal && deletingPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Maintenance Part</h2>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete "{deletingPart.name}"?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowDeletePartModal(false); setDeletingPart(null) }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDeletePart} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

