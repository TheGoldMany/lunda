import type { Role } from "../api/types";

export function roleHome(role: Role): string {
  switch (role) {
    case "CUSTOMER":
      return "/customer/requests";
    case "PROVIDER":
      return "/provider/dashboard";
    case "ADMIN":
      return "/admin/verifications";
  }
}
