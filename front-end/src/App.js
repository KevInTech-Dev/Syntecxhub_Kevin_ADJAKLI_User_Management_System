import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/api/v1/users";

function App() {
  const [users, setUsers] = useState([]);
  const [step, setStep] = useState("menu"); // menu, create, otp, list, detail, edit
  const [registerForm, setRegisterForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: ""
  });
  const [otpForm, setOtpForm] = useState({ email: "", otp: "" });
  const [editForm, setEditForm] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  // Charger la liste des utilisateurs
  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.status === 200) {
        const data = await res.json();
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    if (step === "list" || step === "menu") fetchUsers();
  }, [step]);

  // Gestion du formulaire d'inscription
  const handleRegisterChange = e => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async e => {
    e.preventDefault();
    setMessage("Recording in progress...");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Registration successful! Check your email for the OTP.");
        setOtpForm({ ...otpForm, email: registerForm.email });
        setStep("otp");
      } else {
        setMessage(data.msg || "Error during registration.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  // Gestion du formulaire OTP
  const handleOtpChange = e => {
    setOtpForm({ ...otpForm, [e.target.name]: e.target.value });
  };

  const handleOtpSubmit = async e => {
    e.preventDefault();
    setMessage("Verification...");
    try {
      const res = await fetch("http://localhost:3000/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otpForm)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.msg || "OTP verified, authentication successful!");
        setStep("menu");
        fetchUsers();
      } else {
        setMessage(data.msg || "OTP check failed.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  // Afficher la liste des utilisateurs
  const handleShowUsers = () => {
    if (users.length === 0) {
      setMessage("No registered users at the moment.");
    } else {
      setMessage("");
      setStep("list");
    }
  };

  // Afficher le détail d'un utilisateur
  const handleShowDetail = user => {
    setSelectedUser(user);
    setStep("detail");
    setMessage("");
  };

  // Préparer la modification
  const handleEditUser = user => {
    setEditForm(user);
    setStep("edit");
    setMessage("");
  };

  // Soumettre la modification
  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setMessage("Running change...");
    try {
      const res = await fetch(`${API_URL}/${editForm._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Modification successful!");
        setStep("menu");
        fetchUsers();
      } else {
        setMessage(data.msg || "Error while editing.");
      }
    } catch {
      setMessage("Erreur serveur.");
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async user => {
    if (!window.confirm(`Delete ${user.name} ?`)) return;
    setMessage("Deletion in progress...");
    try {
      const res = await fetch(`${API_URL}/${user._id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMessage("Deletion successful!");
        setStep("menu");
        fetchUsers();
      } else {
        setMessage(data.msg || "error deleting.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  // Retour au menu
  const handleBack = () => {
    setStep("menu");
    setMessage("");
    setSelectedUser(null);
    setEditForm({});
  };

  // Menu principal
  return (
    <div style={{
      maxWidth: 600,
      margin: "40px auto",
      fontFamily: "Segoe UI, sans-serif",
      background: "#f9f9f9",
      borderRadius: 10,
      boxShadow: "0 2px 8px #ccc",
      padding: 30
    }}>
      <h2 style={{ textAlign: "center", color: "#2b4c7e" }}>User Management System</h2>

      {step === "menu" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <button onClick={() => setStep("create")} style={btnStyle}>create a new user</button>
          <button onClick={handleShowUsers} style={btnStyle}>Show users</button>
          <button
            onClick={() => users.length === 0 ? setMessage("No users to modify.") : setStep("list")}
            style={btnStyle}
          >Modify User</button>
          <button
            onClick={() => users.length === 0 ? setMessage("No users to delete.") : setStep("list")}
            style={btnStyle}
          >Delete a user</button>
          {message && <div style={msgStyle}>{message}</div>}
        </div>
      )}

      {step === "create" && (
        <form onSubmit={handleRegisterSubmit} style={formStyle}>
          <h3>Create a new uer</h3>
          <input name="name" placeholder="Name" value={registerForm.name} onChange={handleRegisterChange} required style={inputStyle} />
          <input name="address" placeholder="Address" value={registerForm.address} onChange={handleRegisterChange} required style={inputStyle} />
          <input name="phone" placeholder="Phone" value={registerForm.phone} onChange={handleRegisterChange} required style={inputStyle} />
          <input name="email" placeholder="Email" type="email" value={registerForm.email} onChange={handleRegisterChange} required style={inputStyle} />
          <button type="submit" style={btnStyle}>Sign up</button>
          <button type="button" onClick={handleBack} style={btnStyleSec}>Return</button>
          <div style={msgStyle}>{message}</div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} style={formStyle}>
          <h3>OTP verification</h3>
          <input name="email" placeholder="Email" type="email" value={otpForm.email} readOnly style={inputStyle} />
          <input name="otp" placeholder="OTP reçu par email" value={otpForm.otp} onChange={handleOtpChange} required style={inputStyle} />
          <button type="submit" style={btnStyle}>Check OTP</button>
          <button type="button" onClick={handleBack} style={btnStyleSec}>Return</button>
          <div style={msgStyle}>{message}</div>
        </form>
      )}

      {step === "list" && (
        <div>
          <h3>List of users</h3>
          {users.length === 0 ? (
            <div style={msgStyle}>No registered users at the moment.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#e3eafc" }}>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>
                      <button onClick={() => handleShowDetail(u)} style={btnTable}>View</button>
                      <button onClick={() => handleEditUser(u)} style={btnTable}>Modify</button>
                      <button onClick={() => handleDeleteUser(u)} style={btnTableDel}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button onClick={handleBack} style={btnStyleSec}>Return</button>
          <div style={msgStyle}>{message}</div>
        </div>
      )}

      {step === "detail" && selectedUser && (
        <div>
          <h3>User detail</h3>
          <p><b>Name :</b> {selectedUser.name}</p>
          <p><b>Address :</b> {selectedUser.address}</p>
          <p><b>Email :</b> {selectedUser.email}</p>
          <p><b>Phone :</b> {selectedUser.phone}</p>
          <button onClick={handleBack} style={btnStyleSec}>Return</button>
        </div>
      )}

      {step === "edit" && (
        <form onSubmit={handleEditSubmit} style={formStyle}>
          <h3>Edit user</h3>
          <input name="name" placeholder="Nom" value={editForm.name || ""} onChange={handleEditChange} required style={inputStyle} />
          <input name="address" placeholder="Adresse" value={editForm.address || ""} onChange={handleEditChange} required style={inputStyle} />
          <input name="phone" placeholder="Téléphone" value={editForm.phone || ""} onChange={handleEditChange} required style={inputStyle} />
          <input name="email" placeholder="Email" type="email" value={editForm.email || ""} onChange={handleEditChange} required style={inputStyle} />
          <button type="submit" style={btnStyle}>Save</button>
          <button type="button" onClick={handleBack} style={btnStyleSec}>Return</button>
          <div style={msgStyle}>{message}</div>
        </form>
      )}
    </div>
  );
}

// Styles
const btnStyle = {
  background: "#2b4c7e",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: 5,
  cursor: "pointer",
  marginBottom: 5
};
const btnStyleSec = {
  ...btnStyle,
  background: "#aaa"
};
const btnTable = {
  ...btnStyle,
  padding: "5px 10px",
  fontSize: "0.9em",
  marginRight: 5
};
const btnTableDel = {
  ...btnTable,
  background: "#c0392b"
};
const formStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  boxShadow: "0 1px 4px #ddd",
  marginBottom: 20
};
const inputStyle = {
  width: "100%",
  padding: 8,
  margin: "8px 0",
  borderRadius: 4,
  border: "1px solid #ccc"
};
const msgStyle = {
  color: "#c0392b",
  marginTop: 10
};

export default App;
