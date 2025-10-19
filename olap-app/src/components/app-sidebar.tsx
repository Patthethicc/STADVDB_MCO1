"use client"

import * as React from "react"
import { AudioWaveform, Calendar, GalleryVerticalEnd, MapPin, PackageSearch, User } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  teams: [
    {
      name: "Faker DB",
      logo: GalleryVerticalEnd,
      plan: "Database",
    },
  ],
  olap: [
    {
      title: "OLAP Processing",
      url: "#",
      icon: AudioWaveform,
      isActive: true,
      items: [
        {
          title: "Location-wise Sales",
          url: "/reports/olap/get_sales_by_location",
        },
        {
          title: "Overall Revenue",
          url: "/reports/olap/get_overall_revenue",
        },
        {
          title: "Gender-specific Sales",
          url: "/reports/olap/get_slice_gender",
        },
        {
          title: "Top Category per Location",
          url: "/reports/olap/get_top_category",
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
  <NavMain items={data.olap} />
  {/* <NavMain items={data.navMain} /> */}
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}



/*
  navMain: [
    {
      title: "Sales",
      url: "#",
      icon: AudioWaveform,
      isActive: true,
      items: [
        {
          title: "Location-wise",
          url: "/reports/sales/location-wise",
        },
        {
          title: "Time-wise",
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
          title: "Rank-wise",
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
*/