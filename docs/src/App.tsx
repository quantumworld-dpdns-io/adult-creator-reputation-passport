import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import {
  DotMatrixText,
  NothingButton,
  NothingCard,
  PillBadge,
  DottedDivider,
  BarcodeGenerator,
  RadarScan,
  ProgressDots,
  SegmentedDisplay,
  TerminalPrompt,
  GlitchText,
} from "@dennislee928/nothingx-react-components";
import { HomePage } from "./pages/Home";
import { ArchitecturePage } from "./pages/Architecture";
import { ContractsPage } from "./pages/Contracts";
import { ApiPage } from "./pages/Api";
import { DeploymentPage } from "./pages/Deployment";
import { SecurityPage } from "./pages/Security";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/architecture", label: "Architecture" },
  { path: "/contracts", label: "Smart Contracts" },
  { path: "/api", label: "API" },
  { path: "/deployment", label: "Deployment" },
  { path: "/security", label: "Security" },
];

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div style={{
      background: "#000",
      color: "#fff",
      minHeight: "100vh",
      fontFamily: "'Courier New', 'VT323', 'Fira Code', monospace",
      padding: "0 24px 48px",
    }}>
      <header style={{
        borderBottom: "1px solid #333",
        padding: "16px 0",
        marginBottom: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div>
          <DotMatrixText text="REPUTATION PASSPORT" />
          <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
            Adult Creator · Soulbound Credentials · PQC Quantum
          </div>
        </div>
        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={{ textDecoration: "none" }}
            >
              <NothingButton
                active={location.pathname === item.path}
                style={{ fontSize: 11, padding: "4px 12px" }}
              >
                {item.label}
              </NothingButton>
            </NavLink>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer style={{
        marginTop: 64,
        borderTop: "1px solid #333",
        paddingTop: 16,
        fontSize: 11,
        color: "#555",
        textAlign: "center",
      }}>
        <BarcodeGenerator value="REP-PASS-2026" />
        <div style={{ marginTop: 8 }}>
          Adult Creator Reputation Passport &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/api" element={<ApiPage />} />
        <Route path="/deployment" element={<DeploymentPage />} />
        <Route path="/security" element={<SecurityPage />} />
      </Routes>
    </Layout>
  );
}
