import {useNavigate} from "react-router-dom";
import {useAuth} from "../features/AuthContext.tsx";
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {ThemeSwitchButton} from "./ThemeSwitch.tsx";
import {SearchField} from "./SearchField.tsx";

export function AppHeader() {
  const {logout} = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] px-10 py-3">
      <div className="flex items-center gap-4">
        <div className="text-green-500 font-bold text-xl">🔐 Vault</div>
      </div>

      <div className="flex gap-8 items-center">
        <SearchField
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
            </svg>
          }
          placeholder="Search notes..."
        />

        <ThemeSwitchButton className="flex-shrink-0"/>

        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="flex items-center gap-2">
            <div
              className="rounded-full size-10 bg-cover bg-center"
              style={{backgroundImage: "url('https://i.pravatar.cc/40')"}}
            />
          </MenuButton>

          <MenuItems
            className="absolute right-0 mt-2 w-40 origin-top-right bg-[var(--card-bg)] border border-[var(--border)] rounded shadow-md z-50 focus:outline-none">
            <div className="py-1">
              <MenuItem>
                {({focus}) => (
                  <button
                    className={`w-full text-left px-4 py-2 ${focus ? "bg-[var(--card-hover-bg)]" : ""}`}
                    onClick={() => navigate("/account")}
                  >
                    Account
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({focus}) => (
                  <button
                    className={`w-full text-left px-4 py-2 text-red-400 ${focus ? "bg-[var(--card-hover-bg)]" : ""}`}
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                  >Logout</button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
    </header>
  );
}