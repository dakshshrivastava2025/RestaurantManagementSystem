import { useMemo, useState } from "react";
import {
  ADMINS,
  CREW,
  CUSTOMERS,
  HOURLY_SALES,
  INITIAL_LOGS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_TABLES,
  MENU,
} from "./data";

const CATEGORIES = ["All", "Starters", "Main Course", "Drinks", "Rolls", "Thalis"];
const TABLE_STATUSES = ["Available", "Occupied", "Food Served", "Billing"];

function nextId(prefix, list, key) {
  const nums = list.map((row) => Number(String(row[key]).replace(/\D/g, "")) || 0);
  return `${prefix}${Math.max(0, ...nums) + 1}`;
}

function lineTotal(item) {
  return item.I_price * item.qty;
}

export default function App() {
  const [role, setRole] = useState("customer");
  const [menu, setMenu] = useState(MENU);
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [crew, setCrew] = useState(CREW);
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [cart, setCart] = useState([]);
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("All");
  const [feedback, setFeedback] = useState(null);
  const [waiterId, setWaiterId] = useState("W01");
  const [activeTable, setActiveTable] = useState(1);
  const [adminTab, setAdminTab] = useState("menu");

  // Authentication State
  const [waiterAuth, setWaiterAuth] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);

  // Login inputs
  const [loginWaiterId, setLoginWaiterId] = useState("W01");
  const [loginWaiterPass, setLoginWaiterPass] = useState("");
  const [loginAdminName, setLoginAdminName] = useState("arnav");
  const [loginAdminPass, setLoginAdminPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleWaiterLogin = (e) => {
    e.preventDefault();
    const staff = crew.find(
      (c) => c.crew_ID.toLowerCase() === loginWaiterId.trim().toLowerCase()
    );
    if (staff && staff.password === loginWaiterPass) {
      setWaiterId(staff.crew_ID);
      setWaiterAuth(true);
      setLoginError("");
      setLoginWaiterPass("");
    } else {
      setLoginError("Invalid Waiter ID or Password.");
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const admin = ADMINS.find(
      (a) => a.name.toLowerCase() === loginAdminName.trim().toLowerCase()
    );
    if (admin && admin.password === loginAdminPass) {
      setAdminAuth(true);
      setLoginError("");
      setLoginAdminPass("");
    } else {
      setLoginError("Invalid Admin Name or Password.");
    }
  };

  const addLog = (message) => {
    const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
    setLogs((prev) => [{ ts, message }, ...prev].slice(0, 24));
  };

  const visibleMenu = menu.filter((item) => category === "All" || item.category === category);

  const cartTotal = cart.reduce((sum, item) => sum + lineTotal(item), 0);

  const setQty = (food, qty) => {
    setCart((prev) => {
      const next = prev.filter((row) => row.food_id !== food.food_id);
      if (qty <= 0) return next;
      return [...next, { food_id: food.food_id, name: food.name, I_price: food.I_price, qty }];
    });
  };

  const checkout = () => {
    if (!cart.length) return;
    const P_no = phone.replace(/\D/g, "");
    if (P_no.length < 10) {
      window.alert("Enter a 10-digit customer phone (P_no) to identify the order.");
      return;
    }
    let customer = customers.find((c) => c.P_no === P_no);
    if (!customer) {
      customer = { cust_id: nextId("C", customers, "cust_id"), name: "Guest", P_no, feedback: "No feedback provided yet." };
      setCustomers((prev) => [...prev, customer]);
      addLog(`INSERT · Customer ${customer.cust_id} P_no ${P_no}`);
    }
    const order_id = nextId("O", orders, "order_id");
    const O_price = cartTotal;
    const table = tables.find((t) => t.status === "Available") || tables[0];
    const newOrder = {
      order_id,
      table_no: table.table_no,
      crew_id: waiterId,
      cust_id: customer.cust_id,
      P_no,
      status: "Occupied",
      items: cart.map((row) => ({ food_id: row.food_id, qty: row.qty, I_price: row.I_price })),
      O_price,
    };
    setOrders((prev) => [newOrder, ...prev]);
    setTables((prev) =>
      prev.map((t) =>
        t.table_no === table.table_no
          ? { ...t, status: "Occupied", order_id, crew_id: waiterId }
          : t
      )
    );
    setPayments((prev) => [
      {
        pay_id: nextId("P", prev, "pay_id"),
        order_id,
        amount: O_price,
        hour: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        method: "UPI",
      },
      ...prev,
    ]);
    addLog(`BEGIN · insert Order Details ${order_id}`);
    addLog(`COMMIT · ${order_id} O_price ${O_price} cust_id ${customer.cust_id} table ${table.table_no}`);
    setFeedback({
      feedback_id: `FB${order_id.slice(1)}`,
      order_id,
      cust_id: customer.cust_id,
      stars: 5,
      comment: "",
    });
    setCart([]);
  };

  const submitFeedback = () => {
    const feedbackText = feedback.comment
      ? `[${feedback.stars}★] ${feedback.comment}`
      : `[${feedback.stars}★] Rated ${feedback.stars} out of 5 stars`;

    setCustomers((prev) =>
      prev.map((c) =>
        c.cust_id === feedback.cust_id ? { ...c, feedback: feedbackText } : c
      )
    );

    addLog(
      `INSERT · Feedback ${feedback.feedback_id} order_id ${feedback.order_id} cust_id ${feedback.cust_id} rating ${feedback.stars}`
    );
    setFeedback(null);
  };

  const tableOrder = orders.find((o) => o.table_no === activeTable && o.status !== "Available");
  const selectedTable = tables.find((t) => t.table_no === activeTable);

  const updateTableStatus = (status) => {
    setTables((prev) =>
      prev.map((t) => (t.table_no === activeTable ? { ...t, status, crew_id: waiterId } : t))
    );
    setOrders((prev) =>
      prev.map((o) =>
        o.table_no === activeTable && o.order_id === selectedTable?.order_id
          ? { ...o, status, crew_id: waiterId }
          : o
      )
    );
    addLog(`UPDATE · Order Details status=${status} table ${activeTable} crew_id ${waiterId}`);
  };

  const addWaiterItem = (food) => {
    let order = orders.find((o) => o.table_no === activeTable && o.order_id === selectedTable?.order_id);
    if (!order || selectedTable.status === "Available") {
      const order_id = nextId("O", orders, "order_id");
      order = {
        order_id,
        table_no: activeTable,
        crew_id: waiterId,
        cust_id: "WALK",
        P_no: "",
        status: "Occupied",
        items: [{ food_id: food.food_id, qty: 1, I_price: food.I_price }],
        O_price: food.I_price,
      };
      setOrders((prev) => [order, ...prev]);
      setTables((prev) =>
        prev.map((t) =>
          t.table_no === activeTable
            ? { ...t, status: "Occupied", order_id, crew_id: waiterId }
            : t
        )
      );
      addLog(`BEGIN · waiter order ${order_id} table ${activeTable}`);
      addLog(`COMMIT · ${order_id} crew_id ${waiterId}`);
      return;
    }
    const existing = order.items.find((i) => i.food_id === food.food_id);
    const items = existing
      ? order.items.map((i) => (i.food_id === food.food_id ? { ...i, qty: i.qty + 1 } : i))
      : [...order.items, { food_id: food.food_id, qty: 1, I_price: food.I_price }];
    const O_price = items.reduce((sum, i) => sum + i.I_price * i.qty, 0);
    setOrders((prev) => prev.map((o) => (o.order_id === order.order_id ? { ...o, items, O_price, crew_id: waiterId } : o)));
    addLog(`UPDATE · ${order.order_id} add ${food.food_id} O_price=${O_price}`);
  };

  const removeWaiterItem = (foodId) => {
    const order = orders.find((o) => o.table_no === activeTable && o.order_id === selectedTable?.order_id);
    if (!order) return;

    const existing = order.items.find((i) => i.food_id === foodId);
    if (!existing) return;

    let items;
    if (existing.qty > 1) {
      items = order.items.map((i) => (i.food_id === foodId ? { ...i, qty: i.qty - 1 } : i));
    } else {
      items = order.items.filter((i) => i.food_id !== foodId);
    }

    const O_price = items.reduce((sum, i) => sum + i.I_price * i.qty, 0);
    setOrders((prev) => prev.map((o) => (o.order_id === order.order_id ? { ...o, items, O_price, crew_id: waiterId } : o)));
    addLog(`UPDATE · ${order.order_id} remove ${foodId} O_price=${O_price}`);
  };

  const dailySales = payments.reduce((sum, p) => sum + p.amount, 0);
  const popular = useMemo(() => {
    const counts = {};
    orders.forEach((o) =>
      o.items.forEach((i) => {
        counts[i.food_id] = (counts[i.food_id] || 0) + i.qty;
      })
    );
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const dish = menu.find((m) => m.food_id === top?.[0]);
    return dish?.name || "—";
  }, [orders, menu]);

  const maxBar = Math.max(...HOURLY_SALES.map((h) => h.value));
  const waiter = crew.find((c) => c.crew_ID === waiterId);

  return (
    <div>
      <div className="ribbon">
        Chikuwa · role-based service for dining room, floor, and finance.{" "}
        <a href="#catalog">See tonight’s menu →</a>
      </div>
      <nav className="nav">
        <span className="nav-logo">Chikuwa</span>
        <div className="nav-roles">
          <button className={role === "customer" ? "active" : ""} onClick={() => setRole("customer")}>
            Customer
          </button>
          <button className={role === "waiter" ? "active" : ""} onClick={() => setRole("waiter")}>
            Waiter
          </button>
          <button className={role === "admin" ? "active" : ""} onClick={() => setRole("admin")}>
            Admin
          </button>
        </div>
      </nav>

      {role === "customer" && (
        <main className="shell">
          <section className="hero band-white">
            <p className="eyebrow">Chikuwa</p>
            <p className="nuevo">Nuevo</p>
            <h1>Order with intent.</h1>
            <button className="pill pill-primary" onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}>
              Browse menu
            </button>
            <p>From ₹4 · identified by phone · live cart totals.</p>
          </section>

          <section className="band band-gray" id="catalog">
            <div className="wrap layout-2">
              <div>
                <div className="section-header">
                  <h2>The catalog.</h2>
                  <p>Food Info and Menu, with category tags and I_price on every plate.</p>
                </div>
                <div className="filters">
                  {CATEGORIES.map((c) => (
                    <button key={c} className={`filter-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className="catalog-grid">
                  {visibleMenu.map((item) => {
                    const qty = cart.find((c) => c.food_id === item.food_id)?.qty || 0;
                    return (
                      <article className="food-card" key={item.food_id}>
                        <img src={item.image} alt={item.name} width="400" height="220" />
                        <div className="food-card-body">
                          <span className="filter-chip">{item.category}</span>
                          <h3>{item.name}</h3>
                          <p style={{ color: "#C5A059", margin: "0 0 8px" }}>{item.description}</p>
                          <div className="price">{item.I_price.toFixed(2)} ₹</div>
                          <div className="qty-row">
                            <button onClick={() => setQty(item, qty - 1)} aria-label="Decrease">
                              −
                            </button>
                            <span>{qty}</span>
                            <button onClick={() => setQty(item, qty + 1)} aria-label="Increase">
                              +
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
              <aside className="card">
                <h2 style={{ fontSize: 28, letterSpacing: "0.007em" }}>Live cart</h2>
                <p style={{ color: "#C5A059" }}>O_price = I_price × Quantity</p>
                {cart.length === 0 && <p style={{ color: "#DAA520" }}>Your table is empty.</p>}
                {cart.map((row) => (
                  <div className="cart-line" key={row.food_id}>
                    <span>
                      {row.name} × {row.qty}
                    </span>
                    <span>{lineTotal(row).toFixed(2)} ₹</span>
                  </div>
                ))}
                <div className="cart-total">
                  <span>O_price</span>
                  <span>{cartTotal.toFixed(2)} ₹</span>
                </div>
                <div className="field">
                  <label htmlFor="pno">Customer phone · P_no</label>
                  <input id="pno" inputMode="numeric" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <button className="pill pill-primary" onClick={checkout} disabled={!cart.length}>
                  Checkout
                </button>
              </aside>
            </div>
          </section>
        </main>
      )}

      {role === "waiter" && !waiterAuth && (
        <main className="shell">
          <section className="band band-white" style={{ display: "flex", justifyContent: "center", padding: "60px 20px" }}>
            <div className="card" style={{ maxWidth: 420, width: "100%", padding: 32 }}>
              <span className="nuevo">Staff Portal</span>
              <h2 style={{ fontSize: 32, margin: "8px 0 16px" }}>Waiter Login</h2>
              <p style={{ color: "#C5A059", marginBottom: 20 }}>Enter your Waiter ID and Password to manage table tickets.</p>
              {loginError && <p style={{ color: "#ff6b6b", marginBottom: 16 }}>{loginError}</p>}
              <form onSubmit={handleWaiterLogin}>
                <div className="field">
                  <label>Waiter ID</label>
                  <select value={loginWaiterId} onChange={(e) => setLoginWaiterId(e.target.value)}>
                    {crew.map((c) => (
                      <option key={c.crew_ID} value={c.crew_ID}>
                        {c.crew_ID} · {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={loginWaiterPass}
                    onChange={(e) => setLoginWaiterPass(e.target.value)}
                  />
                </div>
                <button type="submit" className="pill pill-primary" style={{ width: "100%", marginTop: 12 }}>
                  Unlock Floor Control
                </button>
              </form>
            </div>
          </section>
        </main>
      )}

      {role === "waiter" && waiterAuth && (
        <main className="shell">
          <section className="band band-white">
            <div className="wrap">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="section-header" style={{ marginBottom: 0 }}>
                  <h2>The floor.</h2>
                  <p>Logged in as: <strong>{waiter?.name} ({waiterId})</strong></p>
                </div>
                <button className="pill pill-ghost pill-small" onClick={() => setWaiterAuth(false)}>
                  Lock & Log out
                </button>
              </div>
              <div className="legend" style={{ marginTop: 24 }}>
                <span>
                  <i className="dot" style={{ background: "var(--status-available)" }} />
                  Available
                </span>
                <span>
                  <i className="dot" style={{ background: "var(--status-occupied)" }} />
                  Occupied / Ordering
                </span>
                <span>
                  <i className="dot" style={{ background: "var(--status-served)" }} />
                  Food Served
                </span>
                <span>
                  <i className="dot" style={{ background: "var(--status-billing)" }} />
                  Billing
                </span>
              </div>
              <div className="floor-grid">
                {tables.map((table) => {
                  const cls =
                    table.status === "Available"
                      ? "table-available"
                      : table.status === "Occupied"
                        ? "table-occupied"
                        : table.status === "Food Served"
                          ? "table-served"
                          : "table-billing";
                  return (
                    <button
                      key={table.table_no}
                      className={`table-tile ${cls}`}
                      onClick={() => setActiveTable(table.table_no)}
                    >
                      <h3>Table {table.table_no}</h3>
                      <div className="status">{table.status}</div>
                      <div style={{ fontSize: 12, marginTop: 8, color: "#DAA520" }}>
                        {table.order_id || "No ticket"} · {table.crew_id || "Unassigned"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
          <section className="band band-gray">
            <div className="wrap layout-2">
              <div className="card">
                <h2 style={{ fontSize: 28 }}>Quick order</h2>
                <p style={{ color: "#C5A059" }}>
                  Table {activeTable} · tap Food Info to add quantity
                </p>
                <div className="quick-order">
                  {menu.map((item) => (
                    <button key={item.food_id} className="quick-item" onClick={() => addWaiterItem(item)}>
                      <strong>{item.name}</strong>
                      <div>
                        {item.I_price.toFixed(2)} ₹ · {item.category}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="card card-muted">
                <h2 style={{ fontSize: 28 }}>Assignment</h2>
                <div className="field">
                  <label>Logged-in crew</label>
                  <select value={waiterId} onChange={(e) => setWaiterId(e.target.value)}>
                    {crew.map((c) => (
                      <option key={c.crew_ID} value={c.crew_ID}>
                        {c.crew_ID} · {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p>
                  {waiter?.name} is tied to active tickets via crew_id.
                </p>
                {tableOrder ? (
                  <>
                    <p>
                      {tableOrder.order_id} · O_price {tableOrder.O_price.toFixed(2)} ₹
                    </p>
                    {tableOrder.items.map((i) => {
                      const food = menu.find((m) => m.food_id === i.food_id);
                      return (
                        <div className="cart-line" key={i.food_id} style={{ alignItems: "center" }}>
                          <span>
                            {food?.name} × {i.qty}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span>{(i.I_price * i.qty).toFixed(2)} ₹</span>
                            <button
                              onClick={() => removeWaiterItem(i.food_id)}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                border: "1px solid rgba(212, 175, 55, 0.4)",
                                background: "transparent",
                                color: "#D4AF37",
                                cursor: "pointer",
                                fontSize: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s ease"
                              }}
                              onMouseOver={(e) => {
                                e.target.style.background = "rgba(212, 175, 55, 0.1)";
                                e.target.style.borderColor = "#D4AF37";
                              }}
                              onMouseOut={(e) => {
                                e.target.style.background = "transparent";
                                e.target.style.borderColor = "rgba(212, 175, 55, 0.4)";
                              }}
                            >
                              −
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p style={{ color: "#C5A059" }}>No active order on this table.</p>
                )}
                <div className="filters">
                  {TABLE_STATUSES.map((s) => (
                    <button key={s} className="filter-chip" onClick={() => updateTableStatus(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {role === "admin" && !adminAuth && (
        <main className="shell">
          <section className="band band-white" style={{ display: "flex", justifyContent: "center", padding: "60px 20px" }}>
            <div className="card" style={{ maxWidth: 420, width: "100%", padding: 32 }}>
              <span className="nuevo">Management Console</span>
              <h2 style={{ fontSize: 32, margin: "8px 0 16px" }}>Admin Verification</h2>
              <p style={{ color: "#C5A059", marginBottom: 20 }}>Enter Admin Name and Password to access store management.</p>
              {loginError && <p style={{ color: "#ff6b6b", marginBottom: 16 }}>{loginError}</p>}
              <form onSubmit={handleAdminLogin}>
                <div className="field">
                  <label>Admin Name</label>
                  <select value={loginAdminName} onChange={(e) => setLoginAdminName(e.target.value)}>
                    <option value="arnav">arnav</option>
                    <option value="daksh">daksh</option>
                  </select>
                </div>
                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={loginAdminPass}
                    onChange={(e) => setLoginAdminPass(e.target.value)}
                  />
                </div>
                <button type="submit" className="pill pill-primary" style={{ width: "100%", marginTop: 12 }}>
                  Login to Admin
                </button>
              </form>
            </div>
          </section>
        </main>
      )}

      {role === "admin" && adminAuth && (
        <main className="shell">
          <section className="band band-white">
            <div className="wrap">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="section-header" style={{ marginBottom: 0 }}>
                  <h2>The house numbers.</h2>
                  <p>Logged in as Admin: <strong>{loginAdminName}</strong></p>
                </div>
                <button className="pill pill-ghost pill-small" onClick={() => setAdminAuth(false)}>
                  Lock & Log out
                </button>
              </div>
              <div className="stats" style={{ marginTop: 32 }}>
                <article className="card card-muted">
                  <span className="nuevo">Today</span>
                  <div className="stat-value">{dailySales.toFixed(0)} ₹</div>
                  <p style={{ color: "#C5A059", margin: 0 }}>Daily sales</p>
                </article>
                <article className="card card-muted">
                  <span className="nuevo">Peak</span>
                  <div className="stat-value">19:00</div>
                  <p style={{ color: "#C5A059", margin: 0 }}>Busiest hour</p>
                </article>
                <article className="card card-muted">
                  <span className="nuevo">Kitchen</span>
                  <div className="stat-value" style={{ fontSize: 32 }}>
                    {popular}
                  </div>
                  <p style={{ color: "#C5A059", margin: 0 }}>Popular dish</p>
                </article>
              </div>
              <div className="card" style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 21 }}>Hourly revenue</h3>
                <div className="bars">
                  {HOURLY_SALES.map((h) => (
                    <div key={h.hour} style={{ flex: 1 }}>
                      <div className="bar" style={{ height: `${(h.value / maxBar) * 160}px` }} />
                      <div className="bar-label">{h.hour}h</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section className="band band-gray">
            <div className="wrap">
              <div className="tabs">
                {["menu", "crew", "customers", "logs"].map((tab) => (
                  <button
                    key={tab}
                    className={`pill ${adminTab === tab ? "pill-primary" : "pill-ghost"} pill-small`}
                    onClick={() => setAdminTab(tab)}
                  >
                    {tab === "menu" ? "Menu" : tab === "crew" ? "Crew" : tab === "customers" ? "Customers" : "System logs"}
                  </button>
                ))}
              </div>

              {adminTab === "menu" && (
                <div className="card">
                  <h2 style={{ fontSize: 28, marginBottom: 16 }}>Menu CRUD</h2>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>food_id</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {menu.map((item, idx) => (
                          <tr key={item.food_id}>
                            <td>{item.food_id}</td>
                            <td>
                              <input
                                value={item.name}
                                onChange={(e) =>
                                  setMenu((prev) => prev.map((m, i) => (i === idx ? { ...m, name: e.target.value } : m)))
                                }
                              />
                            </td>
                            <td>
                              <select
                                value={item.category}
                                onChange={(e) =>
                                  setMenu((prev) =>
                                    prev.map((m, i) => (i === idx ? { ...m, category: e.target.value } : m))
                                  )
                                }
                              >
                                <option>Starters</option>
                                <option>Main Course</option>
                                <option>Drinks</option>
                                <option>Rolls</option>
                                <option>Thalis</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                value={item.I_price}
                                onChange={(e) => {
                                  const I_price = Number(e.target.value);
                                  setMenu((prev) => prev.map((m, i) => (i === idx ? { ...m, I_price } : m)));
                                  addLog(`UPDATE · Food Info ${item.food_id} I_price ${I_price}`);
                                }}
                              />
                            </td>
                            <td>
                              <button
                                className="arrow-link"
                                onClick={() => {
                                  setMenu((prev) => prev.filter((m) => m.food_id !== item.food_id));
                                  addLog(`DELETE · Food Info ${item.food_id}`);
                                }}
                              >
                                Remove →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    className="pill pill-ghost"
                    style={{ marginTop: 16 }}
                    onClick={() => {
                      const food_id = nextId("F", menu, "food_id");
                      setMenu((prev) => [
                        ...prev,
                        {
                          food_id,
                          name: "New dish",
                          category: "Starters",
                          I_price: 100,
                          description: "Add tasting notes.",
                          image:
                            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
                        },
                      ]);
                      addLog(`INSERT · Food Info ${food_id}`);
                    }}
                  >
                    Add item
                  </button>
                </div>
              )}

              {adminTab === "crew" && (
                <div className="card">
                  <h2 style={{ fontSize: 28, marginBottom: 16 }}>Crew</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>crew_ID</th>
                        <th>Name</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crew.map((c, idx) => (
                        <tr key={c.crew_ID}>
                          <td>{c.crew_ID}</td>
                          <td>
                            <input
                              value={c.name}
                              onChange={(e) =>
                                setCrew((prev) => prev.map((row, i) => (i === idx ? { ...row, name: e.target.value } : row)))
                              }
                            />
                          </td>
                          <td>
                            <input
                              value={c.role}
                              onChange={(e) =>
                                setCrew((prev) => prev.map((row, i) => (i === idx ? { ...row, role: e.target.value } : row)))
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    className="pill pill-ghost"
                    style={{ marginTop: 16 }}
                    onClick={() => {
                      const crew_ID = nextId("W", crew, "crew_ID");
                      setCrew((prev) => [...prev, { crew_ID, name: "New staff", role: "Waiter" }]);
                      addLog(`INSERT · Crew ${crew_ID}`);
                    }}
                  >
                    Add crew
                  </button>
                </div>
              )}

              {adminTab === "customers" && (
                <div className="card">
                  <h2 style={{ fontSize: 28, marginBottom: 16 }}>Customer Log & Feedback</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>cust_id</th>
                        <th>Name</th>
                        <th>P_no</th>
                        <th>Feedback & Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c, idx) => (
                        <tr key={c.cust_id}>
                          <td>{c.cust_id}</td>
                          <td>
                            <input
                              value={c.name}
                              onChange={(e) =>
                                setCustomers((prev) =>
                                  prev.map((row, i) => (i === idx ? { ...row, name: e.target.value } : row))
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              value={c.P_no}
                              onChange={(e) =>
                                setCustomers((prev) =>
                                  prev.map((row, i) => (i === idx ? { ...row, P_no: e.target.value } : row))
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              style={{ width: "100%", minWidth: "220px" }}
                              placeholder="Customer review or feedback..."
                              value={c.feedback || ""}
                              onChange={(e) =>
                                setCustomers((prev) =>
                                  prev.map((row, i) => (i === idx ? { ...row, feedback: e.target.value } : row))
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {adminTab === "logs" && (
                <div className="card">
                  <h2 style={{ fontSize: 28, marginBottom: 16 }}>System logs</h2>
                  <p style={{ color: "#C5A059" }}>
                    Live tracker for order entries and inventory adjustments. BEGIN/COMMIT pairs stay visible so the
                    demo can speak to ACID.
                  </p>
                  <div className="logs">
                    {logs.map((log, i) => (
                      <div className="log-row" key={`${log.ts}-${i}`}>
                        <span>{log.ts}</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      <footer className="footer">
        <div className="wrap">
          Demo data only. Schema fields map to Food Info, Menu, Order Details, Crew, Customer, Payment, and
          Transaction Report.{" "}
          <a href="#catalog">Review the catalog</a>
        </div>
      </footer>

      {feedback && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <p className="nuevo">After checkout</p>
            <h2 style={{ fontSize: 40, lineHeight: 1.14, margin: "8px 0 12px" }}>How was service?</h2>
            <p style={{ color: "#C5A059" }}>
              {feedback.feedback_id} · order {feedback.order_id} · customer {feedback.cust_id}
            </p>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={n <= feedback.stars ? "on" : ""}
                  onClick={() => setFeedback({ ...feedback, stars: n })}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="field">
              <label>Comment</label>
              <textarea
                rows={3}
                value={feedback.comment}
                onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
              />
            </div>
            <button className="pill pill-primary" onClick={submitFeedback}>
              Send feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
