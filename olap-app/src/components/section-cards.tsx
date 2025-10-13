import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type BadgeVariant = "outline" | "secondary" | "default" | "destructive" | undefined

type SectionCardItem = {
  title: string
  value: React.ReactNode
  badge?: {
    children: React.ReactNode
    variant?: BadgeVariant
  }
  footerTitle?: React.ReactNode
  footerSubtitle?: React.ReactNode
}

interface SectionCardsProps {
  items?: SectionCardItem[]
  children?: React.ReactNode
  className?: string
}

function renderCard(item: SectionCardItem, index: number) {
  return (
    <Card className="@container/card" key={index}>
      <CardHeader>
        <CardDescription>{item.title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {item.value}
        </CardTitle>
        {item.badge ? (
          <CardAction>
            <Badge variant={item.badge.variant ?? "outline"}>
              {item.badge.children}
            </Badge>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {item.footerTitle}
        </div>
        {item.footerSubtitle ? (
          <div className="text-muted-foreground">{item.footerSubtitle}</div>
        ) : null}
      </CardFooter>
    </Card>
  )
}

const defaultItems: SectionCardItem[] = [
  {
    title: "Total Revenue",
    value: "$1,250.00",
    badge: { children: <>
      <IconTrendingUp />
      +12.5%
    </>, variant: "outline" },
    footerTitle: <>Trending up this month <IconTrendingUp className="size-4" /></>,
    footerSubtitle: "Visitors for the last 6 months",
  },
  {
    title: "New Customers",
    value: "1,234",
    badge: { children: <>
      <IconTrendingDown />
      -20%
    </>, variant: "outline" },
    footerTitle: <>Down 20% this period <IconTrendingDown className="size-4" /></>,
    footerSubtitle: "Acquisition needs attention",
  },
  {
    title: "Active Accounts",
    value: "45,678",
    badge: { children: <>
      <IconTrendingUp />
      +12.5%
    </>, variant: "outline" },
    footerTitle: <>Strong user retention <IconTrendingUp className="size-4" /></>,
    footerSubtitle: "Engagement exceed targets",
  },
  {
    title: "Growth Rate",
    value: "4.5%",
    badge: { children: <>
      <IconTrendingUp />
      +4.5%
    </>, variant: "outline" },
    footerTitle: <>Steady performance increase <IconTrendingUp className="size-4" /></>,
    footerSubtitle: "Meets growth projections",
  },
]

export function SectionCards({ items, children, className = "" }: SectionCardsProps) {
  const content = items ?? defaultItems

  return (
    <div className={`${"*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4"} ${className}`}>
      {children ? (
        children
      ) : (
        content.map((item, i) => renderCard(item, i))
      )}
    </div>
  )
}
