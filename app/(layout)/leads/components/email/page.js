"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import Emails from "@/app/(activityComponents)/emailsTabs/page";
import { FaSearch } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";


export default function EmailsTab({ leadId, leadEmail, searchTerm }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [emailsData, setEmailsData] = useState([]);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [body, setBody] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const editorRef = useRef(null);

  const fetchEmails = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lead-emails/${leadId}`);
    const result = await res.json();

    const list = result.data || [];
    setEmailsData(
      list.map((email) => ({
        id: email.id,
        subject: email.subject,
        senderName: email.sent_by_name,
        recipient: email.recipients,
        body: email.body,
        date: email.created_at,
        type: "email",
      }))
    );
  };

  useEffect(() => {
    if (!leadId) return;
    fetchEmails();
  }, [leadId]);



  const handleSend = async () => {

    if (!recipient || !subject || !body) {
      toast.error("Please fill all required fields");
      return;
    }

    setSending(true);

    const loadingToast = toast.loading("Sending email...");

    try {

      const formData = new FormData();

      formData.append("lead_id", leadId);
      formData.append("recipients", recipient);
      formData.append("cc", cc);
      formData.append("bcc", bcc);
      formData.append("subject", subject);
      formData.append("body", body);
      formData.append("sent_by", 1);

      // attachments add
      attachments.forEach((item) => {
        if (item.file) {
          formData.append("attachments", item.file);
        }
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lead-emails`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      toast.dismiss(loadingToast);

      if (!result.success) {
        toast.error("Email send failed");
        return;
      }

      toast.success("Email sent successfully");

      fetchEmails();

      setSubject("");
      setRecipient("");
      setBody("");
      setCc("");
      setBcc("");
      setAttachments([]);
      setIsOpen(false);

    } catch (err) {

      toast.dismiss(loadingToast);
      console.error(err);
      toast.error("Something went wrong");

    }

    setSending(false);
  };
  const filteredEmails = (emailsData || []).filter((item) =>
    item?.subject?.toLowerCase()?.includes(searchTerm?.toLowerCase() || "")
  );
  const isSearching = searchTerm?.trim() !== "";

  const displayEmails = isSearching ? filteredEmails : emailsData;
  const openEmailModal = () => {
    setRecipient(leadEmail);   // auto fill
    setIsOpen(true);
  };

  const backdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(5px)",
    zIndex: 1040,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const modalStyle = {
    width: "550px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    zIndex: 1050,
    overflow: "hidden",
  };

  const mainContentStyle = {
    filter: isOpen ? "blur(4px)" : "none",
    pointerEvents: isOpen ? "none" : "auto",
    transition: "filter 0.3s ease",
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {isOpen && (
        <div style={backdropStyle} onClick={() => setIsOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div style={{
              backgroundColor: "#5e4cf3",
              color: "white",
              padding: "10px 15px",
              display: "flex",
              justifyContent: "space-between"
            }}>
              <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                New Email
              </span>
              <span style={{ cursor: "pointer" }} onClick={() => setIsOpen(false)}>✕</span>
            </div>

            {/* Body */}
            <div>

              <div style={{ padding: "10px 15px", borderBottom: "1px solid #eee" }}>
                <input
                  placeholder="Recipients"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  style={{ border: "none", width: "100%", outline: "none" }}
                />
              </div>
              <div style={{ padding: "10px 15px", borderBottom: "1px solid #eee" }}>
                <input
                  placeholder="CC"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  style={{ border: "none", width: "100%", outline: "none" }}
                />
              </div>

              <div style={{ padding: "10px 15px", borderBottom: "1px solid #eee" }}>
                <input
                  placeholder="BCC"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  style={{ border: "none", width: "100%", outline: "none" }}
                />
              </div>

              <div style={{ padding: "10px 15px", borderBottom: "1px solid #eee" }}>
                <input
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ border: "none", width: "100%", outline: "none" }}
                />
                <input
                  type="file"
                  id="fileUpload"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const preview = URL.createObjectURL(file);

                    setAttachments((prev) => [
                      ...prev,
                      {
                        file,
                        preview,
                        type: file.type.startsWith("image") ? "image" : "file",
                        name: file.name,
                      },
                    ]);
                  }}
                />

                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];

                    if (!file) return; // important

                    const reader = new FileReader();

                    reader.onload = () => {
                      setAttachments((prev) => [
                        ...prev,
                        {
                          file: file,
                          preview: reader.result,
                          type: "image",
                          name: file.name,
                        },
                      ]);
                    };

                    reader.readAsDataURL(file);
                  }}
                />
              </div>

              <div style={{ padding: "15px", minHeight: "200px", position: "relative" }}>
                {attachments.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      right: "10px",
                      bottom: "10px",
                      width: "120px",
                      maxHeight: "120px",
                      overflowY: "auto",
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "6px",
                      background: "#fafafa",
                      padding: "5px",
                      borderRadius: "6px",
                      border: "1px solid #eee"
                    }}
                  >
                    {attachments.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          width: "50px",
                          height: "50px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          overflow: "hidden",
                          background: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px"
                        }}
                      >
                        {item.type === "image" ? (
                          <img
                            src={item.preview}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover"
                            }}
                          />
                        ) : (
                          <span>📄</span>
                        )}

                        {/* remove */}
                        <span
                          onClick={() =>
                            setAttachments((prev) => prev.filter((_, i) => i !== index))
                          }
                          style={{
                            position: "absolute",
                            top: "2px",
                            right: "2px",
                            background: "#ff4d4f",
                            color: "white",
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            fontSize: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            zIndex: 10,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                          }}
                        >
                          ✕
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setBody(e.currentTarget.innerHTML)}
                  onKeyUp={() => {
                    const isBoldActive = document.queryCommandState("bold");
                    setIsBold(isBoldActive);
                  }}
                  onMouseUp={() => {
                    const isBoldActive = document.queryCommandState("bold");
                    setIsBold(isBoldActive);
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    minHeight: "150px",
                    textAlign: "left",
                    direction: "ltr",
                    unicodeBidi: "plaintext",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    paddingRight: attachments.length > 0 ? "130px" : "0"
                  }}
                />
              </div>

            </div>

            {/* Footer */}
            <div style={{
              padding: "10px 15px",
              borderTop: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>

              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>

                <Button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  style={{
                    backgroundColor: "#5e4cf3",
                    border: "none",
                    fontSize: "0.85rem",
                    padding: "5px 15px"
                  }}
                >
                  {sending ? "Sending..." : "Send"}
                </Button>
                <div
                  style={{
                    color: "#888",
                    display: "flex",
                    gap: "12px",
                    fontSize: "1.1rem",
                    cursor: "pointer"
                  }}
                >
                  <span
                    onClick={() => {
                      editorRef.current.focus();
                      document.execCommand("bold", false, null);

                      const isBoldActive = document.queryCommandState("bold");
                      setIsBold(isBoldActive);
                    }}
                    style={{
                      fontWeight: "bold",
                      color: isBold ? "#5e4cf3" : "#888"
                    }}
                  >
                    A
                  </span>
                  <span onClick={() => document.getElementById("fileUpload").click()}>
                    📎
                  </span>

                  <span
                    onClick={() => {
                      const url = prompt("Enter URL");
                      if (url) document.execCommand("createLink", false, url);
                    }}
                  >
                    🔗
                  </span>

                  <span onClick={() => setBody(body + " 😊")}>🙂</span>

                  <span onClick={() => document.getElementById("imageUpload").click()}>
                    🖼️
                  </span>
                </div>

              </div>

              <div
                style={{ color: "#888", cursor: "pointer" }}
                onClick={() => {
                  setRecipient("");
                  setSubject("");
                  setBody("");
                  setCc("");
                  setBcc("");
                }}
              >
                🗑️
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ✅ IMPORTANT FIX (EMPTY ISSUE SOLVED) */}
      <div style={mainContentStyle}>
        <div className="p-0" style={{
          maxHeight: "470px",
          overflowY: "auto",

        }}>
          {isSearching ? (
            filteredEmails.length === 0 ? (

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

                <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                  Try adjusting your search or use different keywords.
                </p>

              </div>

            ) : (

              <Emails
                emails={displayEmails}
                onCreateEmail={openEmailModal} />

            )
          ) : (
            displayEmails.length === 0 ? (

              <div
                className="text-center"
                style={{
                  border: "2px dashed #d6dbe3",
                  borderRadius: "10px",
                  padding: "40px",
                }}
              >
                <p className="text-muted mb-3">No Emails available.</p>

                <Button
                  style={{
                    backgroundColor: "#5e4cf3",
                    border: "none",
                    padding: "6px 18px",
                    fontSize: "14px",
                  }}
                  onClick={openEmailModal}
                >
                  Create Email
                </Button>
              </div>

            ) : (

              <Emails
                emails={displayEmails}
                onCreateEmail={openEmailModal}
              />

            )
          )}

        </div>
      </div>
    </>
  );
}