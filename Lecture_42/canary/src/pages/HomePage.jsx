import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Status from "../components/Status";

function HomePage() {
  return (
    <div>
      <Header />
      <Outlet />
      <Status />
    </div>
  );
}

export default HomePage;
