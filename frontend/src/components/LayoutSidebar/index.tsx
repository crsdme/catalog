import {
  Banknote,
  BarChart3,
  ChevronsUpDown,
  FileText,
  Globe,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Users,
  Warehouse,
} from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { LogoIcon, Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenuButton, SidebarRail } from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { NAV_MENU_ITEMS } from '@/utils/constants'

import { hasPermission } from '@/utils/helpers/permission'
import { NavMain } from './navMain'
import { NavUser } from './navUser'

const SIDEMENU_ICONS = {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  MessageSquare,
  ListChecks,
  BarChart3,
  Tag,
  Warehouse,
  Banknote,
  Globe,
  Settings,
  FileText,
  ChevronsUpDown,
}

export function LayoutSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()

  const authContext = useAuthContext()

  const user = authContext.user || {
    name: '',
    login: '',
  }

  const data = {
    user: {
      name: user.name,
      login: user.login,
    },
    navMain: parseNavItems(NAV_MENU_ITEMS, t),
  }

  data.navMain = sidebarPermission(data.navMain, authContext.permissions)

  function parseNavItems(items: any, t: any) {
    return items.map((item: any) => {
      const icon = item.icon && SIDEMENU_ICONS[item.icon as keyof typeof SIDEMENU_ICONS]
      return {
        ...item,
        title: t(`component.sidemenu.label.${item.id}`),
        icon,
        items: item.items ? parseNavItems(item.items, t) : undefined,
      }
    })
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
            <LogoIcon className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Catalog</span>
            <span className="truncate text-xs">Template</span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function sidebarPermission(items: any, permissions: any) {
  return items
    .map((item: any) => {
      const hasAccess = hasPermission(permissions, item.permissions || [])

      let children = item.items || undefined
      if (children?.length > 0) {
        children = sidebarPermission(children, permissions)
      }

      if (hasAccess || children?.length > 0) {
        return { ...item, items: children }
      }

      return null
    })
    .filter(Boolean)
}
