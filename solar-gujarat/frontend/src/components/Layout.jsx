import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import WhatsAppButton from './WhatsAppButton.jsx'
import SkyBackdrop from './SkyBackdrop.jsx'
import ScrollToTop from './ScrollToTop.jsx'

// Shared shell: sky-panels background, Navbar, page content (Outlet), Footer,
// floating WhatsApp button. Wraps every route so the look stays consistent.
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* Fixed sky+panels backdrop behind all pages */}
      <div className="fixed inset-0 -z-10">
        <SkyBackdrop />
      </div>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
