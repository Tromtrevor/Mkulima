import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./sidebar.css"; // Fixed path - assuming same directory
import {
  NotebookText,
  MapPin,
  MessageCircleQuestionMark,
  LogOut,
  BookText,
  Menu,
  X,
  Info,
  Bell,
} from "lucide-react";

const IMAGES = {
  profile: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  //logo: "https://cdn-icons-png.flaticon.com/512/3318/3318703.png",
};

const SidebarMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { icon: <Bell className="w-5 h-4" />, label: "Notifications", path: "/notifications" },
    { icon: <BookText className="w-5 h-4" />, label: "Reports", path: "/report" },
    { icon: <Info className="w-5 h-4" />, label: "Information", path: "/information" },
    { icon: <MapPin className="w-5 h-4" />, label: "AgroMap", path: "/agromap" },
    { icon: <NotebookText className="w-5 h-4" />, label: "About Us", path: "/about-us" },
    { icon: <MessageCircleQuestionMark className="w-5 h-4" />, label: "FAQ", path: "/faq" },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <>
      {/* Hamburger toggle (mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-green-600 text-white p-2 rounded-lg shadow-lg focus:outline-none hover:bg-green-700 transition-all"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-green-100 to-yellow-100 shadow-lg flex flex-col transition-all duration-500 z-40
          ${isOpen ? "w-64" : "w-0 overflow-hidden"}
          lg:w-64 lg:static`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 p-5 border-b border-green-200">
          {isOpen && (
            <h1 className="text-green-700 font-extrabold text-xl tracking-wide">
              MKULIMA
            </h1>
          )}
        </div>

        {/* Profile */}
        {isOpen && (
          <div className="flex flex-col items-center mt-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-green-600 shadow-md hover:scale-105 transition-transform duration-300">
              <img
                src={IMAGES.profile}
                alt="User"
                className="object-cover w-full h-full"
              />
            </div>
            <p
              onClick={() => navigate("/dashboard")}
              className="mt-3 text-green-700 font-semibold text-sm hover:underline cursor-pointer"
            >
              View Profile
            </p>
          </div>
        )}

        {/* Menu */}
        <div className="mt-10 flex flex-col space-y-2 px-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="menu-item flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer text-gray-700 hover:bg-green-200 hover:text-green-800 transition-all duration-200"
            >
              {item.icon}
              {isOpen && <span className="font-medium">{item.label}</span>}
            </div>
          ))}
        </div>

        {/* Logout */}
        <div
          onClick={handleLogout}
          className="mt-auto mb-6 mx-6 py-2 px-3 flex items-center gap-2 cursor-pointer text-red-600 font-semibold hover:bg-red-100 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span>Log Out</span>}
        </div>

        {/* Footer */}
        {isOpen && (
          <div className="text-center text-green-700 font-bold text-sm mb-4">
            © 2025 MKULIMA
          </div>
        )}
      </div>
    </>
  );
};

export default SidebarMenu;