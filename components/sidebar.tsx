"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import {
  LayoutDashboard,
  Car,
  Users,
  Wrench,
  MapPin,
  Bell,
  MapIcon,
  Fuel,
  Calendar,
  BarChart2,
  FileText,
  CheckSquare,
  Settings,
  LogOut,
  Truck,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Contexto do Sidebar
type SidebarContextType = {
  isOpen: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  // Fechar sidebar automaticamente em telas pequenas
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>{children}</SidebarContext.Provider>
}

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen } = useSidebar()

  if (!isOpen) {
    return null
  }

  return (
    <div className="w-60 h-full bg-white border-r flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <Truck className="h-6 w-6 text-emerald-600" />
        <h1 className="text-lg font-semibold text-emerald-600">Frota Leste</h1>
      </div>

      <div className="flex flex-col flex-1">
        <div className="p-2">
          <h2 className="text-xs font-semibold text-gray-500 px-3 py-2">Principal</h2>
          <nav className="space-y-1">
            <NavItem href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" active={pathname === "/"} />
            <NavItem
              href="/veiculos"
              icon={<Car size={18} />}
              label="Veículos"
              count={15}
              active={pathname.startsWith("/veiculos")}
            />
            <NavItem
              href="/motoristas"
              icon={<Users size={18} />}
              label="Motoristas"
              count={23}
              active={pathname.startsWith("/motoristas")}
            />
            <NavItem
              href="/manutencao"
              icon={<Wrench size={18} />}
              label="Manutenção"
              count={2}
              active={pathname.startsWith("/manutencao")}
            />
            <NavItem href="/rotas" icon={<MapPin size={18} />} label="Rotas" active={pathname.startsWith("/rotas")} />
            <NavItem
              href="/alertas"
              icon={<Bell size={18} />}
              label="Alertas"
              count={3}
              active={pathname.startsWith("/alertas")}
            />
          </nav>
        </div>

        <div className="p-2">
          <h2 className="text-xs font-semibold text-gray-500 px-3 py-2">Monitoramento</h2>
          <nav className="space-y-1">
            <NavItem
              href="/localizacao"
              icon={<MapIcon size={18} />}
              label="Localização"
              active={pathname.startsWith("/localizacao")}
            />
            <NavItem
              href="/combustivel"
              icon={<Fuel size={18} />}
              label="Combustível"
              active={pathname.startsWith("/combustivel")}
            />
            <NavItem
              href="/agendamentos"
              icon={<Calendar size={18} />}
              label="Agendamentos"
              active={pathname.startsWith("/agendamentos")}
            />
          </nav>
        </div>

        <div className="p-2">
          <h2 className="text-xs font-semibold text-gray-500 px-3 py-2">Relatórios</h2>
          <nav className="space-y-1">
            <NavItem
              href="/estatisticas"
              icon={<BarChart2 size={18} />}
              label="Estatísticas"
              active={pathname.startsWith("/estatisticas")}
            />
            <NavItem
              href="/documentos"
              icon={<FileText size={18} />}
              label="Documentos"
              active={pathname.startsWith("/documentos")}
            />
            <NavItem
              href="/checklists"
              icon={<CheckSquare size={18} />}
              label="Checklists"
              active={pathname.startsWith("/checklists")}
            />
          </nav>
        </div>

        <div className="mt-auto p-2">
          <nav className="space-y-1">
            <NavItem
              href="/configuracoes"
              icon={<Settings size={18} />}
              label="Configurações"
              active={pathname.startsWith("/configuracoes")}
            />
            <NavItem href="/sair" icon={<LogOut size={18} />} label="Sair" active={pathname.startsWith("/sair")} />
          </nav>
        </div>
      </div>

      <div className="p-4 border-t flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <Users size={16} className="text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-medium">Admin</p>
          <p className="text-xs text-gray-500">Supervisor</p>
        </div>
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  count?: number
  active?: boolean
}

function NavItem({ href, icon, label, count, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-2 rounded-md ${
        active ? "bg-emerald-50 text-emerald-600" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-emerald-600" : "text-gray-500"}>{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      {count !== undefined && <span className="text-xs text-gray-500">{count}</span>}
    </Link>
  )
}
