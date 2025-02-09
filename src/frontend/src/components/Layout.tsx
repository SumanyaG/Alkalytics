import { Outlet } from "react-router-dom";
import Sidebar from "./sidebars/Sidebar";

const Layout = () => {
  return (
    <>
      <div className="flex relative z-50">
        <Sidebar />
      </div>
      <main className="flex flex-col p-4 ml-16"><Outlet /></main>
    </>
  );
};

export default Layout;
