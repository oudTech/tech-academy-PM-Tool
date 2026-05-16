import { signOut } from "@/auth";

// Server component — runs on the server, clears the session cookie, redirects to /login.
// The browser never sees this page; it receives an immediate 307 to /login.
export default async function SignOutPage() {
  await signOut({ redirectTo: "/login" });
}
