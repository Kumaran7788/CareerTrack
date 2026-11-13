
import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Interviews from "./components/Interviews";
import Applications from "./components/Applications";
import Profile from "./components/Profile";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="flex">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="flex-1">
        {activePage === "dashboard" && <Dashboard />}

        {activePage === "applications" && (
          <div className="min-h-screen bg-gray-100 p-8">
            <Applications />
          </div>
        )}

        {activePage === "interviews" && (
          <div className="min-h-screen bg-gray-100 p-8">
            <Interviews />
          </div>
        )}

        {activePage === "profile" && <Profile />}
      </div>
    </div>
  );
}

export default App;
