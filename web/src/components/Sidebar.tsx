import { NavLink } from "react-router-dom";
import { Paperclip, Plus, Settings, StickyNote, Trash2, Users, X, } from "lucide-react";
import clsx from 'clsx';
import Logo from "./Logo.tsx";

const navItems = [
  { label: "Notes", path: "/", icon: <StickyNote size={ 20 }/> },
  { label: "Shared with Me", path: "/shared", icon: <Users size={ 20 }/> },
  { label: "Attachments", path: "/attachments", icon: <Paperclip size={ 20 }/> },
  { label: "Trash", path: "/trash", icon: <Trash2 size={ 20 }/> },
];

interface SidebarProps {
  className?: string;
  isDrawer?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar(
  {
    className,
    isDrawer = false,
    isOpen = false,
    onClose = () => {
    }
  }: SidebarProps
) {
  const sidebarClasses = clsx(
    "w-80 p-4 flex flex-col justify-between border-r border-[var(--border)] bg-[var(--background)]",
    // Base styles for the drawer functionality
    isDrawer && 'fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out',
    // Apply slide-in/out based on isOpen prop ONLY if it's a drawer
    isDrawer && (isOpen ? 'translate-x-0' : '-translate-x-full'),
    className,
  );
  return (
    <> {
      isDrawer && isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={ onClose }
        ></div>
      )
    }
      <aside className={ sidebarClasses }>
        <div>
          { isDrawer && <SidebarHeader onClose={ onClose }/> }

          {/* Navigation items */ }
          <div className="flex flex-col gap-2">
            {
              navItems.map(
                ({ label, path, icon }) => (
                  <NavLink
                    key={ label }
                    to={ path }
                    onClick={ onClose }
                    className={ ({ isActive }) => `nav-item ${ isActive ? "active" : "" } hover-elevate` }
                  >
                    { icon }
                    <p className="text-sm font-medium">{ label }</p>
                  </NavLink>
                )
              )
            }
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <NavLink
            key={ "NoteEditor" }
            to={ "notes/new" }
            onClick={ onClose }
          >
            <button className="btn flex items-center justify-center gap-2">
              <Plus size={ 20 }/>
              New Note
            </button>
          </NavLink>


          <NavLink
            key='Settings'
            to={ "/settings" }
            onClick={ onClose }
            className={ ({ isActive }) => `nav-item ${ isActive ? "active" : "" } hover-elevate` }
          >
            <Settings size={ 20 }/>
            <p className="text-sm font-medium">Settings</p>
          </NavLink>
        </div>
      </aside>
    </>
  );
}

function SidebarHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="grid grid-cols-3 items-center mb-4">

      <div className="justify-self-start">
        <button onClick={ onClose } className="p-1 btn-icon flex-shrink-0">
          <X size={ 24 }/>
        </button>
      </div>

      <div className="justify-self-center">
        <Logo/>
      </div>

      <div className="justify-self-end">
      </div>

    </div>
  );
}