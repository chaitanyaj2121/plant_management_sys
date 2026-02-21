import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthUser } from "../api/client";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const loggedInUserName = authUser?.name || "User";

  const menuItems = [
    { name: "Plant", path: "/plant" },
    { name: "Department", path: "/department" },
    { name: "Work Center", path: "/work-center" },
    { name: "Cost Center", path: "/cost-center" },
  ];

  return (
    <aside className="sticky top-0 h-screen w-52 shrink-0 border-r border-gray-200 bg-white shadow-sm">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-5">
          <h2 className="text-lg font-semibold tracking-tight text-gray-800">
            Dashboard
          </h2>
          <p className="mt-1 text-xs text-gray-500">Management Panel</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-xs font-medium text-gray-700 truncate" title={loggedInUserName}>
            {loggedInUserName}
          </p>
          <button
            type="button"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
            onClick={() => {
              clearAuthSession();
              navigate("/login", { replace: true });
              window.location.assign("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
