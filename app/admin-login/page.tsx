"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (password === "mahart123") {
      router.push("/admin");
    } else {
      alert("رمز اشتباه است");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-6">ورود ادمین</h2>

        <input
          type="password"
          placeholder="رمز عبور"
          className="input mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700"
        >
          ورود به پنل
        </button>
      </div>

      <style jsx>{`
        .input {
          height: 48px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          padding: 0 16px;
          font-size: 14px;
          outline: none;
        }
      `}</style>
    </div>
  );
}
