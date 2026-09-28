import React from "react";
import Logo from "../assets/images/Group 1.png";
import { Link, NavLink, useLocation } from "react-router-dom";
import Profile from "../assets/images/Group 6.png";

const NavBar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="w-full border-b border-[#B8B6B6] bg-white px-6 py-3 md:px-20 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <img src={Logo} alt="TaskDuty" />
        <h3 className="font-semibold text-[27px] text-[#2D0050]">TaskDuty</h3>
      </Link>

      <div className="flex items-center gap-6">
        {isHome && (
          <NavLink to="/newtask">
            <h3 className="text-lg font-medium text-[#292929] hover:text-[#974FD0]">New Task</h3>
          </NavLink>
        )}
        <NavLink to="/mytasks">
          <h3 className="text-lg font-medium text-[#292929] hover:text-[#974FD0]">All Task</h3>
        </NavLink>
        <div className="relative">
          <img src={Profile} alt="Profile" className="h-12 w-12 rounded-full border-[3px] border-[#292929] object-cover" />
          <div className="absolute right-0 top-1 h-2.5 w-2.5 rounded-full bg-[#974FD0]" />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
