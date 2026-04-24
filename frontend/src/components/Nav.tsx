import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="nav">
      <div className="brand">
        <Link to="/">Market AI Platform</Link>
      </div>
      <div className="links">
        {user ? (
          <>
            <span className="muted">
              {user.email} <span className="pill">{user.plan}</span>
            </span>
            <Link to="/billing">Billing</Link>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
