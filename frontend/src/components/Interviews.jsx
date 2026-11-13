
import { useEffect, useState } from "react";

function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    application_id: "",
    interview_date: "",
    interview_round: "",
    result: "Pending"
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch all interviews
  const fetchInterviews = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/interviews"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      const data = await response.json();
      setInterviews(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications for dropdown
  const fetchApplications = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/applications"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInterviews();
    fetchApplications();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      application_id: "",
      interview_date: "",
      interview_round: "",
      result: "Pending"
    });

    setEditingId(null);
  };

  // Add or Update interview
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const url = editingId
        ? `http://localhost:5000/api/interviews/${editingId}`
        : "http://localhost:5000/api/interviews";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          interview_date: form.interview_date.replace("T", " ")
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save interview"
        );
      }

      setMessage(
        editingId
          ? "Interview updated successfully!"
          : "Interview scheduled successfully!"
      );

      resetForm();
      fetchInterviews();

    } catch (err) {
      setError(err.message);
    }
  };

  // Edit interview
  const handleEdit = (interview) => {
    setEditingId(interview.interview_id);

    setForm({
      application_id: String(interview.application_id),
      interview_date: interview.interview_date
        ? new Date(interview.interview_date)
            .toISOString()
            .slice(0, 16)
        : "",
      interview_round: interview.interview_round || "",
      result: interview.result || "Pending"
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Delete interview
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this interview?"
    );

    if (!confirmDelete) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/interviews/${id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete interview"
        );
      }

      setMessage("Interview deleted successfully!");
      fetchInterviews();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold text-gray-800">
        Interview Management
      </h1>

      <p className="text-gray-500 mt-2">
        Track and manage your interviews.
      </p>

      {/* Add / Edit Interview Form */}

      <div className="bg-white rounded-xl shadow mt-8 p-6">

        <h2 className="text-xl font-semibold mb-6">
          {editingId ? "Edit Interview" : "Schedule New Interview"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >

          <div>
            <label className="block mb-2 font-medium">
              Select Application
            </label>

            <select
              name="application_id"
              value={form.application_id}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
            >
              <option value="">Select an application</option>

              {applications.map((app) => (
                <option
                  key={app.application_id}
                  value={app.application_id}
                >
                  {app.company_name} - {app.job_role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Interview Date & Time
            </label>

            <input
              type="datetime-local"
              name="interview_date"
              value={form.interview_date}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Interview Round
            </label>

            <select
              name="interview_round"
              value={form.interview_round}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
            >
              <option value="">Select round</option>
              <option value="Aptitude">Aptitude</option>
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
              <option value="Managerial">Managerial</option>
              <option value="Final">Final Round</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Result
            </label>

            <select
              name="result"
              value={form.result}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="Pending">Pending</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="md:col-span-2 flex gap-3">

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              {editingId ? "Update Interview" : "Schedule Interview"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            )}

          </div>

        </form>

        {message && (
          <p className="text-green-600 mt-4">
            {message}
          </p>
        )}

        {error && (
          <p className="text-red-500 mt-4">
            {error}
          </p>
        )}

      </div>

      {/* Interview Table */}

      <div className="bg-white rounded-xl shadow mt-8 p-6">

        <h2 className="text-xl font-semibold mb-6">
          All Interviews
        </h2>

        {loading ? (
          <p>Loading interviews...</p>
        ) : interviews.length === 0 ? (
          <p className="text-gray-500">
            No interviews found. Schedule your first interview!
          </p>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b text-gray-500">
                  <th className="p-3">ID</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Job Role</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Round</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {interviews.map((interview) => (

                  <tr
                    key={interview.interview_id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-3">
                      {interview.interview_id}
                    </td>

                    <td className="p-3">
                      {interview.company_name}
                    </td>

                    <td className="p-3">
                      {interview.job_role}
                    </td>

                    <td className="p-3">
                      {interview.interview_date
                        ? new Date(
                            interview.interview_date
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td className="p-3">
                      {interview.interview_round || "-"}
                    </td>

                    <td className="p-3">
                      {interview.result || "Pending"}
                    </td>

                    <td className="p-3 whitespace-nowrap">

                      <button
                        onClick={() => handleEdit(interview)}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(interview.interview_id)
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Interviews;
