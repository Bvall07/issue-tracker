import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Issue } from "./types";

function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function loadIssues() {
      try {
        const response = await fetch("http://localhost:3001/api/issues");

        if (!response.ok) {
          throw new Error("The server could not load issues");
        }

        const data: Issue[] = await response.json();
        setIssues(data);
      } catch {
        setError("Could not load issues. Is the API server running?");
      } finally {
        setIsLoading(false);
      }
    }

    loadIssues();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) return;

    try {
      const response = await fetch("http://localhost:3001/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error("Could not create issue");
      }

      const newIssue: Issue = await response.json();
      setIssues((currentIssues) => [newIssue, ...currentIssues]);
      setTitle("");
      setDescription("");
      setError("");
    } catch {
      setError("Could not save issue. Check that the API server is running.");
    }
  }

  async function changeStatus(issueId: number, status: Issue["status"]) {
    try {
      const response = await fetch(
        `http://localhost:3001/api/issues/${issueId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not update issue");
      }

      const updatedIssue: Issue = await response.json();

      setIssues((currentIssues) =>
        currentIssues.map((issue) =>
          issue.id === issueId ? updatedIssue : issue
        )
      );
      setError("");
    } catch {
      setError("Could not update status. Check that the API server is running.");
    }
  }

  const visibleIssues =
    filter === "All"
      ? issues
      : issues.filter((issue) => issue.status === filter);

  return (
    <main>
      <h1>Issue Tracker</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <button type="submit">Add issue</button>
      </form>

      {isLoading && <p>Loading issues...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && issues.length === 0 && <p>No issues yet.</p>}

      <div>
        {["All", "To do", "In progress", "Done"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <section>
        {visibleIssues.map((issue) => (
          <article key={issue.id}>
            <h2>{issue.title}</h2>
            <p>{issue.description}</p>

            <label>
              Status
              <select
                value={issue.status}
                onChange={(event) =>
                  changeStatus(issue.id, event.target.value as Issue["status"])
                }
              >
                <option>To do</option>
                <option>In progress</option>
                <option>Done</option>
              </select>
            </label>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;