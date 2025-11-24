import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { AMSSidebar } from '../components/AMSSidebar'
import { API_BASE_URLS } from '../config/api'

type Asset = {
  id: string
  name: string
  serialNumber: string
  hasWarranty: boolean
  warrantyStartDate?: string
  warrantyEndDate?: string
  supplierId?: string
  locationId?: string
  assetTypeId?: string
  invoiceId?: string
  // API returns these directly
  locationName?: string
  supplierName?: string
  assetTypeName?: string
  invoiceNumber?: string
  invoiceName?: string
}

type Location = {
  id: string
  name: string
}

type Supplier = {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

type AssetType = {
  id: string
  name: string
  categoryId: string
  categoryName?: string
}

type Invoice = {
  id: string
  number: string
  date: string
  totalAmount: string
  description: string
}

type Category = {
  id: string
  name: string
}

type AssetStatus = {
  id: string
  status: string
  description: string
  assetId: string
  assetName?: string
}

type AssetStatusHistory = {
  id: string
  name: string
  assetId: string
  assetName?: string
}

type AssetOwnership = {
  id: string
  name: string
  assetId: string
  ownerId: string
  assetName?: string
  ownerName?: string
}

type Owner = {
  id: string
  name: string
}

const API_BASE_URL = `${API_BASE_URLS.AMS}/Assets`
const LOCATION_API_URL = `${API_BASE_URLS.AMS}/Location`
const SUPPLIER_API_URL = `${API_BASE_URLS.AMS}/Suppliers`
const ASSET_TYPE_API_URL = `${API_BASE_URLS.AMS}/AssetType`
const INVOICE_API_URL = `${API_BASE_URLS.AMS}/Invoice`
const CATEGORY_API_URL = `${API_BASE_URLS.AMS}/Categories`
const ASSET_STATUS_API_URL = `${API_BASE_URLS.AMS}/AssetStatus`
const ASSET_STATUS_HISTORY_API_URL = `${API_BASE_URLS.AMS}/AssetStatusHistory`
const ASSET_OWNERSHIP_API_URL = `${API_BASE_URLS.AMS}/AssetOwnership`
const OWNER_API_URL = `${API_BASE_URLS.AMS}/Owner`

export function AssetList() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Read initial state from URL
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
  const searchFromUrl = searchParams.get('search') || ''
  const tabFromUrl = (searchParams.get('tab') || 'asset') as 'asset' | 'asset-type' | 'asset-status' | 'asset-status-history' | 'asset-ownership'
  const assetTypePageFromUrl = parseInt(searchParams.get('assetTypePage') || '1', 10)
  const statusPageFromUrl = parseInt(searchParams.get('statusPage') || '1', 10)
  const historyPageFromUrl = parseInt(searchParams.get('historyPage') || '1', 10)
  const ownershipPageFromUrl = parseInt(searchParams.get('ownershipPage') || '1', 10)
  const assetTypeSearchFromUrl = searchParams.get('assetTypeSearch') || ''
  const statusSearchFromUrl = searchParams.get('statusSearch') || ''
  const historySearchFromUrl = searchParams.get('historySearch') || ''
  const ownershipSearchFromUrl = searchParams.get('ownershipSearch') || ''
  
  const [assets, setAssets] = useState<Asset[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [assetStatuses, setAssetStatuses] = useState<AssetStatus[]>([])
  const [statusHistory, setStatusHistory] = useState<AssetStatusHistory[]>([])
  const [assetOwnerships, setAssetOwnerships] = useState<AssetOwnership[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'asset' | 'asset-type' | 'asset-status' | 'asset-status-history' | 'asset-ownership'>(tabFromUrl)
  const [searchQuery, setSearchQuery] = useState(searchFromUrl)
  const [assetTypeSearchQuery, setAssetTypeSearchQuery] = useState(assetTypeSearchFromUrl)
  const [statusSearchQuery, setStatusSearchQuery] = useState(statusSearchFromUrl)
  const [historySearchQuery, setHistorySearchQuery] = useState(historySearchFromUrl)
  const [ownershipSearchQuery, setOwnershipSearchQuery] = useState(ownershipSearchFromUrl)
  const [currentPage, setCurrentPage] = useState(pageFromUrl)
  const [pageSize] = useState(12)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // Pagination for each tab
  const [assetTypePage, setAssetTypePage] = useState(assetTypePageFromUrl)
  const [assetTypeTotalCount, setAssetTypeTotalCount] = useState(0)
  const [assetTypeTotalPages, setAssetTypeTotalPages] = useState(1)
  
  const [statusPage, setStatusPage] = useState(statusPageFromUrl)
  const [statusTotalCount, setStatusTotalCount] = useState(0)
  const [statusTotalPages, setStatusTotalPages] = useState(1)
  
  const [historyPage, setHistoryPage] = useState(historyPageFromUrl)
  const [historyTotalCount, setHistoryTotalCount] = useState(0)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)
  
  const [ownershipPage, setOwnershipPage] = useState(ownershipPageFromUrl)
  const [ownershipTotalCount, setOwnershipTotalCount] = useState(0)
  const [ownershipTotalPages, setOwnershipTotalPages] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)
  const editingAssetIdRef = useRef<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCreateLocation, setShowCreateLocation] = useState(false)
  const [showCreateSupplier, setShowCreateSupplier] = useState(false)
  const [showCreateAssetType, setShowCreateAssetType] = useState(false)
  const [showCreateInvoice, setShowCreateInvoice] = useState(false)
  const [newLocationName, setNewLocationName] = useState('')
  const [newSupplierName, setNewSupplierName] = useState('')
  const [newSupplierEmail, setNewSupplierEmail] = useState('')
  const [newSupplierPhone, setNewSupplierPhone] = useState('')
  const [newSupplierAddress, setNewSupplierAddress] = useState('')
  const [newAssetTypeName, setNewAssetTypeName] = useState('')
  const [newAssetTypeCategoryId, setNewAssetTypeCategoryId] = useState('')
  const [newInvoiceNumber, setNewInvoiceNumber] = useState('')
  const [newInvoiceDate, setNewInvoiceDate] = useState('')
  const [newInvoiceTotalAmount, setNewInvoiceTotalAmount] = useState('')
  const [newInvoiceDescription, setNewInvoiceDescription] = useState('')
  const [creatingLocation, setCreatingLocation] = useState(false)
  const [creatingSupplier, setCreatingSupplier] = useState(false)
  const [creatingAssetType, setCreatingAssetType] = useState(false)
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    hasWarranty: false,
    warrantyStartDate: '',
    warrantyEndDate: '',
    supplierId: '',
    locationId: '',
    assetTypeId: '',
    invoiceId: '',
  })
  
  // Modal states for new entities
  const [showAssetTypeModal, setShowAssetTypeModal] = useState(false)
  const [showAssetStatusModal, setShowAssetStatusModal] = useState(false)
  const [showStatusHistoryModal, setShowStatusHistoryModal] = useState(false)
  const [showOwnershipModal, setShowOwnershipModal] = useState(false)
  const [showDeleteAssetTypeModal, setShowDeleteAssetTypeModal] = useState(false)
  const [showDeleteStatusModal, setShowDeleteStatusModal] = useState(false)
  const [showDeleteHistoryModal, setShowDeleteHistoryModal] = useState(false)
  const [showDeleteOwnershipModal, setShowDeleteOwnershipModal] = useState(false)
  
  // Form data for new entities
  const [assetTypeFormData, setAssetTypeFormData] = useState({ name: '', categoryId: '' })
  const [statusFormData, setStatusFormData] = useState({ status: '', description: '', assetId: '' })
  const [historyFormData, setHistoryFormData] = useState({ name: '', assetId: '' })
  const [ownershipFormData, setOwnershipFormData] = useState({ name: '', assetId: '', ownerId: '' })
  
  // Editing states
  const [editingAssetType, setEditingAssetType] = useState<AssetType | null>(null)
  const [editingStatus, setEditingStatus] = useState<AssetStatus | null>(null)
  const [editingHistory, setEditingHistory] = useState<AssetStatusHistory | null>(null)
  const [editingOwnership, setEditingOwnership] = useState<AssetOwnership | null>(null)
  
  // Deleting states
  const [deletingAssetType, setDeletingAssetType] = useState<AssetType | null>(null)
  const [deletingStatus, setDeletingStatus] = useState<AssetStatus | null>(null)
  const [deletingHistory, setDeletingHistory] = useState<AssetStatusHistory | null>(null)
  const [deletingOwnership, setDeletingOwnership] = useState<AssetOwnership | null>(null)

  // Fetch related entities
  const fetchLocations = async () => {
    try {
      const response = await axios.get(LOCATION_API_URL)
      if (Array.isArray(response.data)) {
        setLocations(response.data)
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(SUPPLIER_API_URL)
      if (Array.isArray(response.data)) {
        setSuppliers(response.data)
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err)
    }
  }

  const fetchAssetTypes = async () => {
    try {
      const response = await axios.get(ASSET_TYPE_API_URL)
      if (Array.isArray(response.data)) {
        setAssetTypes(response.data)
      }
    } catch (err) {
      console.error('Error fetching asset types:', err)
    }
  }

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(INVOICE_API_URL)
      if (Array.isArray(response.data)) {
        setInvoices(response.data)
      }
    } catch (err) {
      console.error('Error fetching invoices:', err)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get(CATEGORY_API_URL)
      if (Array.isArray(response.data)) {
        setCategories(response.data)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  // Fetch owners
  const fetchOwners = async () => {
    try {
      const response = await axios.get(OWNER_API_URL)
      if (Array.isArray(response.data)) {
        setOwners(response.data)
      }
    } catch (err) {
      console.error('Error fetching owners:', err)
      setOwners([])
    }
  }

  // Fetch asset types with pagination
  const fetchAssetTypesPaginated = async () => {
    try {
      setLoading(true)
      setError(null)
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL asset types (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (assetTypeSearchQuery.trim()) {
        // Fetch all for client-side filtering
      } else {
        params.page = assetTypePage.toString()
        params.pageSize = pageSize.toString()
      }
      
      const response = await axios.get(ASSET_TYPE_API_URL, { params })
      const data = response.data
      const totalCountHeader = response.headers['x-total-count'] || response.headers['X-Total-Count']
      const totalPagesHeader = response.headers['x-total-pages'] || response.headers['X-Total-Pages']
      
      if (Array.isArray(data)) {
        let filteredData = data
        
        // Client-side filtering when searching
        if (assetTypeSearchQuery.trim()) {
          const searchLower = assetTypeSearchQuery.trim().toLowerCase()
          filteredData = data.filter((type: AssetType) => {
            const nameMatch = type.name.toLowerCase().includes(searchLower)
            const categoryMatch = (type.categoryName || getCategoryName(type.categoryId)).toLowerCase().includes(searchLower)
            return nameMatch || categoryMatch
          })
        }
        
        // Update pagination state from response headers (only if not searching)
        if (!assetTypeSearchQuery.trim()) {
          if (totalCountHeader) {
            setAssetTypeTotalCount(parseInt(totalCountHeader, 10))
            if (totalPagesHeader) {
              setAssetTypeTotalPages(parseInt(totalPagesHeader, 10))
            } else {
              setAssetTypeTotalPages(Math.ceil(parseInt(totalCountHeader, 10) / pageSize) || 1)
            }
          } else {
            setAssetTypeTotalCount(data.length)
            setAssetTypeTotalPages(Math.ceil(data.length / pageSize) || 1)
          }
        } else {
          // When searching, update count based on filtered results
          setAssetTypeTotalCount(filteredData.length)
          setAssetTypeTotalPages(1)
          if (assetTypePage !== 1) {
            setAssetTypePage(1)
          }
        }
        
        setAssetTypes(filteredData)
      }
    } catch (err) {
      console.error('Error fetching asset types:', err)
      setError('Failed to fetch asset types')
      setAssetTypes([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch asset statuses with pagination
  const fetchAssetStatuses = async () => {
    try {
      setLoading(true)
      setError(null)
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL statuses (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (statusSearchQuery.trim()) {
        // Fetch all for client-side filtering
      } else {
        params.page = statusPage.toString()
        params.pageSize = pageSize.toString()
      }
      
      const response = await axios.get(ASSET_STATUS_API_URL, { params })
      const data = response.data
      const totalCountHeader = response.headers['x-total-count'] || response.headers['X-Total-Count']
      const totalPagesHeader = response.headers['x-total-pages'] || response.headers['X-Total-Pages']
      
      if (Array.isArray(data)) {
        let filteredData = data
        
        // Client-side filtering when searching
        if (statusSearchQuery.trim()) {
          const searchLower = statusSearchQuery.trim().toLowerCase()
          filteredData = data.filter((status: AssetStatus) => {
            const statusMatch = status.status.toLowerCase().includes(searchLower)
            const descriptionMatch = (status.description || '').toLowerCase().includes(searchLower)
            const assetMatch = (status.assetName || getAssetName(status.assetId)).toLowerCase().includes(searchLower)
            return statusMatch || descriptionMatch || assetMatch
          })
        }
        
        // Update pagination state from response headers (only if not searching)
        if (!statusSearchQuery.trim()) {
          if (totalCountHeader) {
            setStatusTotalCount(parseInt(totalCountHeader, 10))
            if (totalPagesHeader) {
              setStatusTotalPages(parseInt(totalPagesHeader, 10))
            } else {
              setStatusTotalPages(Math.ceil(parseInt(totalCountHeader, 10) / pageSize) || 1)
            }
          } else {
            setStatusTotalCount(data.length)
            setStatusTotalPages(Math.ceil(data.length / pageSize) || 1)
          }
        } else {
          // When searching, update count based on filtered results
          setStatusTotalCount(filteredData.length)
          setStatusTotalPages(1)
          if (statusPage !== 1) {
            setStatusPage(1)
          }
        }
        
        setAssetStatuses(filteredData)
      }
    } catch (err) {
      console.error('Error fetching asset statuses:', err)
      setError('Failed to fetch asset statuses')
      setAssetStatuses([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch asset status history with pagination
  const fetchStatusHistory = async () => {
    try {
      setLoading(true)
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
      
      const response = await axios.get(ASSET_STATUS_HISTORY_API_URL, { params })
      const data = response.data
      const totalCountHeader = response.headers['x-total-count'] || response.headers['X-Total-Count']
      const totalPagesHeader = response.headers['x-total-pages'] || response.headers['X-Total-Pages']
      
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
        
        // Update pagination state from response headers (only if not searching)
        if (!historySearchQuery.trim()) {
          if (totalCountHeader) {
            setHistoryTotalCount(parseInt(totalCountHeader, 10))
            if (totalPagesHeader) {
              setHistoryTotalPages(parseInt(totalPagesHeader, 10))
            } else {
              setHistoryTotalPages(Math.ceil(parseInt(totalCountHeader, 10) / pageSize) || 1)
            }
          } else {
            setHistoryTotalCount(data.length)
            setHistoryTotalPages(Math.ceil(data.length / pageSize) || 1)
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
      }
    } catch (err) {
      console.error('Error fetching status history:', err)
      setError('Failed to fetch status history')
      setStatusHistory([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch asset ownerships with pagination
  const fetchAssetOwnerships = async () => {
    try {
      setLoading(true)
      setError(null)
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL ownerships (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (ownershipSearchQuery.trim()) {
        // Fetch all for client-side filtering
      } else {
        params.page = ownershipPage.toString()
        params.pageSize = pageSize.toString()
      }
      
      const response = await axios.get(ASSET_OWNERSHIP_API_URL, { params })
      const data = response.data
      const totalCountHeader = response.headers['x-total-count'] || response.headers['X-Total-Count']
      const totalPagesHeader = response.headers['x-total-pages'] || response.headers['X-Total-Pages']
      
      if (Array.isArray(data)) {
        let filteredData = data
        
        // Client-side filtering when searching
        if (ownershipSearchQuery.trim()) {
          const searchLower = ownershipSearchQuery.trim().toLowerCase()
          filteredData = data.filter((ownership: AssetOwnership) => {
            const assetMatch = (ownership.assetName || getAssetName(ownership.assetId)).toLowerCase().includes(searchLower)
            const ownerMatch = (ownership.ownerName || getOwnerName(ownership.ownerId)).toLowerCase().includes(searchLower)
            return assetMatch || ownerMatch
          })
        }
        
        // Update pagination state from response headers (only if not searching)
        if (!ownershipSearchQuery.trim()) {
          if (totalCountHeader) {
            setOwnershipTotalCount(parseInt(totalCountHeader, 10))
            if (totalPagesHeader) {
              setOwnershipTotalPages(parseInt(totalPagesHeader, 10))
            } else {
              setOwnershipTotalPages(Math.ceil(parseInt(totalCountHeader, 10) / pageSize) || 1)
            }
          } else {
            setOwnershipTotalCount(data.length)
            setOwnershipTotalPages(Math.ceil(data.length / pageSize) || 1)
          }
        } else {
          // When searching, update count based on filtered results
          setOwnershipTotalCount(filteredData.length)
          setOwnershipTotalPages(1)
          if (ownershipPage !== 1) {
            setOwnershipPage(1)
          }
        }
        
        setAssetOwnerships(filteredData)
      }
    } catch (err) {
      console.error('Error fetching asset ownerships:', err)
      setError('Failed to fetch asset ownerships')
      setAssetOwnerships([])
    } finally {
      setLoading(false)
    }
  }

  // Create new location
  const handleCreateLocation = async () => {
    if (!newLocationName.trim()) {
      setCreateError('Location name is required')
      return
    }

    try {
      setCreatingLocation(true)
      setCreateError(null)
      setError(null)
      const payload = {
        name: newLocationName.trim(),
      }
      
      await axios.post(LOCATION_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await fetchLocations()
      
      setNewLocationName('')
      setCreateError(null)
      setShowCreateLocation(false)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data || {}
        console.error('Error creating location - Full error:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: errorData,
        })
        
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages
              return `${field}: ${msg}`
            })
            .join('\n')
          setCreateError(`Validation errors:\n${validationErrors}`)
        } else {
          const errorMessage = errorData.title || errorData.message || errorData.error || err.message || `Failed to create location (${err.response?.status || 'Unknown error'})`
          setCreateError(errorMessage)
        }
      } else {
        setCreateError(err instanceof Error ? err.message : 'Failed to create location')
      }
      console.error('Error creating location:', err)
    } finally {
      setCreatingLocation(false)
    }
  }

  // Create new supplier
  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim()) {
      setCreateError('Supplier name is required')
      return
    }

    try {
      setCreatingSupplier(true)
      setCreateError(null)
      setError(null)
      const payload = {
        name: newSupplierName.trim(),
        email: newSupplierEmail.trim() || '',
        phone: newSupplierPhone.trim() || '',
        address: newSupplierAddress.trim() || '',
      }
      
      await axios.post(SUPPLIER_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await fetchSuppliers()
      
      setNewSupplierName('')
      setNewSupplierEmail('')
      setNewSupplierPhone('')
      setNewSupplierAddress('')
      setCreateError(null)
      setShowCreateSupplier(false)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data || {}
        console.error('Error creating supplier - Full error:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: errorData,
        })
        
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages
              return `${field}: ${msg}`
            })
            .join('\n')
          setCreateError(`Validation errors:\n${validationErrors}`)
        } else {
          const errorMessage = errorData.title || errorData.message || errorData.error || err.message || `Failed to create supplier (${err.response?.status || 'Unknown error'})`
          setCreateError(errorMessage)
        }
      } else {
        setCreateError(err instanceof Error ? err.message : 'Failed to create supplier')
      }
      console.error('Error creating supplier:', err)
    } finally {
      setCreatingSupplier(false)
    }
  }

  // Create new asset type
  const handleCreateAssetType = async () => {
    if (!newAssetTypeName.trim()) {
      setCreateError('Asset Type name is required')
      return
    }
    if (!newAssetTypeCategoryId) {
      setCreateError('Category is required for Asset Type')
      return
    }

    try {
      setCreatingAssetType(true)
      setCreateError(null)
      setError(null)
      const payload = {
        name: newAssetTypeName.trim(),
        categoryId: newAssetTypeCategoryId,
      }
      
      await axios.post(ASSET_TYPE_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await fetchAssetTypes()
      
      setNewAssetTypeName('')
      setNewAssetTypeCategoryId('')
      setCreateError(null)
      setShowCreateAssetType(false)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data || {}
        console.error('Error creating asset type - Full error:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: errorData,
        })
        
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages
              return `${field}: ${msg}`
            })
            .join('\n')
          setCreateError(`Validation errors:\n${validationErrors}`)
        } else {
          const errorMessage = errorData.title || errorData.message || errorData.error || err.message || `Failed to create asset type (${err.response?.status || 'Unknown error'})`
          setCreateError(errorMessage)
        }
      } else {
        setCreateError(err instanceof Error ? err.message : 'Failed to create asset type')
      }
      console.error('Error creating asset type:', err)
    } finally {
      setCreatingAssetType(false)
    }
  }

  // Create new invoice
  const handleCreateInvoice = async () => {
    if (!newInvoiceNumber.trim()) {
      setCreateError('Invoice number is required')
      return
    }

    try {
      setCreatingInvoice(true)
      setCreateError(null)
      setError(null)
      const payload = {
        number: newInvoiceNumber.trim(),
        date: newInvoiceDate || new Date().toISOString().split('T')[0],
        totalAmount: newInvoiceTotalAmount || '0',
        description: newInvoiceDescription.trim() || '',
      }
      
      await axios.post(INVOICE_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await fetchInvoices()
      
      setNewInvoiceNumber('')
      setNewInvoiceDate('')
      setNewInvoiceTotalAmount('')
      setNewInvoiceDescription('')
      setCreateError(null)
      setShowCreateInvoice(false)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data || {}
        console.error('Error creating invoice - Full error:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: errorData,
        })
        
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages
              return `${field}: ${msg}`
            })
            .join('\n')
          setCreateError(`Validation errors:\n${validationErrors}`)
        } else {
          const errorMessage = errorData.title || errorData.message || errorData.error || err.message || `Failed to create invoice (${err.response?.status || 'Unknown error'})`
          setCreateError(errorMessage)
        }
      } else {
        setCreateError(err instanceof Error ? err.message : 'Failed to create invoice')
      }
      console.error('Error creating invoice:', err)
    } finally {
      setCreatingInvoice(false)
    }
  }

  // Get name helpers
  const getLocationName = (id?: string) => {
    if (!id) return '-'
    const location = locations.find((loc) => loc.id === id)
    return location ? location.name : '-'
  }

  const getSupplierName = (id?: string) => {
    if (!id) return '-'
    const supplier = suppliers.find((sup) => sup.id === id)
    return supplier ? supplier.name : '-'
  }

  const getAssetTypeName = (id?: string) => {
    if (!id) return '-'
    const assetType = assetTypes.find((at) => at.id === id)
    return assetType ? assetType.name : '-'
  }

  const getInvoiceNumber = (id?: string) => {
    if (!id) return '-'
    const invoice = invoices.find((inv) => inv.id === id)
    return invoice ? invoice.number : '-'
  }

  const getAssetName = (id?: string) => {
    if (!id) return 'N/A'
    const asset = assets.find((a) => a.id === id)
    return asset ? asset.name : 'N/A'
  }

  const getOwnerName = (id?: string) => {
    if (!id) return 'N/A'
    const owner = owners.find((o) => o.id === id)
    return owner ? owner.name : 'N/A'
  }

  const getCategoryName = (id?: string) => {
    if (!id) return '-'
    const category = categories.find((c) => c.id === id)
    return category ? category.name : '-'
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  // Fetch assets from API with pagination
  const fetchAssets = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: Record<string, string> = {}
      
      // When searching, fetch ALL assets (no pagination) for client-side filtering
      // When not searching, use server-side pagination
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      } else {
        params.page = currentPage.toString()
        params.pageSize = pageSize.toString()
      }
      
      const response = await axios.get(API_BASE_URL, {
        params,
      })

      const data = response.data
      
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
      
      // Set assets data with client-side filtering
      if (Array.isArray(data)) {
        let filteredData = data
        if (searchQuery.trim()) {
          const searchLower = searchQuery.trim().toLowerCase()
          filteredData = data.filter((asset: Asset) => {
            const nameMatch = asset.name.toLowerCase().includes(searchLower)
            const serialMatch = asset.serialNumber?.toLowerCase().includes(searchLower) || false
            const locationMatch = (asset.locationName || getLocationName(asset.locationId)).toLowerCase().includes(searchLower)
            const supplierMatch = (asset.supplierName || getSupplierName(asset.supplierId)).toLowerCase().includes(searchLower)
            const assetTypeMatch = (asset.assetTypeName || getAssetTypeName(asset.assetTypeId)).toLowerCase().includes(searchLower)
            const invoiceMatch = (asset.invoiceNumber || getInvoiceNumber(asset.invoiceId)).toLowerCase().includes(searchLower)
            return nameMatch || serialMatch || locationMatch || supplierMatch || assetTypeMatch || invoiceMatch
          })
        }
        
        setAssets(filteredData)
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
        if (!searchQuery.trim() && editingAssetIdRef.current && scrollContainerRef.current) {
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollPositionRef.current
              editingAssetIdRef.current = null
            }
          }, 50)
        }
      } else {
        setAssets([])
        setError('Invalid response format from server')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred while fetching assets'
        setError(errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching assets')
      }
      setAssets([])
    } finally {
      setLoading(false)
    }
  }

  // Add new asset
  const handleAdd = async () => {
    try {
      setError(null)
      
      const name = (formData.name || '').trim()
      const serialNumber = (formData.serialNumber || '').trim()
      
      if (!name) {
        setError('Name is required')
        return
      }
      if (!serialNumber) {
        setError('Serial Number is required')
        return
      }
      
      const payload: any = {
        name: name,
        serialNumber: serialNumber,
        hasWarranty: formData.hasWarranty,
      }

      if (formData.hasWarranty) {
        if (formData.warrantyStartDate) {
          payload.warrantyStartDate = formData.warrantyStartDate + 'T00:00:00'
        }
        if (formData.warrantyEndDate) {
          payload.warrantyEndDate = formData.warrantyEndDate + 'T00:00:00'
        }
      }

      if (formData.supplierId && formData.supplierId.trim()) {
        payload.supplierId = formData.supplierId.trim()
      }
      if (formData.locationId && formData.locationId.trim()) {
        payload.locationId = formData.locationId.trim()
      }
      if (formData.assetTypeId && formData.assetTypeId.trim()) {
        payload.assetTypeId = formData.assetTypeId.trim()
      }
      if (formData.invoiceId && formData.invoiceId.trim()) {
        payload.invoiceId = formData.invoiceId.trim()
      }
      
      await axios.post(API_BASE_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      setShowModal(false)
      setFormData({
        name: '',
        serialNumber: '',
        hasWarranty: false,
        warrantyStartDate: '',
        warrantyEndDate: '',
        supplierId: '',
        locationId: '',
        assetTypeId: '',
        invoiceId: '',
      })
      
      await fetchAssets()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data || {}
        console.error('Error adding asset - Full error:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: errorData,
          formData: formData,
        })
        
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages
              return `${field}: ${msg}`
            })
            .join('\n')
          setError(`Validation errors:\n${validationErrors}`)
        } else {
          const errorMessage = errorData.title || errorData.message || errorData.error || err.message || `Failed to add asset (${err.response?.status || 'Unknown error'})`
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to add asset')
      }
    }
  }

  // Update asset
  const handleUpdate = async () => {
    if (!editingAsset) return

    try {
      setError(null)
      
      // Store current scroll position before update
      if (scrollContainerRef.current) {
        scrollPositionRef.current = scrollContainerRef.current.scrollTop
      }
      editingAssetIdRef.current = editingAsset.id
      
      const name = (formData.name || '').trim()
      const serialNumber = (formData.serialNumber || '').trim()
      
      if (!name) {
        setError('Name is required')
        return
      }
      if (!serialNumber) {
        setError('Serial Number is required')
        return
      }
      
      const payload: any = {
        name: name,
        serialNumber: serialNumber,
        hasWarranty: formData.hasWarranty,
      }

      if (formData.hasWarranty) {
        if (formData.warrantyStartDate) {
          payload.warrantyStartDate = formData.warrantyStartDate + 'T00:00:00'
        }
        if (formData.warrantyEndDate) {
          payload.warrantyEndDate = formData.warrantyEndDate + 'T00:00:00'
        }
      }

      if (formData.supplierId && formData.supplierId.trim()) {
        payload.supplierId = formData.supplierId.trim()
      }
      if (formData.locationId && formData.locationId.trim()) {
        payload.locationId = formData.locationId.trim()
      }
      if (formData.assetTypeId && formData.assetTypeId.trim()) {
        payload.assetTypeId = formData.assetTypeId.trim()
      }
      if (formData.invoiceId && formData.invoiceId.trim()) {
        payload.invoiceId = formData.invoiceId.trim()
      }
      
      await axios.put(`${API_BASE_URL}/${editingAsset.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await fetchAssets()
      
      setShowModal(false)
      setEditingAsset(null)
      setFormData({
        name: '',
        serialNumber: '',
        hasWarranty: false,
        warrantyStartDate: '',
        warrantyEndDate: '',
        supplierId: '',
        locationId: '',
        assetTypeId: '',
        invoiceId: '',
      })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data || {}
        console.error('Error updating asset - Full error:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: errorData,
          assetId: editingAsset.id,
          formData: formData,
        })
        
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages
              return `${field}: ${msg}`
            })
            .join('\n')
          setError(`Validation errors:\n${validationErrors}`)
        } else {
          const errorMessage = errorData.title || errorData.message || errorData.error || err.message || `Failed to update asset (${err.response?.status || 'Unknown error'})`
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update asset')
      }
    }
  }

  // Delete asset
  const handleDelete = async () => {
    if (!deletingAsset) return

    try {
      setError(null)
      await axios.delete(`${API_BASE_URL}/${deletingAsset.id}`)
      await fetchAssets()
      setShowDeleteModal(false)
      setDeletingAsset(null)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to delete asset'
        setError(errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete asset')
      }
    }
  }

  // ========== Asset Type CRUD Operations ==========
  const handleAddAssetType = async () => {
    if (!assetTypeFormData.name.trim() || !assetTypeFormData.categoryId) {
      setError('Name and Category are required')
      return
    }
    try {
      setError(null)
      await axios.post(ASSET_TYPE_API_URL, {
        name: assetTypeFormData.name.trim(),
        categoryId: assetTypeFormData.categoryId,
      })
      await fetchAssetTypesPaginated()
      setShowAssetTypeModal(false)
      setAssetTypeFormData({ name: '', categoryId: '' })
      setEditingAssetType(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add asset type')
    }
  }

  const handleUpdateAssetType = async () => {
    if (!editingAssetType || !assetTypeFormData.name.trim() || !assetTypeFormData.categoryId) {
      setError('Name and Category are required')
      return
    }
    try {
      setError(null)
      await axios.put(`${ASSET_TYPE_API_URL}/${editingAssetType.id}`, {
        name: assetTypeFormData.name.trim(),
        categoryId: assetTypeFormData.categoryId,
      })
      await fetchAssetTypesPaginated()
      setShowAssetTypeModal(false)
      setAssetTypeFormData({ name: '', categoryId: '' })
      setEditingAssetType(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update asset type')
    }
  }

  const handleDeleteAssetType = async () => {
    if (!deletingAssetType) return
    try {
      setError(null)
      await axios.delete(`${ASSET_TYPE_API_URL}/${deletingAssetType.id}`)
      await fetchAssetTypesPaginated()
      setShowDeleteAssetTypeModal(false)
      setDeletingAssetType(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete asset type')
    }
  }

  // ========== Asset Status CRUD Operations ==========
  const handleAddStatus = async () => {
    if (!statusFormData.status.trim() || !statusFormData.assetId) {
      setError('Status and Asset are required')
      return
    }
    try {
      setError(null)
      await axios.post(ASSET_STATUS_API_URL, {
        status: statusFormData.status.trim(),
        description: statusFormData.description.trim(),
        assetId: statusFormData.assetId,
      })
      await fetchAssetStatuses()
      setShowAssetStatusModal(false)
      setStatusFormData({ status: '', description: '', assetId: '' })
      setEditingStatus(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add asset status')
    }
  }

  const handleUpdateStatus = async () => {
    if (!editingStatus || !statusFormData.status.trim() || !statusFormData.assetId) {
      setError('Status and Asset are required')
      return
    }
    try {
      setError(null)
      await axios.put(`${ASSET_STATUS_API_URL}/${editingStatus.id}`, {
        status: statusFormData.status.trim(),
        description: statusFormData.description.trim(),
        assetId: statusFormData.assetId,
      })
      await fetchAssetStatuses()
      setShowAssetStatusModal(false)
      setStatusFormData({ status: '', description: '', assetId: '' })
      setEditingStatus(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update asset status')
    }
  }

  const handleDeleteStatus = async () => {
    if (!deletingStatus) return
    try {
      setError(null)
      await axios.delete(`${ASSET_STATUS_API_URL}/${deletingStatus.id}`)
      await fetchAssetStatuses()
      setShowDeleteStatusModal(false)
      setDeletingStatus(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete asset status')
    }
  }

  // ========== Asset Status History CRUD Operations ==========
  const handleAddHistory = async () => {
    if (!historyFormData.name.trim() || !historyFormData.assetId) {
      setError('Name and Asset are required')
      return
    }
    try {
      setError(null)
      await axios.post(ASSET_STATUS_HISTORY_API_URL, {
        name: historyFormData.name.trim(),
        assetId: historyFormData.assetId,
      })
      await fetchStatusHistory()
      setShowStatusHistoryModal(false)
      setHistoryFormData({ name: '', assetId: '' })
      setEditingHistory(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add status history')
    }
  }

  const handleUpdateHistory = async () => {
    if (!editingHistory || !historyFormData.name.trim() || !historyFormData.assetId) {
      setError('Name and Asset are required')
      return
    }
    try {
      setError(null)
      await axios.put(`${ASSET_STATUS_HISTORY_API_URL}/${editingHistory.id}`, {
        name: historyFormData.name.trim(),
        assetId: historyFormData.assetId,
      })
      await fetchStatusHistory()
      setShowStatusHistoryModal(false)
      setHistoryFormData({ name: '', assetId: '' })
      setEditingHistory(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update status history')
    }
  }

  const handleDeleteHistory = async () => {
    if (!deletingHistory) return
    try {
      setError(null)
      await axios.delete(`${ASSET_STATUS_HISTORY_API_URL}/${deletingHistory.id}`)
      await fetchStatusHistory()
      setShowDeleteHistoryModal(false)
      setDeletingHistory(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete status history')
    }
  }

  // ========== Asset Ownership CRUD Operations ==========
  const handleAddOwnership = async () => {
    if (!ownershipFormData.name.trim() || !ownershipFormData.assetId || !ownershipFormData.ownerId) {
      setError('Name, Asset, and Owner are required')
      return
    }
    try {
      setError(null)
      await axios.post(ASSET_OWNERSHIP_API_URL, {
        name: ownershipFormData.name.trim(),
        assetId: ownershipFormData.assetId,
        ownerId: ownershipFormData.ownerId,
      })
      await fetchAssetOwnerships()
      setShowOwnershipModal(false)
      setOwnershipFormData({ name: '', assetId: '', ownerId: '' })
      setEditingOwnership(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add asset ownership')
    }
  }

  const handleUpdateOwnership = async () => {
    if (!editingOwnership || !ownershipFormData.name.trim() || !ownershipFormData.assetId || !ownershipFormData.ownerId) {
      setError('Name, Asset, and Owner are required')
      return
    }
    try {
      setError(null)
      await axios.put(`${ASSET_OWNERSHIP_API_URL}/${editingOwnership.id}`, {
        name: ownershipFormData.name.trim(),
        assetId: ownershipFormData.assetId,
        ownerId: ownershipFormData.ownerId,
      })
      await fetchAssetOwnerships()
      setShowOwnershipModal(false)
      setOwnershipFormData({ name: '', assetId: '', ownerId: '' })
      setEditingOwnership(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update asset ownership')
    }
  }

  const handleDeleteOwnership = async () => {
    if (!deletingOwnership) return
    try {
      setError(null)
      await axios.delete(`${ASSET_OWNERSHIP_API_URL}/${deletingOwnership.id}`)
      await fetchAssetOwnerships()
      setShowDeleteOwnershipModal(false)
      setDeletingOwnership(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete asset ownership')
    }
  }

  // Open modal for add
  const openAddModal = () => {
    setEditingAsset(null)
    setShowCreateLocation(false)
    setShowCreateSupplier(false)
    setShowCreateAssetType(false)
    setShowCreateInvoice(false)
    setCreateError(null)
    setFormData({
      name: '',
      serialNumber: '',
      hasWarranty: false,
      warrantyStartDate: '',
      warrantyEndDate: '',
      supplierId: '',
      locationId: '',
      assetTypeId: '',
      invoiceId: '',
    })
    setShowModal(true)
  }

  // Open modal for edit
  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset)
    setShowCreateLocation(false)
    setShowCreateSupplier(false)
    setShowCreateAssetType(false)
    setShowCreateInvoice(false)
    setCreateError(null)
    setNewLocationName('')
    setNewSupplierName('')
    setNewSupplierEmail('')
    setNewSupplierPhone('')
    setNewSupplierAddress('')
    setNewAssetTypeName('')
    setNewAssetTypeCategoryId('')
    setNewInvoiceNumber('')
    setNewInvoiceDate('')
    setNewInvoiceTotalAmount('')
    setNewInvoiceDescription('')
    // Parse warranty dates from ISO format to YYYY-MM-DD
    const warrantyStartDate = asset.warrantyStartDate ? asset.warrantyStartDate.split('T')[0] : ''
    const warrantyEndDate = asset.warrantyEndDate ? asset.warrantyEndDate.split('T')[0] : ''
    
    setFormData({
      name: asset.name,
      serialNumber: asset.serialNumber,
      hasWarranty: asset.hasWarranty || false,
      warrantyStartDate: warrantyStartDate,
      warrantyEndDate: warrantyEndDate,
      supplierId: asset.supplierId || '',
      locationId: asset.locationId || '',
      assetTypeId: asset.assetTypeId || '',
      invoiceId: asset.invoiceId || '',
    })
    setShowModal(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (asset: Asset) => {
    setDeletingAsset(asset)
    setShowDeleteModal(true)
  }

  // Export to Excel
  const handleExportToExcel = () => {
    // Prepare data for export
    const exportData = assets.map((asset) => ({
      Name: asset.name,
      'Serial Number': asset.serialNumber,
      'Has Warranty': asset.hasWarranty ? 'Yes' : 'No',
      'Warranty Start Date': asset.warrantyStartDate ? formatDate(asset.warrantyStartDate) : '-',
      'Warranty End Date': asset.warrantyEndDate ? formatDate(asset.warrantyEndDate) : '-',
      Location: asset.locationName || getLocationName(asset.locationId),
      Supplier: asset.supplierName || getSupplierName(asset.supplierId),
      'Asset Type': asset.assetTypeName || getAssetTypeName(asset.assetTypeId),
      'Invoice Number': asset.invoiceNumber || getInvoiceNumber(asset.invoiceId),
    }))

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Assets')

    // Set column widths
    const colWidths = [
      { wch: 30 }, // Name
      { wch: 20 }, // Serial Number
      { wch: 15 }, // Has Warranty
      { wch: 20 }, // Warranty Start Date
      { wch: 20 }, // Warranty End Date
      { wch: 20 }, // Location
      { wch: 20 }, // Supplier
      { wch: 20 }, // Asset Type
      { wch: 20 }, // Invoice Number
    ]
    ws['!cols'] = colWidths

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0]
    const filename = `Assets_Export_${date}.xlsx`

    // Save file
    XLSX.writeFile(wb, filename)
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim()) {
      setError('Please fill in the required field (Name)')
      return
    }
    if (!formData.serialNumber?.trim()) {
      setError('Please fill in the required field (Serial Number)')
      return
    }
    
    if (editingAsset) {
      await handleUpdate()
    } else {
      await handleAdd()
    }
  }

  // Initial fetch on mount - fetch related entities first, then assets
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchLocations(),
        fetchSuppliers(),
        fetchAssetTypes(),
        fetchInvoices(),
        fetchCategories(),
        fetchOwners(),
        fetchAssets(),
      ])
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'asset-type') {
      fetchAssetTypesPaginated()
    } else if (activeTab === 'asset-status') {
      fetchAssetStatuses()
    } else if (activeTab === 'asset-status-history') {
      fetchStatusHistory()
    } else if (activeTab === 'asset-ownership') {
      fetchAssetOwnerships()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, assetTypePage, statusPage, historyPage, ownershipPage])

  // Update URL when page, search, tab, or pagination changes
  useEffect(() => {
    const params = new URLSearchParams()
    
    // Always set the active tab
    params.set('tab', activeTab)
    
    // Set page based on active tab
    if (activeTab === 'asset') {
      if (currentPage > 1) {
        params.set('page', currentPage.toString())
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim())
      }
    } else if (activeTab === 'asset-type') {
      if (assetTypePage > 1) {
        params.set('assetTypePage', assetTypePage.toString())
      }
      if (assetTypeSearchQuery.trim()) {
        params.set('assetTypeSearch', assetTypeSearchQuery.trim())
      }
    } else if (activeTab === 'asset-status') {
      if (statusPage > 1) {
        params.set('statusPage', statusPage.toString())
      }
      if (statusSearchQuery.trim()) {
        params.set('statusSearch', statusSearchQuery.trim())
      }
    } else if (activeTab === 'asset-status-history') {
      if (historyPage > 1) {
        params.set('historyPage', historyPage.toString())
      }
      if (historySearchQuery.trim()) {
        params.set('historySearch', historySearchQuery.trim())
      }
    } else if (activeTab === 'asset-ownership') {
      if (ownershipPage > 1) {
        params.set('ownershipPage', ownershipPage.toString())
      }
      if (ownershipSearchQuery.trim()) {
        params.set('ownershipSearch', ownershipSearchQuery.trim())
      }
    }
    
    const currentUrl = searchParams.toString()
    const newUrl = params.toString()
    if (currentUrl !== newUrl) {
      setSearchParams(params, { replace: true })
    }
  }, [activeTab, currentPage, assetTypePage, statusPage, historyPage, ownershipPage, searchQuery, assetTypeSearchQuery, statusSearchQuery, historySearchQuery, ownershipSearchQuery, searchParams, setSearchParams])

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
      if (activeTab === 'asset') {
        fetchAssets()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, activeTab])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'asset-type') {
        fetchAssetTypesPaginated()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetTypeSearchQuery, activeTab])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'asset-status') {
        fetchAssetStatuses()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusSearchQuery, activeTab])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'asset-status-history') {
        fetchStatusHistory()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historySearchQuery, activeTab])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'asset-ownership') {
        fetchAssetOwnerships()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownershipSearchQuery, activeTab])

  return (
    <div className="flex min-h-screen">
      <AMSSidebar />

      <main className="flex-1 ml-72 px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                {activeTab === 'asset' && 'Asset'}
                {activeTab === 'asset-type' && 'Asset Type'}
                {activeTab === 'asset-status' && 'Asset Status'}
                {activeTab === 'asset-status-history' && 'Asset Status History'}
                {activeTab === 'asset-ownership' && 'Asset Ownership'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'asset' && (
                <button
                  onClick={handleExportToExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                  disabled={assets.length === 0}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Excel
                </button>
              )}
              {activeTab === 'asset-type' && (
                <button
                  onClick={() => {
                    setEditingAssetType(null)
                    setAssetTypeFormData({ name: '', categoryId: '' })
                    setShowAssetTypeModal(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Asset Type
                </button>
              )}
              {activeTab === 'asset-status' && (
                <button
                  onClick={() => {
                    setEditingStatus(null)
                    setStatusFormData({ status: '', description: '', assetId: '' })
                    setShowAssetStatusModal(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Status
                </button>
              )}
              {activeTab === 'asset-status-history' && (
                <button
                  onClick={() => {
                    setEditingHistory(null)
                    setHistoryFormData({ name: '', assetId: '' })
                    setShowStatusHistoryModal(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add History
                </button>
              )}
              {activeTab === 'asset-ownership' && (
                <button
                  onClick={() => {
                    setEditingOwnership(null)
                    setOwnershipFormData({ name: '', assetId: '', ownerId: '' })
                    setShowOwnershipModal(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Ownership
                </button>
              )}
            {activeTab === 'asset' && (
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
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-1 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('asset')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'asset'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Asset
            </button>
            <button
              onClick={() => setActiveTab('asset-type')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'asset-type'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Asset Type
            </button>
            <button
              onClick={() => setActiveTab('asset-status')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'asset-status'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Asset Status
            </button>
            <button
              onClick={() => setActiveTab('asset-status-history')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'asset-status-history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Status History
            </button>
            <button
              onClick={() => setActiveTab('asset-ownership')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'asset-ownership'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Asset Ownership
            </button>
          </div>

          {/* Search Bar */}
          {activeTab === 'asset' && (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchAssets()
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
          {activeTab === 'asset-type' && (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={assetTypeSearchQuery}
                onChange={(e) => setAssetTypeSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchAssetTypesPaginated()
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
              {assetTypeSearchQuery && (
                <button
                  onClick={() => {
                    setAssetTypeSearchQuery('')
                    setAssetTypePage(1)
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
          {activeTab === 'asset-status' && (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={statusSearchQuery}
                onChange={(e) => setStatusSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchAssetStatuses()
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
              {statusSearchQuery && (
                <button
                  onClick={() => {
                    setStatusSearchQuery('')
                    setStatusPage(1)
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
          {activeTab === 'asset-status-history' && (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchStatusHistory()
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
          {activeTab === 'asset-ownership' && (
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={ownershipSearchQuery}
                onChange={(e) => setOwnershipSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchAssetOwnerships()
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
              {ownershipSearchQuery && (
                <button
                  onClick={() => {
                    setOwnershipSearchQuery('')
                    setOwnershipPage(1)
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
        {activeTab === 'asset' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0 overflow-hidden">
            <table className="w-full">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Serial Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Warranty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Asset Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Invoice Number
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable Table Body */}
          <div ref={scrollContainerRef} className="overflow-y-auto max-h-[600px] flex-1">
            <table className="w-full">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
              </colgroup>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-500">
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading assets...
                      </div>
                    </td>
                  </tr>
                ) : assets.length > 0 ? (
                  assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {asset.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                        {asset.serialNumber}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {asset.hasWarranty ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Yes
                            </span>
                            {asset.warrantyStartDate && asset.warrantyEndDate && (
                              <span className="text-xs text-slate-500 whitespace-nowrap">
                                {formatDate(asset.warrantyStartDate)} - {formatDate(asset.warrantyEndDate)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {asset.locationName || getLocationName(asset.locationId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {asset.supplierName || getSupplierName(asset.supplierId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {asset.assetTypeName || getAssetTypeName(asset.assetTypeId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {asset.invoiceNumber || getInvoiceNumber(asset.invoiceId)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(asset)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-all"
                            title="Edit Asset"
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
                            onClick={() => openDeleteModal(asset)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-all"
                            title="Delete Asset"
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
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-sm font-medium text-slate-500">No assets found</p>
                        <p className="text-xs text-slate-400 mt-1">Get started by adding a new asset</p>
                      </div>
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

        {/* Asset Type Table */}
        {activeTab === 'asset-type' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Category</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">Loading...</td>
                    </tr>
                  ) : assetTypes.length > 0 ? (
                    assetTypes.map((type) => (
                      <tr key={type.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{type.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{type.categoryName || getAssetTypeName(type.categoryId)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingAssetType(type)
                                setAssetTypeFormData({ name: type.name, categoryId: type.categoryId })
                                setShowAssetTypeModal(true)
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setDeletingAssetType(type)
                                setShowDeleteAssetTypeModal(true)
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">No asset types found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {assetTypeTotalCount > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button onClick={() => setAssetTypePage(1)} disabled={assetTypePage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;&lt;&lt;</button>
                  <button onClick={() => setAssetTypePage(p => Math.max(1, p - 1))} disabled={assetTypePage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;</button>
                  <button disabled className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-default">{assetTypePage}</button>
                  <button onClick={() => setAssetTypePage(p => Math.min(assetTypeTotalPages, p + 1))} disabled={assetTypePage === assetTypeTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;</button>
                  <button onClick={() => setAssetTypePage(assetTypeTotalPages)} disabled={assetTypePage === assetTypeTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;&gt;&gt;</button>
                </div>
                <div className="text-sm text-slate-600">
                  Showing {((assetTypePage - 1) * pageSize) + 1} to {Math.min(assetTypePage * pageSize, assetTypeTotalCount)} of {assetTypeTotalCount} records
                </div>
              </div>
            )}
          </div>
        )}

        {/* Asset Status Table */}
        {activeTab === 'asset-status' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Asset</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">Loading...</td>
                    </tr>
                  ) : assetStatuses.length > 0 ? (
                    assetStatuses.map((status) => (
                      <tr key={status.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{status.status}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{status.description}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{status.assetName || getAssetName(status.assetId)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingStatus(status); setStatusFormData({ status: status.status, description: status.description, assetId: status.assetId }); setShowAssetStatusModal(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => { setDeletingStatus(status); setShowDeleteStatusModal(true) }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No asset statuses found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {statusTotalCount > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button onClick={() => setStatusPage(1)} disabled={statusPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;&lt;&lt;</button>
                  <button onClick={() => setStatusPage(p => Math.max(1, p - 1))} disabled={statusPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;</button>
                  <button disabled className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-default">{statusPage}</button>
                  <button onClick={() => setStatusPage(p => Math.min(statusTotalPages, p + 1))} disabled={statusPage === statusTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;</button>
                  <button onClick={() => setStatusPage(statusTotalPages)} disabled={statusPage === statusTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;&gt;&gt;</button>
                </div>
                <div className="text-sm text-slate-600">
                  Showing {((statusPage - 1) * pageSize) + 1} to {Math.min(statusPage * pageSize, statusTotalCount)} of {statusTotalCount} records
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status History Table */}
        {activeTab === 'asset-status-history' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Asset</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">Loading...</td>
                    </tr>
                  ) : statusHistory.length > 0 ? (
                    statusHistory.map((history) => (
                      <tr key={history.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{history.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{history.assetName || getAssetName(history.assetId)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingHistory(history); setHistoryFormData({ name: history.name, assetId: history.assetId }); setShowStatusHistoryModal(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => { setDeletingHistory(history); setShowDeleteHistoryModal(true) }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">No status history found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {historyTotalCount > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button onClick={() => setHistoryPage(1)} disabled={historyPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;&lt;&lt;</button>
                  <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;</button>
                  <button disabled className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-default">{historyPage}</button>
                  <button onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))} disabled={historyPage === historyTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;</button>
                  <button onClick={() => setHistoryPage(historyTotalPages)} disabled={historyPage === historyTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;&gt;&gt;</button>
                </div>
                <div className="text-sm text-slate-600">
                  Showing {((historyPage - 1) * pageSize) + 1} to {Math.min(historyPage * pageSize, historyTotalCount)} of {historyTotalCount} records
                </div>
              </div>
            )}
          </div>
        )}

        {/* Asset Ownership Table */}
        {activeTab === 'asset-ownership' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Asset</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Owner</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">Loading...</td>
                    </tr>
                  ) : assetOwnerships.length > 0 ? (
                    assetOwnerships.map((ownership) => (
                      <tr key={ownership.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">{ownership.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{ownership.assetName || getAssetName(ownership.assetId)}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{ownership.ownerName || getOwnerName(ownership.ownerId)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingOwnership(ownership); setOwnershipFormData({ name: ownership.name, assetId: ownership.assetId, ownerId: ownership.ownerId }); setShowOwnershipModal(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => { setDeletingOwnership(ownership); setShowDeleteOwnershipModal(true) }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No asset ownerships found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {ownershipTotalCount > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button onClick={() => setOwnershipPage(1)} disabled={ownershipPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;&lt;&lt;</button>
                  <button onClick={() => setOwnershipPage(p => Math.max(1, p - 1))} disabled={ownershipPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&lt;</button>
                  <button disabled className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-default">{ownershipPage}</button>
                  <button onClick={() => setOwnershipPage(p => Math.min(ownershipTotalPages, p + 1))} disabled={ownershipPage === ownershipTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;</button>
                  <button onClick={() => setOwnershipPage(ownershipTotalPages)} disabled={ownershipPage === ownershipTotalPages} className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition">&gt;&gt;&gt;</button>
                </div>
                <div className="text-sm text-slate-600">
                  Showing {((ownershipPage - 1) * pageSize) + 1} to {Math.min(ownershipPage * pageSize, ownershipTotalCount)} of {ownershipTotalCount} records
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className={`${editingAsset ? 'bg-blue-600' : 'bg-green-600'} px-6 py-4`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  {editingAsset ? (
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
                  {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Please enter asset name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Please enter serial number"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.hasWarranty}
                    onChange={(e) => setFormData({ ...formData, hasWarranty: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">Has Warranty</span>
                </label>
              </div>

              {formData.hasWarranty && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Warranty Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.warrantyStartDate}
                      onChange={(e) => setFormData({ ...formData, warrantyStartDate: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Warranty End Date
                    </label>
                    <input
                      type="date"
                      value={formData.warrantyEndDate}
                      onChange={(e) => setFormData({ ...formData, warrantyEndDate: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Location
                  </label>
                    <select
                      value={formData.locationId}
                      onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={locations.length === 0}
                    >
                    <option value="">Please select location</option>
                      {locations.length === 0 ? (
                        <option value="">No locations available</option>
                      ) : (
                        locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))
                      )}
                    </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Supplier
                  </label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={suppliers.length === 0}
                    >
                    <option value="">Please select supplier</option>
                      {suppliers.length === 0 ? (
                        <option value="">No suppliers available</option>
                      ) : (
                        suppliers.map((sup) => (
                          <option key={sup.id} value={sup.id}>
                            {sup.name}
                          </option>
                        ))
                      )}
                    </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Asset Type
                  </label>
                    <select
                      value={formData.assetTypeId}
                      onChange={(e) => setFormData({ ...formData, assetTypeId: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={assetTypes.length === 0}
                    >
                    <option value="">Please select asset type</option>
                      {assetTypes.length === 0 ? (
                        <option value="">No asset types available</option>
                      ) : (
                        assetTypes.map((at) => (
                          <option key={at.id} value={at.id}>
                            {at.name}
                          </option>
                        ))
                      )}
                    </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Invoice
                  </label>
                    <select
                      value={formData.invoiceId}
                      onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={invoices.length === 0}
                    >
                    <option value="">Please select invoice</option>
                      {invoices.length === 0 ? (
                        <option value="">No invoices available</option>
                      ) : (
                        invoices.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.number}
                          </option>
                        ))
                      )}
                    </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingAsset(null)
                    setFormData({
                      name: '',
                      serialNumber: '',
                      hasWarranty: false,
                      warrantyStartDate: '',
                      warrantyEndDate: '',
                      supplierId: '',
                      locationId: '',
                      assetTypeId: '',
                      invoiceId: '',
                    })
                  }}
                  className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-lg text-white font-medium transition shadow-md hover:shadow-lg ${
                    editingAsset
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {editingAsset ? 'Update Asset' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center ring-4 ring-red-100">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Delete Asset</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Are you sure you want to delete "{deletingAsset.name}"?
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. This will permanently delete the asset.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingAsset(null)
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

      {/* Create Location Modal */}
      {showCreateLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-green-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Create New Location</h2>
              </div>
            </div>
            <div className="p-6">
              {createError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {createError}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="Please enter location name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleCreateLocation()
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateLocation(false)
                    setNewLocationName('')
                    setCreateError(null)
                  }}
                  className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateLocation}
                  disabled={creatingLocation || !newLocationName.trim()}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingLocation ? 'Creating...' : 'Create Location'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Supplier Modal */}
      {showCreateSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-green-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Create New Supplier</h2>
              </div>
            </div>
            <div className="p-6">
              {createError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {createError}
                </div>
              )}
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Please enter supplier name"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newSupplierEmail}
                    onChange={(e) => setNewSupplierEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Please enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newSupplierPhone}
                    onChange={(e) => setNewSupplierPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Please enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={newSupplierAddress}
                    onChange={(e) => setNewSupplierAddress(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Please enter address"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateSupplier(false)
                    setNewSupplierName('')
                    setNewSupplierEmail('')
                    setNewSupplierPhone('')
                    setNewSupplierAddress('')
                    setCreateError(null)
                  }}
                  className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateSupplier}
                  disabled={creatingSupplier || !newSupplierName.trim()}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingSupplier ? 'Creating...' : 'Create Supplier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Asset Type Modal */}
      {showCreateAssetType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-green-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Create New Asset Type</h2>
              </div>
            </div>
            <div className="p-6">
              {createError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {createError}
                </div>
              )}
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Asset Type Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAssetTypeName}
                    onChange={(e) => setNewAssetTypeName(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Please enter asset type name"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newAssetTypeCategoryId}
                    onChange={(e) => setNewAssetTypeCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAssetType(false)
                    setNewAssetTypeName('')
                    setNewAssetTypeCategoryId('')
                    setCreateError(null)
                  }}
                  className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateAssetType}
                  disabled={creatingAssetType || !newAssetTypeName.trim() || !newAssetTypeCategoryId}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingAssetType ? 'Creating...' : 'Create Asset Type'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-green-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Create New Invoice</h2>
              </div>
            </div>
            <div className="p-6">
              {createError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {createError}
                </div>
              )}
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newInvoiceNumber}
                    onChange={(e) => setNewInvoiceNumber(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Please enter invoice number"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newInvoiceDate}
                    onChange={(e) => setNewInvoiceDate(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Total Amount</label>
                  <input
                    type="number"
                    value={newInvoiceTotalAmount}
                    onChange={(e) => setNewInvoiceTotalAmount(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Please enter total amount"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={newInvoiceDescription}
                    onChange={(e) => setNewInvoiceDescription(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Please enter description"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateInvoice(false)
                    setNewInvoiceNumber('')
                    setNewInvoiceDate('')
                    setNewInvoiceTotalAmount('')
                    setNewInvoiceDescription('')
                    setCreateError(null)
                  }}
                  className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateInvoice}
                  disabled={creatingInvoice || !newInvoiceNumber.trim()}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingInvoice ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Type Modal */}
      {showAssetTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingAssetType ? 'Edit Asset Type' : 'Add Asset Type'}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={assetTypeFormData.name} onChange={(e) => setAssetTypeFormData({ ...assetTypeFormData, name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Please enter asset type name" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category <span className="text-red-500">*</span></label>
                  <select value={assetTypeFormData.categoryId} onChange={(e) => setAssetTypeFormData({ ...assetTypeFormData, categoryId: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Please select category</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button onClick={() => { setShowAssetTypeModal(false); setEditingAssetType(null); setAssetTypeFormData({ name: '', categoryId: '' }) }} className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">Cancel</button>
                <button onClick={editingAssetType ? handleUpdateAssetType : handleAddAssetType} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">{editingAssetType ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Status Modal */}
      {showAssetStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingStatus ? 'Edit Asset Status' : 'Add Asset Status'}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status <span className="text-red-500">*</span></label>
                  <input type="text" value={statusFormData.status} onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Please enter status" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea value={statusFormData.description} onChange={(e) => setStatusFormData({ ...statusFormData, description: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Please enter description" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Asset <span className="text-red-500">*</span></label>
                  <select value={statusFormData.assetId} onChange={(e) => setStatusFormData({ ...statusFormData, assetId: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Please select asset</option>
                    {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button onClick={() => { setShowAssetStatusModal(false); setEditingStatus(null); setStatusFormData({ status: '', description: '', assetId: '' }) }} className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">Cancel</button>
                <button onClick={editingStatus ? handleUpdateStatus : handleAddStatus} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">{editingStatus ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status History Modal */}
      {showStatusHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingHistory ? 'Edit Status History' : 'Add Status History'}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={historyFormData.name} onChange={(e) => setHistoryFormData({ ...historyFormData, name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Please enter history name" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Asset <span className="text-red-500">*</span></label>
                  <select value={historyFormData.assetId} onChange={(e) => setHistoryFormData({ ...historyFormData, assetId: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Please select asset</option>
                    {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button onClick={() => { setShowStatusHistoryModal(false); setEditingHistory(null); setHistoryFormData({ name: '', assetId: '' }) }} className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">Cancel</button>
                <button onClick={editingHistory ? handleUpdateHistory : handleAddHistory} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">{editingHistory ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Ownership Modal */}
      {showOwnershipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingOwnership ? 'Edit Asset Ownership' : 'Add Asset Ownership'}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={ownershipFormData.name} onChange={(e) => setOwnershipFormData({ ...ownershipFormData, name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Please enter ownership name" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Asset <span className="text-red-500">*</span></label>
                  <select value={ownershipFormData.assetId} onChange={(e) => setOwnershipFormData({ ...ownershipFormData, assetId: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Please select asset</option>
                    {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Owner <span className="text-red-500">*</span></label>
                  <select value={ownershipFormData.ownerId} onChange={(e) => setOwnershipFormData({ ...ownershipFormData, ownerId: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Please select owner</option>
                    {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button onClick={() => { setShowOwnershipModal(false); setEditingOwnership(null); setOwnershipFormData({ name: '', assetId: '', ownerId: '' }) }} className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">Cancel</button>
                <button onClick={editingOwnership ? handleUpdateOwnership : handleAddOwnership} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">{editingOwnership ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modals */}
      {showDeleteAssetTypeModal && deletingAssetType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Asset Type</h2>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete "{deletingAssetType.name}"?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowDeleteAssetTypeModal(false); setDeletingAssetType(null) }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDeleteAssetType} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteStatusModal && deletingStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Asset Status</h2>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete this status?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowDeleteStatusModal(false); setDeletingStatus(null) }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDeleteStatus} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteHistoryModal && deletingHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Status History</h2>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete "{deletingHistory.name}"?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowDeleteHistoryModal(false); setDeletingHistory(null) }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDeleteHistory} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteOwnershipModal && deletingOwnership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Asset Ownership</h2>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete "{deletingOwnership.name}"?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowDeleteOwnershipModal(false); setDeletingOwnership(null) }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDeleteOwnership} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

