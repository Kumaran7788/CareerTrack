
function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { icon: "🏠", name: "Dashboard", page: "dashboard" },
    { icon: "📄", name: "My Applications", page: "applications" },
    { icon: "📅", name: "Interviews", page: "interviews" },
    { icon: "👤", name: "Profile", page: "profile" }
  ];

  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-10">
        CareerTrack
      </h1>

      <nav className="space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.page}
            onClick={() => setActivePage(item.page)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${
              activePage === item.page
                ? "bg-blue-600"
                : "hover:bg-slate-700"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="mt-16 border-t border-slate-700 pt-6">
        <button className="text-red-400 hover:text-red-300">
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
