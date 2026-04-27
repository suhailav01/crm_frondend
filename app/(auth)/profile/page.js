// app/profile/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
export default function ProfilePage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(false);

    const API = "http://localhost:7000";

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            router.push("/login");
            return;
        }

        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
        setFirstName(parsedUser.first_name || "");
        setLastName(parsedUser.last_name || "");
        setPhoneNumber(parsedUser.phone_number || "");

        if (parsedUser.profile_image) {
            setImagePreview(`${API}/${parsedUser.profile_image}`);
        }
    }, [router]);

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);

            const res = await fetch(`${API}/api/v1/profile/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phoneNumber,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);

            toast.success("Profile updated successfully ✅");

        } catch (err) {
            toast.error(err.message || "Update failed ❌");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            setImagePreview(URL.createObjectURL(file));

            const formData = new FormData();
            formData.append("profile_image", file);

            const res = await fetch(`${API}/api/v1/profile/${user.id}/image`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);

            toast.success("Profile image updated 🎉");

        } catch (err) {
            toast.error(err.message || "Upload failed ❌");
        }
    };

    if (!user) {
        return <div style={{ padding: "100px 30px" }}>Loading...</div>;
    }

    const initial = firstName ? firstName.charAt(0).toUpperCase() : "U";

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f8fafc",
                padding: "100px 30px 40px",
                fontFamily: "'Inter', sans-serif",
            }}
        >
            <div
                style={{
                    maxWidth: "850px",
                    margin: "0 auto",
                    background: "#fff",
                    borderRadius: "18px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                }}
            >
                <div
                    style={{
                        height: "160px",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    }}
                />

                <div style={{ padding: "0 35px 35px" }}>
                    <div style={{ marginTop: "-60px", position: "relative" }}>
                        <label style={{ cursor: "pointer" }}>
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Profile"
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "6px solid #fff",
                                        background: "#fff",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        borderRadius: "50%",
                                        background: "#5D5FEF",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "46px",
                                        fontWeight: "800",
                                        border: "6px solid #fff",
                                    }}
                                >
                                    {initial}
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleImageUpload}
                            />
                        </label>

                        <div style={{ fontSize: "13px", color: "#6366f1", marginTop: "8px" }}>
                            Click image to upload
                        </div>
                    </div>

                    <h2 style={{ fontWeight: "800", marginTop: "20px" }}>
                        Edit Profile
                    </h2>

                    <p style={{ color: "#64748b" }}>{user.email}</p>

                    <div className="row g-4 mt-2">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">First Name</label>
                            <input
                                className="form-control"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Last Name</label>
                            <input
                                className="form-control"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Phone Number</label>
                            <input
                                className="form-control"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Role</label>
                            <input
                                className="form-control"
                                value={user.role || ""}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="btn"
                            style={{
                                background: "#6366f1",
                                color: "#fff",
                                fontWeight: "600",
                                borderRadius: "10px",
                                padding: "10px 22px",
                            }}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                            onClick={() => router.back()}
                            className="btn btn-light"
                            style={{
                                fontWeight: "600",
                                borderRadius: "10px",
                                padding: "10px 22px",
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}