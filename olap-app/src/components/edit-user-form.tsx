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
  onCancel?: () => void
  onSaved?: (updated: Record<string, unknown>) => void
  className?: string
}

export default function EditUserForm({ user, onCancel = () => {}, onSaved = () => {}, className, }: Props) {
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState<string>("")
  const [saving, setSaving] = useState(false)

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const payload: Record<string, any> = {
        id: user.id,
        username,
        firstName,
        lastName,
        dateOfBirth,
        gender,
      }

      const res = await fetch(`/api/table-users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Update failed")
      const updated = await res.json()
      onSaved(updated)
    } catch (err) {
      console.error(err)
      alert("Failed to update user")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}>
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <form onSubmit={handleSubmit} className="relative z-10 w-[95%] max-w-3xl rounded bg-white p-6 shadow-lg">
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Editing User Details</h1>
            <p className="text-muted-foreground text-sm text-balance">Currently editing details for user: {username}</p>
          </div>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input id="username" type="text" placeholder="ex. omsimnida67" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="firstName">Full Name</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input id="firstName" type="text" placeholder="First Name" required className="w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input id="lastName" type="text" placeholder="Last Name" required className="w-full" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
            <Input id="dateOfBirth" type="date" placeholder="MM/DD/YYYY" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline"></a>
            </div>
            <div>
              <input name="gender" value={gender} readOnly hidden />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">{gender || "Select gender"}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onSelect={() => setGender("Male")}>Male</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setGender("Female")}>Female</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Field>

          <Field>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Update Account Details"}</Button>
            <FieldSeparator />
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
