import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'
import Header    from './components/layout/Header'
import Footer    from './components/layout/Footer'
import BottomNav from './components/layout/BottomNav'

/* ─── Páginas públicas ─── */
import Home           from './pages/Home'
import Search         from './pages/Search'
import ListingDetail  from './pages/ListingDetail'
import Login          from './pages/Login'
import Register       from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import AuthCallback   from './pages/AuthCallback'
import SecurityGuide  from './pages/SecurityGuide'

/* ─── Páginas privadas ─── */
import Publish        from './pages/Publish'
import EditListing    from './pages/EditListing'
import MyListings     from './pages/MyListings'
import Profile        from './pages/Profile'

/* ─── Panel Admin ─── */
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminListings  from './pages/admin/AdminListings'
import AdminReports   from './pages/admin/AdminReports'
import AdminUsers     from './pages/admin/AdminUsers'
import AdminCities    from './pages/admin/AdminCities'

/* ─── 404 ─── */
import NotFound from './pages/NotFound'

/* Layout con Header + Footer + BottomNav */
function MainLayout() {
  return (
    <>
      <Header />
      <main className="page-wrapper">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ─── Rutas con layout principal ─── */}
            <Route element={<MainLayout />}>
              <Route path="/"       element={<Home />} />
              <Route path="/buscar" element={<Search />} />
              <Route path="/vivienda/:id" element={<ListingDetail />} />
              <Route path="/login"  element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/seguridad" element={<SecurityGuide />} />
              <Route path="/recuperar-contrasena" element={<ForgotPassword />} />

              {/* ─── Publicar vivienda (Acceso abierto a usuarios registrados y anónimos) ─── */}
              <Route path="/publicar" element={<Publish />} />
              <Route path="/editar/:id" element={
                <PrivateRoute><EditListing /></PrivateRoute>
              } />
              <Route path="/mis-publicaciones" element={
                <PrivateRoute><MyListings /></PrivateRoute>
              } />
              <Route path="/perfil" element={
                <PrivateRoute><Profile /></PrivateRoute>
              } />

              {/* ─── Rutas Admin ─── */}
              <Route path="/admin" element={
                <PrivateRoute requireAdmin><AdminDashboard /></PrivateRoute>
              } />
              <Route path="/admin/publicaciones" element={
                <PrivateRoute requireAdmin><AdminListings /></PrivateRoute>
              } />
              <Route path="/admin/reportes" element={
                <PrivateRoute requireAdmin><AdminReports /></PrivateRoute>
              } />
              <Route path="/admin/usuarios" element={
                <PrivateRoute requireAdmin><AdminUsers /></PrivateRoute>
              } />
              <Route path="/admin/ciudades" element={
                <PrivateRoute requireAdmin><AdminCities /></PrivateRoute>
              } />
            </Route>

            {/* OAuth callback — sin layout principal */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* ─── Rutas Dinámicas de Ciudades ─── */}
            <Route path="/:city" element={
              <MainLayout />
            }>
              <Route index element={<Home />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<MainLayout />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  )
}
