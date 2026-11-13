
import { useEffect, useState } from "react";

function Applications() {

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("");

  const [form, setForm] = useState({
    company_name: "",
    job_role: "",
    location: "",
    applied_date: "",
    status: "Applied",
    job_description: ""
  });

  // FETCH APPLICATIONS
  const fetchApplications = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/applications"
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch applications");
      }

      setApplications(result.data || []);

    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // HANDLE FORM INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ADD APPLICATION
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...form,
            user_id: 1
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add application");
      }

      setMessage("Application added successfully!");

      setForm({
        company_name: "",
        job_role: "",
        location: "",
        applied_date: "",
        status: "Applied",
        job_description: ""
      });

      setShowForm(false);
      fetchApplications();

    } catch (err) {
      setMessage(err.message);
    }
  };

  // UPDATE APPLICATION STATUS
  const handleUpdate = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/applications/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: editStatus
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update application");
      }

      setMessage("Application updated successfully!");
      setEditingId(null);

      fetchApplications();

    } catch (err) {
      setMessage(err.message);
    }
  };

  // DELETE APPLICATION
  const handleDelete = async (id) => {

    if (!window.confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/applications/${id}`,
        {
          method: "DELETE"
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete application");
      }

      setMessage("Application deleted successfully!");

      fetchApplications();

    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="bg-white mt-8 p-6 rounded-xl shadow">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-xl font-bold">
          Recent Applications
        </h2>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? "Close Form" : "+ Add Application"}
        </button>

      </div>

      {/* MESSAGE */}

      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
          {message}
        </div>
      )}

      {/* ADD APPLICATION FORM */}

      {showForm && (

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-50 p-5 rounded-lg"
        >

          <input
            name="company_name"
            placeholder="Company Name"
            value={form.company_name}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg"
          />

          <input
            name="job_role"
            placeholder="Job Role"
            value={form.job_role}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg"
          />

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="date"
            name="applied_date"
            value={form.applied_date}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>

          <textarea
            name="job_description"
            placeholder="Job Description"
            value={form.job_description}
            onChange={handleChange}
            className="border p-3 rounded-lg md:col-span-2"
          />

          <button
            type="submit"
            className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 md:col-span-2"
          >
            Submit Application
          </button>

        </form>
      )}

      {/* APPLICATIONS TABLE */}

      {loading ? (
        <p>Loading applications...</p>
      ) : (

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-gray-500">
                <th className="p-3">Company</th>
                <th className="p-3">Job Role</th>
                <th className="p-3">Location</th>
                <th className="p-3">Applied Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>

              {applications.map(app => (

                <tr
                  key={app.application_id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-3 font-medium">
                    {app.company_name}
                  </td>

                  <td className="p-3">
                    {app.job_role}
                  </td>

                  <td className="p-3">
                    {app.location || "-"}
                  </td>

                  <td className="p-3">
                    {app.applied_date
                      ? new Date(app.applied_date).toLocaleDateString("en-IN")
                      : "-"}
                  </td>

                  {/* STATUS */}

                  <td className="p-3">

                    {editingId === app.application_id ? (

                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="border p-2 rounded"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                    ) : (

                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {app.status}
                      </span>

                    )}

                  </td>

                  {/* ACTIONS */}

                  <td className="p-3">

                    {editingId === app.application_id ? (

                      <div className="flex gap-2">

                        <button
                          onClick={() => handleUpdate(app.application_id)}
                          className="text-green-600 font-bold"
                        >
                          Save
                        </button>

                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-500"
                        >
                          Cancel
                        </button>

                      </div>

                    ) : (

                      <div className="flex gap-3">

                        <button
                          onClick={() => {
                            setEditingId(app.application_id);
                            setEditStatus(app.status || "Applied");
                          }}
                          className="text-blue-600 font-semibold"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(app.application_id)}
                          className="text-red-600 font-semibold"
                        >
                          Delete
                        </button>

                      </div>

                    )}

                  </td>

                </tr>

              ))}

              {applications.length === 0 && (

                <tr>
                  <td colSpan="6" className="p-5 text-center text-gray-500">
                    No applications found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Applications;
