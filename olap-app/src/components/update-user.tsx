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
  const [gender, setGender] = useState<string>("")
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Update existing account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Update existing account details.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input id="username" type="text" placeholder="ex. omsimnida67" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="firstName">Full Name</FieldLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input id="firstName" type="text" placeholder="First Name" required className="w-full" />
            <Input id="lastName" type="text" placeholder="Last Name" required className="w-full" />
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
          <Input id="dateOfBirth" type="date" placeholder="MM/DD/YYYY" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="gender">Gender</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
            </a>
          </div>
          <div>
            <input name="gender" value={gender} readOnly hidden />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
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
          <Button type="submit">Update Account Details</Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default UpdateUser
