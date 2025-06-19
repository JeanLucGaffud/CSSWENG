import LoginPage from "./login/page";
import HomeSecretary from './secretary/page';
import HomeDriver from './driver/page';
import HomeSalesman from './salesman/page';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <LoginPage />
  }

  switch (session.user.role) {
    case "secretary":
      return <HomeSecretary />;
    case "driver":
      return <HomeDriver />;
    case "salesman":
      return <HomeSalesman />;
    default:
      return <LoginPage />;
  }
}