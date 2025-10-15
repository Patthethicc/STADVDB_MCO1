"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Calendar,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  MapPin,
  PackageSearch,
  PieChart,
  Settings2,
  SquareTerminal,
  User,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Faker DB",
      logo: GalleryVerticalEnd,
      plan: "Database",
    },
  ],
  navMain: [
    {
      title: "Sales",
      url: "#",
      icon: AudioWaveform,
      isActive: true,
      items: [
        {
          title: "Location-wise", // barchart, tabular
          url: "/reports/sales/location-wise",
        },
        {
          title: "Time-wise", // 
          url: "/reports/sales/time-wise",
        },
        {
          title: "Gender-wise",
          url: "/reports/sales/gender-wise",
        },
        {
          title: "Age-wise",
          url: "/reports/sales/age-wise",
        },
      ],
    },
    {
      title: "Products",
      url: "#",
      icon: AudioWaveform,
      isActive: true,
      items: [
        {
          title: "Rank-wise", // barchart, tabular
          url: "/reports/products/rank-based",
        },
        {
          title: "Category-wise",
          url: "/reports/products/category-wise",
        },
        {
          title: "Location-wise",
          url: "/reports/products/location-wise",
        },
        {
          title: "Gender-wise",
          url: "/reports/products/gender-wise",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Products",
      url: "/reports/table/products",
      icon: PackageSearch,
    },
    {
      name: "Users",
      url: "/reports/table/users",
      icon: User,
    },
    {
      name: "Date",
      url: "/reports/table/date",
      icon: Calendar,
    },
    {
      name: "Location",
      url: "/reports/table/location",
      icon: MapPin,
    },
    {
      name: "FactSales",
      url: "/reports/table/factsales",
      icon: MapPin,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
