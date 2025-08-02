import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "secretary":
      redirect("/secretary");
    case "driver":
      redirect("/driver");
    case "salesman":
      redirect("/salesman");
    case "admin":
      redirect("/admin");
    default:
      redirect("/login");
  }
}
