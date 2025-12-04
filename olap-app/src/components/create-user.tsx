import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
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

export function CreateUser({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [gender, setGender] = useState<string>("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [address1, setAddress1] = useState("")
  const [address2, setAddress2] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [username, setUsername] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate date of birth year is 2006 or 2007
      const year = new Date(dateOfBirth).getFullYear()
      if (year !== 2006 && year !== 2007) {
        setError("Date of birth must be in year 2006 or 2007")
        setLoading(false)
        return
      }

      // Map gender to single letter format expected by backend
      const genderValue = gender === "Male" ? "M" : gender === "Female" ? "F" : ""
      
      if (!genderValue) {
        setError("Please select a gender")
        setLoading(false)
        return
      }

      // Convert date from YYYY-MM-DD to MM/DD/YYYY format expected by backend
      const convertDateFormat = (isoDate: string) => {
        const [year, month, day] = isoDate.split('-')
        return `${month}/${day}/${year}`
      }

      // Create a MySQL DATETIME string 'YYYY-MM-DD HH:MM:SS' for createdAt
      const getCurrentMysqlDatetime = () => {
        const dt = new Date()
        const pad = (n: number) => String(n).padStart(2, '0')
        const year = dt.getFullYear()
        const month = pad(dt.getMonth() + 1)
        const day = pad(dt.getDate())
        const hours = pad(dt.getHours())
        const minutes = pad(dt.getMinutes())
        const seconds = pad(dt.getSeconds())
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }

      const payload = {
        firstName,
        lastName,
        username,
        dateOfBirth: convertDateFormat(dateOfBirth),
        createdAt: getCurrentMysqlDatetime(),
        updatedAt: getCurrentMysqlDatetime(),
        gender: genderValue,
        address1,
        address2,
        city,
        country,
        zipCode,
        phoneNumber,
      }

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create user")
        return
      }

      setSuccess(`User created successfully! ID: ${data.data?.id}`)
      
      // Reset form
      setFirstName("")
      setLastName("")
      setDateOfBirth("")
      setGender("")
      setAddress1("")
      setAddress2("")
      setCity("")
      setCountry("")
      setZipCode("")
      setPhoneNumber("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create a new account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the following fields to create your account. Birth year must be 2006 or 2007.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            {success}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="firstName">Full Name</FieldLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input 
              id="firstName" 
              type="text" 
              placeholder="First Name" 
              required 
              className="w-full" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input 
              id="lastName" 
              type="text" 
              placeholder="Last Name" 
              required 
              className="w-full" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </Field>


        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input 
            id="username" 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="dateOfBirth">Date of Birth (2006 or 2007 only)</FieldLabel>
          <Input 
            id="dateOfBirth" 
            type="date" 
            placeholder="MM/DD/YYYY" 
            required 
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="gender">Gender</FieldLabel>
          <div>
            <input name="gender" value={gender} readOnly hidden />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between" type="button">
                  {gender || "Select gender"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onSelect={() => setGender("Male")}>Male</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setGender("Female")}>Female</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="address1">Address 1</FieldLabel>
          <Input 
            id="address1" 
            type="text" 
            placeholder="Street Address" 
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="address2">Address 2 (Optional)</FieldLabel>
          <Input 
            id="address2" 
            type="text" 
            placeholder="Apartment, suite, etc." 
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="city">City</FieldLabel>
          <Input 
            id="city" 
            type="text" 
            placeholder="City" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="country">Country</FieldLabel>
          <Input 
            id="country" 
            type="text" 
            placeholder="Country" 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="zipCode">Zip Code</FieldLabel>
          <Input 
            id="zipCode" 
            type="text" 
            placeholder="Zip Code" 
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
          <Input 
            id="phoneNumber" 
            type="tel" 
            placeholder="Phone Number" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </Field>

        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
