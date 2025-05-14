import { Outlet } from "react-router-dom";
import Header from "../components/Header";

function HomePage() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}

export default HomePage;
