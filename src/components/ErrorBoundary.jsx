import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error: error.message };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ background: "#090c08", color: "#fff", padding: 20, fontFamily: "sans-serif", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 24, color: "#e8a838" }}>FOGEAT</div>
          <div style={{ fontSize: 12, color: "#888", textAlign: "center" }}>{this.state.error}</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: 10, padding: "8px 20px", background: "#3d6b25", border: "none", color: "#fff", borderRadius: 8, cursor: "pointer" }}>Обновить</button>
        </div>
      );
    }

    return this.props.children;
  }
}
