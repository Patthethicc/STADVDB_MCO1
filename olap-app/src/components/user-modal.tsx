"use client"
import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  user?: Record<string, any>
  onClose?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export default function UserModal({ user, onClose = () => {}, onEdit = () => {}, onDelete = () => {}, className }: Props) {
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState<string>("")

  useEffect(() => {
    if (!user) return
    setUsername(user.username ?? "")
    setFirstName(user.firstName ?? user.first_name ?? "")
    setLastName(user.lastName ?? user.last_name ?? "")
    setDateOfBirth(user.dateOfBirth ?? user.date_of_birth ?? "")
    // accept M/F or full words
    const g = (user.gender ?? user.sex ?? "")
    setGender(g === "Male" || g === "M" ? "Male" : g === "Female" || g === "F" ? "Female" : g)
  }, [user])

  if (!user) return null

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[95%] max-w-3xl rounded bg-white p-6 shadow-lg">
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Viewing User Details</h1>
            <p className="text-muted-foreground text-sm text-balance">Currently viewing account details of user: {username}</p>
          </div>
          <Field>
            <FieldLabel>Username</FieldLabel>
            <div className="rounded px-3 py-2">{username}</div>
          </Field>

          <Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <FieldLabel>First Name</FieldLabel>
                <div className="rounded px-3 py-2">{firstName}</div>
              </div>
              <div>
                <FieldLabel>Last Name</FieldLabel>
                <div className="rounded px-3 py-2">{lastName}</div>
              </div>
            </div>
          </Field>

          <Field>
            <FieldLabel>Date of Birth</FieldLabel>
            <div className="rounded px-3 py-2">{dateOfBirth}</div>
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline"></a>
            </div>
            <div>
              <div className="rounded px-3 py-2">{gender || "Not specified"}</div>
            </div>
          </Field>

          <Field>
            <Button type="button" onClick={onEdit}>Edit</Button>
            <FieldSeparator />
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Close</Button>
              <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={onDelete}>Delete</Button>
            </div>
          </Field>
        </FieldGroup>
      </div>
    </div>
  )
}