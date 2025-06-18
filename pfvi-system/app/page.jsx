import LoginPage from "./login/page";
import HomeSecretary from './secretary/page';
import HomeDriver from './driver/page';
import HomeSalesman from './salesman/page';

export default async function Home() {
  return (
    <main>
      <HomeDriver />
    </main>
  );
}