import * as React from "react"

export default function Loading({
  className = "",
  message = "Loading...",
}: {
  className?: string
  message?: string
}) {
  return (
    <div className={`h-72 w-full rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-500 ${className}`}>
      {message}
    </div>
  )
}
