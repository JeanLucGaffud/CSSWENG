import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    default:
      redirect("/login");
  }
}
