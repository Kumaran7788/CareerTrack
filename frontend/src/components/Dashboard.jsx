
import { useEffect, useState } from "react";

function Dashboard() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    interviews: 0,
    selected: 0,
    rejected: 0
  });

  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [
          statsResponse,
          appResponse,
          interviewResponse
        ] = await Promise.all([
          fetch("http://localhost:5000/api/dashboard?user_id=1"),
          fetch("http://localhost:5000/api/applications"),
          fetch("http://localhost:5000/api/interviews")
        ]);

        if (
          !statsResponse.ok ||
          !appResponse.ok ||
          !interviewResponse.ok
        ) {
          throw new Error("Failed to fetch dashboard data");
        }

        const statsResult = await statsResponse.json();
        const appResult = await appResponse.json();
        const interviewResult = await interviewResponse.json();

        setStats(statsResult.data);

        // Recent Applications
        const recentApplications = (appResult.data || [])
        .sort(
            (a, b) =>
            new Date(b.applied_date) - new Date(a.applied_date)
        )
        .slice(0, 5);

        setApplications(recentApplications);

        // Recent Applications
        const upcomingInterviews = (interviewResult.data || [])
        .filter((interview) => interview.interview_date)
        .sort(
            (a, b) =>
            new Date(b.interview_date) - new Date(a.interview_date)
        )
        .slice(0, 3);

        setInterviews(upcomingInterviews);        

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    { title: "Total Applications", value: stats.totalApplications },
    { title: "Interviews", value: stats.interviews },
    { title: "Selected", value: stats.selected },
    { title: "Rejected", value: stats.rejected }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Selected":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Interview":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold text-gray-800">
        Welcome to CareerTrack!
      </h1>

      <p className="mt-2 text-gray-500">
        Track your job applications and interviews in one place.
      </p>

      {loading ? (
        <p className="mt-8">Loading dashboard...</p>
      ) : error ? (
        <p className="mt-8 text-red-500">{error}</p>
      ) : (
        <>

          {/* Dashboard Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            {cards.map((card) => (
              <div
                key={card.title}
                className="bg-white p-6 rounded-xl shadow"
              >
                <h2 className="text-gray-500">
                  {card.title}
                </h2>

                <p className="text-3xl font-bold mt-3">
                  {card.value ?? 0}
                </p>
              </div>
            ))}
          </div>


          {/* Recent Applications */}
          <div className="mt-10 bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Recent Applications
            </h2>

            {applications.length === 0 ? (
              <p className="text-gray-500">
                No applications found. Start adding applications!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">

                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="py-3">Company</th>
                      <th className="py-3">Job Role</th>
                      <th className="py-3">Applied Date</th>
                      <th className="py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((app) => (
                      <tr
                        key={app.application_id}
                        className="border-b last:border-0"
                      >
                        <td className="py-4 font-medium">
                          {app.company_name}
                        </td>

                        <td className="py-4 text-gray-600">
                          {app.job_role}
                        </td>

                        <td className="py-4 text-gray-600">
                          {app.applied_date
                            ? new Date(app.applied_date).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td className="py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${getStatusColor(app.status)}`}
                          >
                            {app.status || "Applied"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}

          </div>


          {/* Upcoming Interviews */}
          <div className="mt-8 bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Upcoming Interviews
            </h2>

            {interviews.length === 0 ? (
              <p className="text-gray-500">
                No upcoming interviews scheduled.
              </p>
            ) : (
              <div className="space-y-4">

                {interviews.map((interview) => (
                  <div
                    key={interview.interview_id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 last:border-0"
                  >

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {interview.company_name}
                      </h3>

                      <p className="text-gray-500 text-sm">
                        {interview.job_role} • {interview.interview_round}
                      </p>
                    </div>

                    <div className="mt-2 md:mt-0 text-sm text-blue-600 font-medium">
                      {new Date(interview.interview_date).toLocaleString()}
                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </>
      )}

    </div>
  );
}

export default Dashboard;
