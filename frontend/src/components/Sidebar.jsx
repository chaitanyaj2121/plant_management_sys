import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Plant", path: "/plant" },
    { name: "Department", path: "/department" },
    { name: "Work Center", path: "/work-center" },
    { name: "Cost Center", path: "/cost-center" },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col">
      <div className="px-6 py-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          Dashboard
        </h2>
        <p className="text-sm text-gray-500 mt-1">Management Panel</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
        © 2026 Your Company
      </div>
    </aside>
  );
};

export default Sidebar;
