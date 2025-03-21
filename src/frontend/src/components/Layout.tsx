import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";

const Layout = () => {
  return (
    <>
      <div className="flex relative z-50">
        <Sidebar />
      </div>
      <main className="ml-16"><Outlet /></main>
    </>
  );
};

export default Layout;
