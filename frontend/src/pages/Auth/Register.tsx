import { FormEvent, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";

const Register = () => {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", credential.user.uid), {
        uid: credential.user.uid,
        name,
        department,
        role: "faculty",
        email,
      });
      navigate("/dashboard");
    } catch {
      setError("Could not create account. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-panel">
        <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} required />
          <input className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="Department" value={department} onChange={(event) => setDepartment(event.target.value)} required />
          <input type="email" className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input type="password" className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white disabled:bg-brand-300">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-semibold text-brand-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
