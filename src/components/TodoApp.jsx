import { useEffect, useState } from "react";
const API = "https://personalspacebackend.onrender.com/api/sections";

export default function TodoApp() {
  const [sections, setSections] = useState([]);
  const [title, setTitle] = useState("");
  const [topicText, setTopicText] = useState({});
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    fetch(API).then(r => r.json()).then(data => {
      setSections(data);
      if (data.length) setOpenSection(data[data.length - 1]._id);
    });
  }, []);

  const updateSection = (updated) => {
    setSections(sections.map(s => s._id === updated._id ? updated : s));
  };

  const addSection = async () => {
    if (!title) return;
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });
    const data = await res.json();
    setSections([...sections, data]);
    setOpenSection(data._id); // auto open new section
    setTitle("");
  };

  const addItems = async (sectionId) => {
    const lines = topicText[sectionId]
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    let updated = null;
    for (let text of lines) {
      const res = await fetch(`${API}/${sectionId}/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      updated = await res.json();
    }

    if (updated) updateSection(updated);
    setTopicText({ ...topicText, [sectionId]: "" });
  };

  const toggleItem = async (sid, iid) => {
    const res = await fetch(`${API}/${sid}/item/${iid}`, { method: "PUT" });
    updateSection(await res.json());
  };

  const deleteItem = async (sid, iid) => {
    const res = await fetch(`${API}/${sid}/item/${iid}`, { method: "DELETE" });
    updateSection(await res.json());
  };

  return (
    <div className="todo-container">
      <h2>📚 Study Tracker</h2>

      <div className="topic-input">
        <input
          placeholder="New Section (Aptitude / Reasoning)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <button onClick={addSection}>Add</button>
      </div>

      {sections.map(sec => {
        const isOpen = openSection === sec._id;

        return (
          <div className="section" key={sec._id}>
            {/* HEADER */}
            <div
              className="section-header"
              onClick={() =>
                setOpenSection(isOpen ? null : sec._id)
              }
            >
              <h3>{sec.title}</h3>
              <span className="toggle-btn">
                {isOpen ? "▲" : "▼"}
              </span>
            </div>

            {/* BODY */}
            {isOpen && (
              <div className="section-body">
                <div className="topic-input">
                  <textarea
                    placeholder="Paste topics (one per line)"
                    value={topicText[sec._id] || ""}
                    onChange={e =>
                      setTopicText({
                        ...topicText,
                        [sec._id]: e.target.value
                      })
                    }
                  />
                  <button onClick={() => addItems(sec._id)}>+</button>
                </div>

                {sec.items.map(item => (
                  <div className="item" key={item._id}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        toggleItem(sec._id, item._id)
                      }
                    />
                    <span className={item.completed ? "completed" : ""}>
                      {item.text}
                    </span>
                    <button
                      className="delete"
                      onClick={() =>
                        deleteItem(sec._id, item._id)
                      }
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
