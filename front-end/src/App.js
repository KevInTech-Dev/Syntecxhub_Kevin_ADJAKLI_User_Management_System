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
    setMessage("Enregistrement en cours...");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Inscription réussie ! Vérifiez votre email pour l'OTP.");
        setOtpForm({ ...otpForm, email: registerForm.email });
        setStep("otp");
      } else {
        setMessage(data.msg || "Erreur lors de l'inscription.");
      }
    } catch {
      setMessage("Erreur serveur.");
    }
  };

  // Gestion du formulaire OTP
  const handleOtpChange = e => {
    setOtpForm({ ...otpForm, [e.target.name]: e.target.value });
  };

  const handleOtpSubmit = async e => {
    e.preventDefault();
    setMessage("Vérification...");
    try {
      const res = await fetch("http://localhost:3000/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otpForm)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.msg || "OTP vérifié, authentification réussie !");
        setStep("menu");
        fetchUsers();
      } else {
        setMessage(data.msg || "Échec de la vérification OTP.");
      }
    } catch {
      setMessage("Erreur serveur.");
    }
  };

  // Afficher la liste des utilisateurs
  const handleShowUsers = () => {
    if (users.length === 0) {
      setMessage("Aucun utilisateur inscrit pour le moment.");
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
    setMessage("Modification en cours...");
    try {
      const res = await fetch(`${API_URL}/${editForm._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Modification réussie !");
        setStep("menu");
        fetchUsers();
      } else {
        setMessage(data.msg || "Erreur lors de la modification.");
      }
    } catch {
      setMessage("Erreur serveur.");
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async user => {
    if (!window.confirm(`Supprimer ${user.name} ?`)) return;
    setMessage("Suppression en cours...");
    try {
      const res = await fetch(`${API_URL}/${user._id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMessage("Suppression réussie !");
        setStep("menu");
        fetchUsers();
      } else {
        setMessage(data.msg || "Erreur lors de la suppression.");
      }
    } catch {
      setMessage("Erreur serveur.");
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
          <button onClick={() => setStep("create")} style={btnStyle}>Créer un utilisateur</button>
          <button onClick={handleShowUsers} style={btnStyle}>Afficher les utilisateurs</button>
          <button
            onClick={() => users.length === 0 ? setMessage("Aucun utilisateur à modifier.") : setStep("list")}
            style={btnStyle}
          >Modifier un utilisateur</button>
          <button
            onClick={() => users.length === 0 ? setMessage("Aucun utilisateur à supprimer.") : setStep("list")}
            style={btnStyle}
          >Supprimer un utilisateur</button>
          {message && <div style={msgStyle}>{message}</div>}
        </div>
      )}

      {step === "create" && (
        <form onSubmit={handleRegisterSubmit} style={formStyle}>
          <h3>Créer un utilisateur</h3>
          <input name="name" placeholder="Nom" value={registerForm.name} onChange={handleRegisterChange} required style={inputStyle} />
          <input name="address" placeholder="Adresse" value={registerForm.address} onChange={handleRegisterChange} required style={inputStyle} />
          <input name="phone" placeholder="Téléphone" value={registerForm.phone} onChange={handleRegisterChange} required style={inputStyle} />
          <input name="email" placeholder="Email" type="email" value={registerForm.email} onChange={handleRegisterChange} required style={inputStyle} />
          <button type="submit" style={btnStyle}>S'inscrire</button>
          <button type="button" onClick={handleBack} style={btnStyleSec}>Retour</button>
          <div style={msgStyle}>{message}</div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} style={formStyle}>
          <h3>Vérification OTP</h3>
          <input name="email" placeholder="Email" type="email" value={otpForm.email} readOnly style={inputStyle} />
          <input name="otp" placeholder="OTP reçu par email" value={otpForm.otp} onChange={handleOtpChange} required style={inputStyle} />
          <button type="submit" style={btnStyle}>Vérifier OTP</button>
          <button type="button" onClick={handleBack} style={btnStyleSec}>Retour</button>
          <div style={msgStyle}>{message}</div>
        </form>
      )}

      {step === "list" && (
        <div>
          <h3>Liste des utilisateurs</h3>
          {users.length === 0 ? (
            <div style={msgStyle}>Aucun utilisateur inscrit pour le moment.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#e3eafc" }}>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
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
                      <button onClick={() => handleShowDetail(u)} style={btnTable}>Voir</button>
                      <button onClick={() => handleEditUser(u)} style={btnTable}>Modifier</button>
                      <button onClick={() => handleDeleteUser(u)} style={btnTableDel}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button onClick={handleBack} style={btnStyleSec}>Retour</button>
          <div style={msgStyle}>{message}</div>
        </div>
      )}

      {step === "detail" && selectedUser && (
        <div>
          <h3>Détail utilisateur</h3>
          <p><b>Nom :</b> {selectedUser.name}</p>
          <p><b>Adresse :</b> {selectedUser.address}</p>
          <p><b>Email :</b> {selectedUser.email}</p>
          <p><b>Téléphone :</b> {selectedUser.phone}</p>
          <button onClick={handleBack} style={btnStyleSec}>Retour</button>
        </div>
      )}

      {step === "edit" && (
        <form onSubmit={handleEditSubmit} style={formStyle}>
          <h3>Modifier utilisateur</h3>
          <input name="name" placeholder="Nom" value={editForm.name || ""} onChange={handleEditChange} required style={inputStyle} />
          <input name="address" placeholder="Adresse" value={editForm.address || ""} onChange={handleEditChange} required style={inputStyle} />
          <input name="phone" placeholder="Téléphone" value={editForm.phone || ""} onChange={handleEditChange} required style={inputStyle} />
          <input name="email" placeholder="Email" type="email" value={editForm.email || ""} onChange={handleEditChange} required style={inputStyle} />
          <button type="submit" style={btnStyle}>Enregistrer</button>
          <button type="button" onClick={handleBack} style={btnStyleSec}>Retour</button>
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