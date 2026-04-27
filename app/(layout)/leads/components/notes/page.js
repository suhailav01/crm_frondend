"use client";
import { useState, useEffect, useRef } from "react";
import { Button, Form } from "react-bootstrap";
import { SideModal } from "@/app/(components)/sideModal/page";
import Notes from "@/app/(activityComponents)/notesTabs/page";
import { FaSearch } from "react-icons/fa";

export default function NotesTab({ leadId, searchTerm = "", currentUser }) {  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [attachments, setAttachments] = useState([]);
const editorRef = useRef(null);
const fileInputRef = useRef(null);
  useEffect(() => {
    if (!leadId) return;

 const fetchNotes = async () => {
  const res = await fetch(
    `http://localhost:7000/api/v1/leads-notes/${leadId}`
  );

  const data = await res.json();

  setNotes(
    (data.data || []).map((note) => ({
      id: note.id,
      user: note.created_by_name || currentUser?.first_name || "User",
      text: note.note_text,
      attachments:
        typeof note.attachments === "string"
          ? JSON.parse(note.attachments)
          : note.attachments || [],
      date: note.created_at,
    }))
  );
};

    fetchNotes();
  }, [leadId]);

const applyFormat = (command) => {
  editorRef.current?.focus();

  if (command === "p") {
    document.execCommand("formatBlock", false, "p");
  } else {
    document.execCommand("formatBlock", false, command);
  }
};

const handleSaveNote = async () => {
  const htmlText = editorRef.current?.innerHTML || "";

  if (!htmlText.replace(/<[^>]*>/g, "").trim()) return;

  const formData = new FormData();
  formData.append("lead_id", leadId);
  formData.append("note_text", htmlText);
 formData.append("created_by", currentUser?.id);

  attachments.forEach((file) => {
    formData.append("attachments", file);
  });

  try {
    const res = await fetch("http://localhost:7000/api/v1/leads-notes", {
      method: "POST",
      body: formData,
    });

    const newNote = await res.json();
    const created = newNote.data || newNote;

    setNotes((prev) => [
      {
        id: created.id,
        user: created.created_by_name || currentUser?.first_name || "User",
        text: created.note_text,
        attachments:
          typeof created.attachments === "string"
            ? JSON.parse(created.attachments)
            : created.attachments || [],
        date: created.created_at || new Date().toLocaleString(),
      },
      ...prev,
    ]);

    setNoteText("");
    setAttachments([]);
    if (editorRef.current) editorRef.current.innerHTML = "";
    setIsOpen(false);
  } catch (error) {
    console.error("Save error:", error);
  }
};
  const filteredNotes = (notes || []).filter((item) =>
    item?.text?.toLowerCase()?.includes(searchTerm.toLowerCase()),
  );
  const isSearching = searchTerm.trim() !== "";
  const displayNotes = isSearching ? filteredNotes : notes;
  return (
    <>
      {/* Blur background */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(6px)",
            zIndex: 1040,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}

      <div
        style={{
          filter: isOpen ? "blur(4px)" : "none",
          pointerEvents: isOpen ? "none" : "auto",
        }}
      >
        <div className="p-0"
         style={{
    maxHeight: "450px",  
    overflowY: "auto"
  }}>
          {/*  NO RESULTS UI */}

          {isSearching && filteredNotes.length === 0 ? (
            <div
              className="d-flex flex-column align-items-center justify-content-center text-center"
              style={{ padding: "40px 20px" }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#f0eeff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <FaSearch size={20} style={{ color: "#5e4cf3" }} />
              </div>

              <h6 className="fw-semibold mb-1">No results found</h6>

              <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                Try adjusting your search or use different keywords.
              </p>
            </div>
          ) : (
            <Notes notes={displayNotes} onCreateNote={() => setIsOpen(true)} />
          )}
        </div>
      </div>

      {/* SIDE MODAL */}

      <SideModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Note"
      >
        <div style={{ padding: "10px 0" }}>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: "0.85rem", fontWeight: "600" }}>
              Note <span className="text-danger">*</span>
            </Form.Label>
            <div
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Toolbar */}
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#f8f9fa",
                  borderBottom: "1px solid #dee2e6",
                  display: "flex",
                  gap: "15px",
                  fontSize: "0.8rem",
                  color: "#6c757d",
                }}
              >
<select
  onChange={(e) => applyFormat(e.target.value)}
  style={{
    border: "none",
    background: "transparent",
    fontSize: "12px",
    cursor: "pointer"
  }}
>
  <option value="p">Normal text</option>
  <option value="h1">Heading 1</option>
  <option value="h2">Heading 2</option>
  <option value="h3">Heading 3</option>
</select>
                <div style={{ display: "flex", gap: "10px" }}>
                  <span
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                    onClick={() => applyFormat("bold")}
                  >
                    B
                  </span>
                  <span
                    style={{ fontStyle: "italic", cursor: "pointer" }}
                    onClick={() => applyFormat("italic")}
                  >
                    I
                  </span>
                  <span
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                    onClick={() => applyFormat("underline")}
                  >
                    U
                  </span>
                </div>

              <div style={{ display: "flex", gap: "10px" }}>
  <span
    style={{ cursor: "pointer", userSelect: "none" }}
    onClick={() => applyFormat("insertUnorderedList")}
    title="Bullet List"
  >
    ≡
  </span>

  <span
    style={{ cursor: "pointer", userSelect: "none" }}
    onClick={() => applyFormat("insertOrderedList")}
    title="Numbered List"
  >
    ≣
  </span>

  <span
    style={{ cursor: "pointer", userSelect: "none" }}
    onClick={() => fileInputRef.current?.click()}
    title="Add Image"
  >
    🖼️
  </span>
</div>
              </div>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) =>
                  setAttachments((prev) => [...prev, ...e.target.files])
                }
              />
              {/* Textarea */}
           <div
  ref={editorRef}
  contentEditable
  suppressContentEditableWarning={true}
  onInput={(e) => setNoteText(e.currentTarget.innerHTML)}
  data-placeholder="Enter"
  style={{
    minHeight: "180px",
    padding: "12px",
    outline: "none",
    fontSize: "0.9rem",
    lineHeight: "1.6",
  }}
/>
{attachments.length > 0 && (
  <div
    style={{
      marginTop: "12px",
      padding: "12px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))",
      gap: "10px",
      width: "100%",
      maxHeight: "160px",
      overflowY: "auto",
      borderTop: "1px solid #eee",
    }}
  >
    {attachments.map((file, index) => (
      <div
        key={index}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: "10px",
          overflow: "hidden",
          border: "1px solid #ddd",
          background: "#f8f9fa",
          minWidth: "64px",
          maxWidth: "80px",
        }}
      >
        {file.type.startsWith("image") ? (
          <img
            src={URL.createObjectURL(file)}
            alt={`attachment-${index}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "6px",
              color: "#555",
              background: "#fff",
            }}
          >
            {file.name.slice(0, 10)}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setAttachments((prev) => prev.filter((_, i) => i !== index))
          }
          style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            width: "18px",
            height: "18px",
            border: "none",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 2,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    ))}
  </div>
)}
            </div>
          </Form.Group>

          <div className="d-flex gap-2 mt-4">
            <Button
              variant="outline-secondary"
              style={{
                flex: 1,
                borderRadius: "8px",
                padding: "10px",
              }}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              style={{
                flex: 1,
                backgroundColor: "#5e4cf3",
                border: "none",
                borderRadius: "8px",
                padding: "10px",
              }}
              onClick={handleSaveNote}
            >
              Save
            </Button>
          </div>
        </div>
      </SideModal>
    </>
  );
}
