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

export function UpdateUser({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [userId, setUserId] = useState("")
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
  const [isolationLevel, setIsolationLevel] = useState<string>("READ COMMITTED")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userLoaded, setUserLoaded] = useState(false)

  const handleLoadUser = async () => {
    if (!userId) {
      setError("Please enter a user ID")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/users/${userId}`)
      
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "User not found")
        setUserLoaded(false)
        return
      }

      const user = await res.json()
      
      // Convert date from MM/DD/YYYY to YYYY-MM-DD for HTML date input
      const convertToISODate = (usDate: string) => {
        if (!usDate) return ""
        const [month, day, year] = usDate.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
      
      // Populate form with user data
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
      setDateOfBirth(convertToISODate(user.dateOfBirth) || "")
      setGender(user.gender === "M" ? "Male" : user.gender === "F" ? "Female" : "")
      setAddress1(user.address1 || "")
      setAddress2(user.address2 || "")
      setCity(user.city || "")
      setCountry(user.country || "")
      setZipCode(user.zipCode || "")
      setPhoneNumber(user.phoneNumber || "")
      setUserLoaded(true)
      setSuccess("User loaded successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user")
      setUserLoaded(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userLoaded) {
      setError("Please load a user first")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate date of birth year only if a date was provided
      if (dateOfBirth) {
        const year = new Date(dateOfBirth).getFullYear()
        if (year !== 2006 && year !== 2007) {
          setError("Date of birth must be in year 2006 or 2007")
          setLoading(false)
          return
        }
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

      const payload: Record<string, unknown> = {
        firstName,
        lastName,
        gender: genderValue,
        address1,
        address2,
        city,
        country,
        zipCode,
        phoneNumber,
      }

      // include dateOfBirth only if user changed/provided it
      if (dateOfBirth) {
        payload.dateOfBirth = convertDateFormat(dateOfBirth)
      }

      const res = await fetch(`/api/users/${userId}?isolation=${encodeURIComponent(isolationLevel)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to update user")
        return
      }

      setSuccess("User updated successfully!")
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
          <h1 className="text-2xl font-bold">Update existing account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Update existing account details. Birth year must remain 2006 or 2007.
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
          <FieldLabel htmlFor="userId">User ID</FieldLabel>
          <div className="flex gap-2">
            <Input 
              id="userId" 
              type="text" 
              placeholder="Enter user ID" 
              required 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={userLoaded}
            />
            <Button 
              type="button" 
              onClick={handleLoadUser}
              disabled={loading || userLoaded}
              variant="outline"
            >
              {userLoaded ? "Loaded" : "Load"}
            </Button>
          </div>
        </Field>

        {userLoaded && (
          <>
            <Field>
              <FieldLabel htmlFor="isolationLevel">Isolation Level</FieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" type="button">
                    {isolationLevel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-full">
                  <DropdownMenuItem onSelect={() => setIsolationLevel("READ UNCOMMITTED")}>
                    READ UNCOMMITTED
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setIsolationLevel("READ COMMITTED")}>
                    READ COMMITTED
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setIsolationLevel("REPEATABLE READ")}>
                    REPEATABLE READ
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setIsolationLevel("SERIALIZABLE")}>
                    SERIALIZABLE
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Field>

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
              <FieldLabel htmlFor="dateOfBirth">Date of Birth (2006 or 2007 only)</FieldLabel>
              <Input 
                id="dateOfBirth" 
                type="date" 
                placeholder="MM/DD/YYYY" 
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
                {loading ? "Updating..." : "Update Account Details"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setUserLoaded(false)
                  setUserId("")
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
                  setError(null)
                  setSuccess(null)
                }}
                className="mt-2"
              >
                Load Different User
              </Button>
            </Field>
          </>
        )}
      </FieldGroup>
    </form>
  )
}

export default UpdateUser
