"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function AICareerPage() {
  const [interests, setInterests] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!interests) return;

    setLoading(true);
    setResult("");

    const res = await fetch("/api/career", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ interests }),
    });

    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 p-6 flex items-center justify-center"
    >
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6">

        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Sparkles className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800">
            مشاور هوشمند انتخاب شغل
          </h1>
          <p className="text-sm text-slate-500">
            علایق، مهارت‌ها و روحیات خود را بنویسید تا بهترین پیشنهادها را دریافت کنید
          </p>
        </div>

        <textarea
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="مثلاً: من به کارهای فنی علاقه دارم، از کار با کامپیوتر لذت می‌برم، کار تیمی را دوست دارم..."
          className="w-full min-h-[160px] p-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              در حال تحلیل...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              دریافت پیشنهاد شغلی
            </>
          )}
        </button>

        {result && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 whitespace-pre-wrap leading-8 text-sm text-slate-700">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
