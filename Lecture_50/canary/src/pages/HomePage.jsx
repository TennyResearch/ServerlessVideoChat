import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Status from "../components/Status";

function HomePage() {
  return (
    <div className="grid h-screen grid-rows-[auto_1fr_auto]">
      <Header />
      <Outlet />
      <Status />
    </div>
  );
}

export default HomePage;
