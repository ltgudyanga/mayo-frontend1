import React, { useState, useEffect, useCallback } from "react";

function Dashboard({ token, setToken }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ type: "inflow", description: "", amount: "", currency: "USD", date: new Date().toISOString().split('T')[0] });

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 403 || response.status === 401) {
        handleLogout();
        return;
      }
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, apiUrl]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/transactions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ ...formData, amount: parseInt(formData.amount) * 100 }), // convert to cents
      });
      if (response.ok) {
        setFormData({ type: "inflow", description: "", amount: "", currency: "USD", date: new Date().toISOString().split('T')[0] });
        fetchTransactions();
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const total = transactions.reduce((acc, curr) => {
    const amt = curr.amount_cents / 100;
    return curr.type === 'inflow' ? acc + amt : acc - amt;
  }, 0);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "#006400" }}>Financial Health Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: "5px 15px", cursor: "pointer" }}>Logout</button>
      </div>

      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <h3>Current Balance: <span style={{ color: total >= 0 ? "green" : "red" }}>${total.toFixed(2)}</span></h3>
      </div>

      <div style={{ backgroundColor: "#e8f5e9", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h4>Add Transaction</h4>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
            <option value="inflow">Inflow (Income)</option>
            <option value="outflow">Outflow (Expense)</option>
          </select>
          <input type="text" placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
          <input type="number" placeholder="Amount" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
          <button type="submit" style={{ gridColumn: "span 3", padding: "10px", backgroundColor: "#006400", color: "white", border: "none", borderRadius: "4px" }}>Save Transaction</button>
        </form>
      </div>

      <h4>Recent Transactions</h4>
      {loading ? <p>Loading...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd" }}>
              <th align="left">Date</th>
              <th align="left">Description</th>
              <th align="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td>{t.description}</td>
                <td align="right" style={{ color: t.type === 'inflow' ? "green" : "red" }}>
                  {t.type === 'inflow' ? "+" : "-"}${ (t.amount_cents / 100).toFixed(2) }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;