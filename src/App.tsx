import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AMSDashboard } from './pages/AMSDashboard'
import { AssetList } from './pages/AssetList'
import { CategoryList } from './pages/CategoryList'
import { DepartmentList } from './pages/DepartmentList'
import { EmployeeList } from './pages/EmployeeList'
import { HRMSDashboard } from './pages/HRMSDashboard'
import { InvoiceList } from './pages/InvoiceList'
import { LocationList } from './pages/LocationList'
import { Login } from './pages/Login'
import { MaintainerList } from './pages/MaintainerList'
import { OwnerList } from './pages/OwnerList'
import { Register } from './pages/Register'
import { SupplierList } from './pages/SupplierList'
import { TemporaryUserList } from './pages/TemporaryUserList'
import { UserGuide } from './pages/UserGuide'

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <UserGuide />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <AMSDashboard />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/invoice"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <InvoiceList />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/category"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <CategoryList />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/asset-type"
        element={
          <ProtectedRoute>
            <Navigate to="/ams/asset" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/asset"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <AssetList />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/owner-type"
        element={
          <ProtectedRoute>
            <Navigate to="/ams/owner" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/owner"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <OwnerList />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/location"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <LocationList />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/supplier"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <SupplierList />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/maintainer-type"
        element={
          <ProtectedRoute>
            <Navigate to="/ams/maintainer" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/maintainer"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <MaintainerList />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/maintenance-record"
        element={
          <ProtectedRoute>
            <Navigate to="/ams/maintainer" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/asset-status"
        element={
          <ProtectedRoute>
            <Navigate to="/ams/asset" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ams/temporary-user"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <TemporaryUserList />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hrms"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <HRMSDashboard />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hrms/department"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <DepartmentList />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hrms/employee"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <EmployeeList />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/guide"
        element={
          <ProtectedRoute>
            <>
              <Header />
              <div className="pt-[73px]">
                <UserGuide />
              </div>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
