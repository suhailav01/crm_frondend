"use client";
import { useState, useEffect } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { SideModal } from "@/app/(components)/sideModal/page";
import Calls from "@/app/(activityComponents)/callsTabs/page";

export default function CallsTab({ searchTerm, leadId, lead }) {

  const [isOpen, setIsOpen] = useState(false);
  const [activeCallSid, setActiveCallSid] = useState(null);
  const [callsData, setCallsData] = useState([]);

  const [connected, setConnected] = useState("");
  const [outcome, setOutcome] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [callDuration, setCallDuration] = useState(0);


  const API = `${process.env.NEXT_PUBLIC_API_URL}`;

  // ✅ FETCH CALLS
  useEffect(() => {
    if (!leadId) return;

    const fetchCalls = async () => {
      try {
      const res = await fetch(`${API}/lead-calls/${leadId}`);
          const result = await res.json();

        if (res.ok) {
          setCallsData(result.data || []);
        }
      } catch (err) {
        console.error("Fetch calls error:", err);
      }
    };

    fetchCalls();
  }, [leadId]);

  useEffect(() => {
  let timer;

  if (activeCallSid) {
    timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  } else {
    setCallDuration(0);
  }

  return () => clearInterval(timer);
}, [activeCallSid]);

const formatTime = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};
  // ✅ SAVE CALL
const handleSave = async () => {
  try {
    // 🔥 VALIDATION FIRST
    if (!leadId || !connected || !outcome || !date || !time) {
      alert("Please fill all required fields");
      return;
    }

    const newCall = {
      lead_id: leadId,
      connected_to: connected,
      call_outcome: outcome,
      call_date: date,
      call_time: time,
      note: note || ""
    };

    const res = await fetch(`${API}/lead-calls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newCall)
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message);
    }

    setCallsData([result.data, ...callsData]);

    setConnected("");
    setOutcome("");
    setDate("");
    setTime("");
    setNote("");

    setIsOpen(false);

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
const handleMakePhoneCall = async () => {
  try {
    const formatPhoneNumber = (phone) => {
      if (!phone) return "";

      let cleaned = String(phone).replace(/\D/g, "");

      if (cleaned.startsWith("91") && cleaned.length === 12) {
        return `+${cleaned}`;
      }

      if (cleaned.startsWith("1") && cleaned.length === 11) {
        cleaned = cleaned.slice(1);
      }

      if (cleaned.length === 10) {
        return `+91${cleaned}`;
      }

      return `+${cleaned}`;
    };

    const customerPhone = formatPhoneNumber(lead?.phone);
    const name = `${lead?.firstName || ""} ${lead?.lastName || ""}`.trim();

    if (!leadId || !customerPhone) {
      alert("Lead phone missing");
      return;
    }

    const res = await fetch(`${API}/lead-calls/make-call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: Number(leadId),
        customer_phone: customerPhone,
        connected_to: name || "Customer",
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      const msg = result?.message || "Failed to start call";

      if (
        msg.toLowerCase().includes("unverified") ||
        msg.toLowerCase().includes("trial")
      ) {
        alert(
"Calls cannot be made to unverified numbers on a Twilio trial account. Please verify the number in Twilio Console or upgrade your account." );
        return;
      }

      alert(msg);
      return;
    }

    alert("📞 Call started");
    setActiveCallSid(result.data?.twilio_sid || null);
  } catch (err) {
    console.error("MAKE CALL ERROR:", err);
    alert("Failed to start call");
  }
};
const handleEndCall = async (callSid) => {
  try {
    const res = await fetch(`${API}/lead-calls/end-call/${callSid}`, {
      method: "POST",
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message);
    }

    alert("📞 Call ended");

    setActiveCallSid(null); // ✅ hide box

  } catch (err) {
    console.error(err);
  }
};
  // ✅ SEARCH FILTER
  const filteredCalls = callsData.filter((item) =>
    item.connected_to?.toLowerCase().includes(searchTerm?.toLowerCase() || "")
  );

  const displayCalls = searchTerm ? filteredCalls : callsData;

  return (
    <>
    <div
     style={{
    maxHeight: displayCalls.length > 6 ? "420px" : "auto",
    overflowY: displayCalls.length > 6 ? "auto" : "visible",
    paddingRight: "4px",
  }}>
<Calls
  calls={displayCalls}
  onCreateCall={() => setIsOpen(true)}
  onMakePhoneCall={handleMakePhoneCall}
/>

      {/* SIDE MODAL */}
      <SideModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Log Call"
      >

        <Form>

          <Form.Group className="mb-3">
            <Form.Label>Connected To</Form.Label>
            <Form.Control
              value={connected}
              onChange={(e)=>setConnected(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Outcome</Form.Label>
            <Form.Select
              value={outcome}
              onChange={(e)=>setOutcome(e.target.value)}
            >
              <option value="">Choose</option>
              <option>Connected</option>
              <option>No Answer</option>
              <option>Follow Up</option>
            </Form.Select>
          </Form.Group>

          <Row>
            <Col>
              <Form.Control
                type="date"
                value={date}
                onChange={(e)=>setDate(e.target.value)}
              />
            </Col>

            <Col>
              <Form.Control
                type="time"
                value={time}
                onChange={(e)=>setTime(e.target.value)}
              />
            </Col>
          </Row>

          <Form.Group className="mt-3">
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Note"
              value={note}
              onChange={(e)=>setNote(e.target.value)}
            />
          </Form.Group>

          <Button
            style={{marginTop:"20px"}}
            onClick={handleSave}
          >
            Save Call
          </Button>

        </Form>

      </SideModal>
      {activeCallSid && (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "280px",
      background: "#1f2937",
      color: "#fff",
      borderRadius: "14px",
      boxShadow: "0 15px 30px rgba(0,0,0,0.35)",
      overflow: "hidden",
      fontFamily: "sans-serif",
    }}
  >
    {/* HEADER */}
    <div
      style={{
        background: "#111827",
        padding: "12px 15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "10px",
            height: "10px",
            background: "#22c55e",
            borderRadius: "50%",
            animation: "pulse 1.5s infinite",
          }}
        ></div>
        <span style={{ fontSize: "14px" }}>Calling...</span>
      </div>

      <div style={{ fontSize: "13px", opacity: 0.8 }}>
        {formatTime(callDuration)}
      </div>
    </div>

    {/* BODY */}
    <div style={{ padding: "18px", textAlign: "center" }}>
      <div style={{ fontSize: "28px" }}>📞</div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        {lead?.firstName} {lead?.lastName}
      </div>

      <div style={{ fontSize: "13px", opacity: 0.6 }}>
        Call in progress
      </div>
    </div>

    {/* FOOTER */}
    <div style={{ padding: "12px" }}>
      <button
        onClick={() => handleEndCall(activeCallSid)}
        style={{
          width: "100%",
          background: "#ef4444",
          border: "none",
          padding: "12px",
          borderRadius: "8px",
          color: "#fff",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        🔴 End Call
      </button>
    </div>
  </div>
)}
    </div>

    </>
  );
}