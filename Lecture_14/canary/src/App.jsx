import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Main from "./components/Main";
import About from "./components/About";
import Login from "./components/Login";
import HomePage from "./pages/HomePage";
import PageNotFound from "./pages/PageNotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate replace to="app" />} />
        <Route path="/" element={<HomePage />}>
          <Route index element={<Navigate replace to="app" />} />
          <Route path="app" element={<Main />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
