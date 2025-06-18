import {NavLink} from "react-router-dom";

const navItems = [
  {label: "Notes", path: "/notes"},
  {label: "Shared with Me", path: "/shared"},
  {label: "Attachments", path: "/attachments"},
  {label: "Trash", path: "/trash"},
];

export function Sidebar() {
  return (
    <aside className="w-80 p-4 flex flex-col justify-between border-r border-[var(--border)]">
      <div className="flex flex-col gap-2">
        {navItems.map(({label, path}) => (
          <NavLink
            key={label}
            to={path}
            className={({isActive}) => `nav-item ${isActive ? "active" : ""} hover-elevate`}
          >
            <div className="w-5 h-5 bg-white rounded-full"/>
            {/* Replace with actual icons */}
            <p className="text-sm font-medium">{label}</p>
          </NavLink>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <button className="btn">New Note</button>
          {/* ... Settings link ... */}
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-5 h-5 bg-white rounded-full"/>
          <p className="text-sm font-medium">Settings</p>
        </div>
      </div>
    </aside>
  );
}