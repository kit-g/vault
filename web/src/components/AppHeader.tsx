import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/AuthContext.tsx";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ThemeSwitchButton } from "./ThemeSwitch.tsx";
import { MenuIcon } from "lucide-react";
import Logo from "./Logo.tsx";
import { SearchController } from "./Search.tsx";

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] px-10 py-3">
      <div className="flex items-center gap-4">
        <button onClick={ onMenuClick } className="lg:hidden p-1 btn-icon flex-shrink-0">
          <MenuIcon/>
        </button>
        <Logo className="hidden lg:block"/>
      </div>

      <div className="flex gap-8 items-center">
        <SearchController/>

        <ThemeSwitchButton className="flex-shrink-0"/>

        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="flex items-center gap-2">
            <div
              className="rounded-full size-10 bg-cover bg-center"
              style={ { backgroundImage: `url('${ user?.avatar_url || "https://i.pravatar.cc/40" }')` } }
            />
          </MenuButton>

          <MenuItems
            className="absolute right-0 mt-2 w-40 origin-top-right bg-[var(--card-bg)] border border-[var(--border)] rounded shadow-md z-50 focus:outline-none">
            <div className="py-1">
              <MenuItem>
                { ({ focus }) => (
                  <button
                    className={ `w-full text-left px-4 py-2 ${ focus ? "bg-[var(--card-hover-bg)]" : "" }` }
                    onClick={ () => navigate("/settings") }
                  >
                    Account
                  </button>
                ) }
              </MenuItem>
              <MenuItem>
                { ({ focus }) => (
                  <button
                    className={ `w-full text-left px-4 py-2 text-red-400 ${ focus ? "bg-[var(--card-hover-bg)]" : "" }` }
                    onClick={ () => {
                      logout();
                      navigate("/login");
                    } }
                  >Logout</button>
                ) }
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
    </header>
  );
}