import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const { data } = await register({ name, email, password });
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/home");
    } catch (err) { alert(err.response.data.msg); }
  };

  return (
    <div>
      <h1>Register</h1>
      <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
      <Link to="/">Login</Link>
    </div>
  );
}
