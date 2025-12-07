import { redirect } from "next/navigation"

export default function LandingAlias() {
  // Simple alias so /landing routes to the main landing page at /
  redirect("/")
}

