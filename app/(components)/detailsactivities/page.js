"use client";
import { Nav, Card, Form } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";

export default function DetailsActivities({ activities = [] }) {
  const tabs = ["Activity", "Notes", "Emails", "Calls", "Tasks", "Meetings"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [search, setSearch] = useState("");

  const filteredActivities = activities.filter(a =>
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Search Input */}
      <div className="position-relative mb-4">
        <FaSearch
          className="position-absolute top-50 translate-middle-y ms-3 text-muted"
          size={14}
        />
        <Form.Control
          type="text"
          placeholder="Search activities"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-5 bg-light border-0 py-2 rounded-2"
          style={{ fontSize: "14px" }}
        />
      </div>

      {/* Tabs */}
      <Nav
        variant="tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="border-bottom mb-4"
        style={{ gap: "20px" }}
      >
        {tabs.map((tab, i) => (
          <Nav.Item key={i}>
            <Nav.Link
              eventKey={tab}
              className={`px-0 border-0 fw-bold ${activeTab === tab ? "text-primary border-bottom border-primary border-3" : "text-muted"}`}
              style={{ fontSize: "14px", background: "transparent" }}
            >
              {tab}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <h6 className="fw-bold mb-3" style={{ fontSize: "15px" }}>Upcoming</h6>

      {/* Activities List */}
      {filteredActivities.map((activity, i) => (
        <Card key={i} className="border-0 shadow-sm mb-3" style={{ border: "1px solid #eee !important" }}>
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-start">
              <div style={{ flex: 1 }}>
                {/* Title (Only if exists) */}
                {activity.title && (
                  <h6 className="fw-bold mb-1" style={{ fontSize: "14px", color: "#2c3e50" }}>
                    {activity.title}
                  </h6>
                )}

                {/* Description*/}
                <p className="mb-0 text-muted" style={{ fontSize: "13px", lineHeight: "1.5" }}>
                  {activity.description}
                </p>
              </div>

              {/* Date on the right side */}
              <span className="text-muted ms-3" style={{ fontSize: "11px", whiteSpace: "nowrap" }}>
                {activity.date}
              </span>
            </div>
          </Card.Body>
        </Card>
      ))}
    </>
  );
};

