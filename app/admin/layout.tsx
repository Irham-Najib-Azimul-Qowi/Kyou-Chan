import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await getAdminSession()
  
  if (!isAdmin) {
    redirect('/admin/login')
  }
  
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--void)' }}>
      <AdminSidebar />
      <main className="flex-1 ml-60 overflow-auto">
        {children}
      </main>
    </div>
  )
}
