import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../features/AuthContext.tsx";
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {ThemeSwitchButton} from "./ThemeSwitch.tsx";

export function DashboardLayout({children}: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const {logout} = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between border-b border-[#2a4133] px-10 py-3">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="text-green-500 font-bold text-xl">🔐 Vault</div>
        </div>

        <div className="flex gap-8 items-center">
          {/* Search */}
          <div className="flex h-10 max-w-64 rounded-xl bg-[#2a4133] overflow-hidden">
            <div className="flex items-center justify-center pl-4 pr-2 text-[#9bbfa9]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path
                  d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
              </svg>
            </div>
            <input
              placeholder="Search"
              className="bg-[#2a4133] text-white placeholder:text-[#9bbfa9] px-4 w-full outline-none"
            />
          </div>

          <ThemeSwitchButton/>
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="flex items-center gap-2">
              <div
                className="rounded-full size-10 bg-cover bg-center bg-no-repeat cursor-pointer"
                style={{backgroundImage: "url('https://i.pravatar.cc/40')"}}
              />
              <svg
                className="w-4 h-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </MenuButton>

            <MenuItems
              className="absolute right-0 mt-2 w-40 origin-top-right bg-[#1d2b24] border border-[#2a4133] rounded shadow-md z-50 focus:outline-none">
              <div className="py-1">
                <MenuItem>
                  {({focus}) => (
                    <button
                      className={`w-full text-left px-4 py-2 ${focus ? "bg-[#27352d]" : ""}`}
                      onClick={() => navigate("/account")}
                    >
                      Account
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({focus}) => (
                    <button
                      className={`w-full text-left px-4 py-2 text-red-400 ${focus ? "bg-[#27352d]" : ""}`}
                      onClick={() => {
                        logout();
                        navigate("/login");
                      }}
                    >
                      Logout
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-80 p-4 flex flex-col justify-between border-r border-[#2a4133]">
          <div className="flex flex-col gap-2">
            {["Notes", "Shared with Me", "Attachments", "Trash"].map((label) => (
              <div key={label} className="flex items-center gap-3 px-3 py-2 rounded-full bg-[#2a4133]">
                <div className="w-5 h-5 bg-white rounded-full"/>
                <p className="text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button className="rounded-full h-10 px-4 bg-[#94e0b1] text-[#141f18] font-bold">
              New Note
            </button>
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-5 h-5 bg-white rounded-full"/>
              <p className="text-sm font-medium">Settings</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
