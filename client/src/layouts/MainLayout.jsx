import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="grow container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 min-w-0">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
