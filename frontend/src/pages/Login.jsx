import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { data } = await login({ email, password });
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/home");
    } catch (err) { alert(err.response.data.msg); }
  };

  return (
    <div>
      <h1>Login</h1>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <Link to="/register">Register</Link>
    </div>
  );
}
