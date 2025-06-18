import {NavLink} from "react-router-dom";
import {Paperclip, Plus, Settings, StickyNote, Trash2, Users,} from "lucide-react";

const navItems = [
  {label: "Notes", path: "/", icon: <StickyNote size={20}/>},
  {label: "Shared with Me", path: "/shared", icon: <Users size={20}/>},
  {label: "Attachments", path: "/attachments", icon: <Paperclip size={20}/>},
  {label: "Trash", path: "/trash", icon: <Trash2 size={20}/>},
];

export function Sidebar() {
  return (
    <aside className="w-80 p-4 flex flex-col justify-between border-r border-[var(--border)]">
      <div className="flex flex-col gap-2">
        {
          navItems.map(
            ({label, path, icon}) => (
              <NavLink
                key={label}
                to={path}
                className={({isActive}) => `nav-item ${isActive ? "active" : ""} hover-elevate`}
              >
                {icon}
                <p className="text-sm font-medium">{label}</p>
              </NavLink>
            )
          )
        }
      </div>

      <div className="flex flex-col gap-4">
        <button className="btn flex items-center justify-center gap-2">
          <Plus size={18}/>
          New Note
        </button>

        <NavLink
          key='Settings'
          to={"/settings"}
          className={({isActive}) => `nav-item ${isActive ? "active" : ""} hover-elevate`}
        >
          <Settings size={20}/>
          <p className="text-sm font-medium">Settings</p>
        </NavLink>
      </div>
    </aside>
  );
}