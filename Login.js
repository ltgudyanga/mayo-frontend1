import React, { useState } from "react";

function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";

    try {
      const response = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      }
    } catch (err) {
      setError(err.message || "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "100px auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
      <h2 style={{ color: "#006400", textAlign: "center" }}>Mayo AI Login</h2>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
          required 
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: "12px", backgroundColor: "#006400", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "Logging in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default Login;