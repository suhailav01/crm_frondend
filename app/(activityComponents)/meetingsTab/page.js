'use client';
import { useState } from 'react';

export default function MeetingsTab({ onCreateMeeting, meetingsData = [] }) {
  // Track which meeting is expanded
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-0 bg-transparent border-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.25rem' }}>Meeting</h4>
        <button
          className="btn btn-primary px-4 py-2 fw-semibold"
          style={{ backgroundColor: '#6366f1', border: 'none', borderRadius: '8px' }}
          onClick={onCreateMeeting}
        >
          Create Meeting
        </button>
      </div>

      {meetingsData.length === 0 ? (
        <div className="text-center py-5 text-muted bg-white rounded-3 shadow-sm">
          <p>No meetings scheduled yet.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {meetingsData.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-3 border border-light-subtle shadow-sm overflow-hidden"
              style={{ border: '1px solid #e2e8f0' }}
            >
              {/* HEADER SECTION */}
              <div
                className="p-3 d-flex justify-content-between align-items-center cursor-pointer"
                style={{ cursor: 'pointer' }}
                onClick={() => toggleExpand(meeting.id)}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi bi-chevron-${expandedId === meeting.id ? 'down' : 'right'}`} style={{ color: '#6366f1', fontSize: '14px' }}></i>
                  <span
                    className="fw-bold text-dark"
                    style={{
                      color: '#334155',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  >
                    Meeting {meeting.title}
                  </span>                </div>
                <div
                  className="text-muted small"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {meeting.date} at {meeting.time}
                </div>
              </div>

              {/* EXPANDABLE DETAILS SECTION */}
              {expandedId === meeting.id && (
                <div className="px-3 pb-3">
                  <div className="mb-2 small fw-medium" style={{ color: '#64748b', paddingLeft: '22px' }}>
                  </div>

                  {/* Gray Info Box */}
                  <div className="p-3 rounded-3 mb-3 d-flex" style={{ backgroundColor: '#f1f5f9', marginLeft: '22px' }}>
                    <div className="flex-fill">
                      <div className="small text-muted mb-1" style={{ fontSize: '11px', textTransform: 'capitalize' }}>Date & Time</div>
                      <div className="fw-semibold small">{meeting.date} at {meeting.time}</div>
                    </div>
                    <div className="flex-fill">
                      <div className="small text-muted mb-1" style={{ fontSize: '11px', textTransform: 'capitalize' }}>Duration</div>
                      <div className="fw-semibold small">1 hr</div>
                    </div>
                    <div className="flex-fill">
                      <div className="small text-muted mb-1" style={{ fontSize: '11px', textTransform: 'capitalize' }}>Attendees</div>
                      <div className="fw-semibold small">2</div>
                    </div>
                  </div>

                  {/* Description Note */}
                  <div
                    className="small"
                    style={{
                      color: '#64748b',
                      paddingLeft: '22px',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {meeting.note}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}