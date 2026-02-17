import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Plant", path: "/plant" },
    { name: "Department", path: "/department" },
    { name: "Work Culture", path: "/work-culture" },
    { name: "Cost Center", path: "/cost-center" },
  ];

  return (
    <div className="w-56 h-screen bg-gray-100 border-r border-gray-300 p-5">
      <h3 className="text-xl font-semibold mb-6">Menu</h3>

      <nav className="flex flex-col gap-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-2 rounded-md transition 
              ${
                location.pathname === item.path
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
