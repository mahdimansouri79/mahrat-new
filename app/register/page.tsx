"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  UserPlus,
  CalendarDays,
  Search,
  Eye,
  Bell,
  CheckCircle2,
  LogIn,
  ShieldCheck,
  BookOpen,
  PenTool,
  Camera,
} from "lucide-react";

// داده‌های کمکی برای منوها
const tabs = [
  { label: "ثبت نام", icon: UserPlus },
  ];

const months = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
const birthYears = Array.from({ length: 46 }, (_, i) => 1350 + i);
const dispatchYears = Array.from({ length: 16 }, (_, i) => 1390 + i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState("ثبت نام");
  const [error, setError] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [loading, setLoading] = useState(false);

  // لود کردن لیست دوره‌ها از حافظه
  useEffect(() => {
  const loadCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("title")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD COURSES ERROR:", error);
      return;
    }

    const courseTitles = (data || []).map((item) => item.title);
    setCourses(courseTitles);
  };

  loadCourses();
}, []);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // گرفتن اطلاعات فرم
      const firstName = (formData.get("firstName") as string)?.trim();
      const lastName = (formData.get("lastName") as string)?.trim();
      const fatherName = (formData.get("fatherName") as string)?.trim();
      const nationalId = (formData.get("nationalCode") as string)?.trim();
      const phone = (formData.get("phone") as string)?.trim();
      const address = (formData.get("address") as string)?.trim();
      const degree = (formData.get("degree") as string)?.trim();
      const major = (formData.get("major") as string)?.trim();
      const priority1 = (formData.get("priority1") as string)?.trim();
      const priority2 = (formData.get("priority2") as string)?.trim();
      const priority3 = (formData.get("priority3") as string)?.trim();
      const experience = (formData.get("experience") as string)?.trim();

      const bDay = (formData.get("bDay") as string)?.trim();
      const bMonth = (formData.get("bMonth") as string)?.trim();
      const bYear = (formData.get("bYear") as string)?.trim();

      const dispatchMonth = (formData.get("dispatchMonth") as string)?.trim();
      const dispatchYear = (formData.get("dispatchYear") as string)?.trim();

      const photo = formData.get("photo") as File | null;

      // اعتبارسنجی عکس
      if (!photo || photo.size === 0) {
        setError("بارگذاری عکس پرسنلی برای صدور گواهی الزامی است");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setLoading(false);
        return;
      }

      // اعتبارسنجی کد ملی
      if (!nationalId || nationalId.length !== 10) {
        setError("کد ملی باید 10 رقم باشد");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setLoading(false);
        return;
      }

      // محدودیت حجم فایل - 300KB
      if (photo.size > 300 * 1024) {
        setError("حجم عکس باید کمتر از ۳۰۰ کیلوبایت باشد");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setLoading(false);
        return;
      }

      // ساخت تاریخ تولد
      const birthDate = `${bYear}/${bMonth}/${bDay}`;

      // ساخت تاریخ اعزام
      const dispatchDate =
        dispatchYear && dispatchMonth ? `${dispatchYear}/${dispatchMonth}` : null;

      // ساخت نام و مسیر فایل
      const fileExt = photo.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ["jpg", "jpeg", "png", "webp"].includes(fileExt)
        ? fileExt
        : "jpg";

      const fileName = `photo.${safeExt}`;
      const filePath = `${nationalId}/${fileName}`;

      // آپلود عکس در storage
      const { error: uploadError } = await supabase.storage
        .from("users-photos")
        .upload(filePath, photo, {
          cacheControl: "3600",
          upsert: true,
          contentType: photo.type || `image/${safeExt}`,
        });

      if (uploadError) {
        console.error("SUPABASE STORAGE ERROR:", uploadError);
        setError("خطا در آپلود عکس");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setLoading(false);
        return;
      }

      // داده برای ارسال به دیتابیس
      const userData = {
        first_name: firstName,
        last_name: lastName,
        father_name: fatherName,
        national_id: nationalId,
        phone,
        address,
        birth_date: birthDate,
        dispatch_date: dispatchDate,
        degree,
        major,
        priority1: priority1 || null,
        priority2: priority2 || null,
        priority3: priority3 || null,
        experience,
        photo_path: filePath,
        created_at: new Date().toISOString(),
      };

      // ارسال به جدول users
      const { error: insertError } = await supabase.from("users").insert([userData]);

      if (insertError) {
        console.error("SUPABASE INSERT ERROR:", insertError);

        // اگر ثبت دیتابیس خطا داد، عکس آپلود شده را پاک کنیم که داده ناقص نماند
        await supabase.storage.from("users-photos").remove([filePath]);

        setError("خطا در ذخیره اطلاعات");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setLoading(false);
        return;
      }

      alert("اطلاعات با موفقیت ثبت شد ✅");
      (e.target as HTMLFormElement).reset();
      setError("");
    } catch (err) {
      console.error("UNEXPECTED ERROR:", err);
      setError("خطای غیرمنتظره رخ داد");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#4b35f2] px-4 py-8 md:px-8" dir="rtl">
      <div className="mx-auto max-w-7xl rounded-[32px] bg-[#f6f7fb] p-4 md:p-8 shadow-2xl border border-white/20">
        {/* هدر و تب‌ها */}
        <div className="mb-8 grid grid-cols-2 gap-2 rounded-2xl bg-white p-2 shadow-sm sm:grid-cols-3 lg:grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg scale-105"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
          {/* بخش فرم اصلی */}
          <section className="rounded-[24px] bg-white p-6 md:p-10 shadow-sm border border-gray-100">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-2xl font-black text-slate-800 border-r-4 border-indigo-600 pr-4">
                فرم ثبت نام مهارت‌آموزی
              </h1>
              <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full text-left font-mono">
                DATE: 2026/06/10
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-r-4 border-red-500 p-4 text-red-700 text-sm font-bold animate-pulse">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* بخش اول: مشخصات فردی */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-indigo-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  مشخصات شناسنامه‌ای
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="label">نام</label>
                    <input
                      name="firstName"
                      className="input"
                      placeholder="مثلا: علی"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="label">نام خانوادگی</label>
                    <input
                      name="lastName"
                      className="input"
                      placeholder="مثلا: محمدی"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="label">نام پدر</label>
                    <input name="fatherName" className="input" required />
                  </div>
                  <div className="space-y-1">
                    <label className="label">کد ملی</label>
                    <input
                      name="nationalCode"
                      className="input"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* بخش دوم: تاریخ تولد */}
              <div className="space-y-4">
                <label className="label font-bold text-slate-700">تاریخ تولد</label>
                <div className="grid grid-cols-3 gap-3">
                  <select name="bDay" className="input" required>
                    <option value="">روز</option>
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select name="bMonth" className="input" required>
                    <option value="">ماه</option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select name="bYear" className="input" required>
                    <option value="">سال</option>
                    {birthYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* بخش سوم: محل سکونت و تماس */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label">شماره تماس (همراه)</label>
                  <input
                    name="phone"
                    className="input"
                    placeholder="0912..."
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="label">محل سکونت</label>
                  <input
                    name="address"
                    className="input"
                    placeholder="شهر یا روستا"
                    required
                  />
                </div>
              </div>

              {/* بخش چهارم: تاریخ اعزام */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <label className="text-sm font-black text-slate-700 mb-4 block">
                  تاریخ اعزام به خدمت
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <select name="dispatchMonth" className="input">
                    <option value="">ماه اعزام</option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select name="dispatchYear" className="input">
                    <option value="">سال اعزام</option>
                    {dispatchYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* بخش پنجم: تحصیلات و رشته */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label">مدرک تحصیلی</label>
                  <select name="degree" className="input">
                    <option value="">انتخاب کنید...</option>
                    <option>زیر دیپلم</option>
                    <option>دیپلم</option>
                    <option>فوق دیپلم</option>
                    <option>لیسانس</option>
                    <option>فوق لیسانس و بالاتر</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="label">رشته تحصیلی</label>
                  <input
                    name="major"
                    className="input"
                    placeholder="مثلاً: برق، کامپیوتر..."
                  />
                </div>
              </div>

              {/* بخش ششم: انتخاب اولویت‌های مهارتی */}
              <div className="p-6 border-2 border-indigo-50 rounded-2xl bg-indigo-50/30">
                <h2 className="font-black mb-5 text-indigo-900 text-sm flex items-center gap-2">
                  <BookOpen size={20} className="text-indigo-600" />
                  اولویت‌بندی رشته‌های مهارتی
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-500 mr-1">
                      اولویت اول
                    </label>
                    <select name="priority1" className="input border-indigo-200">
                    <option value="">
                      {coursesLoading ? "در حال دریافت دوره‌ها..." : "انتخاب رشته..."}
                    </option>
                    {courses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-500 mr-1">
                      اولویت دوم
                    </label>
                    <select name="priority2" className="input border-indigo-200">
                      <option value="">انتخاب رشته...</option>
                      {courses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-500 mr-1">
                      اولویت سوم
                    </label>
                    <select name="priority3" className="input border-indigo-200">
                      <option value="">انتخاب رشته...</option>
                      {courses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* بخش هفتم: سوابق مهارتی */}
              <div className="space-y-3">
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mt-4">
                  <PenTool size={20} className="text-indigo-600" />
                  سوابق مهارتی
                </h2>
                <textarea
                  name="experience"
                  className="w-full min-h-[150px] rounded-2xl border-2 border-slate-200 p-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300"
                  placeholder="اگر قبلاً دوره‌ای گذرانده‌اید یا سابقه کاری در رشته‌های فنی دارید، اینجا به طور کامل بنویسید..."
                />
              </div>

              {/* بخش هشتم: آپلود عکس پرسنلی */}
              <div className="border-2 border-dashed border-indigo-200 p-8 rounded-[24px] bg-slate-50/50 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500">
                  <Camera size={32} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">بارگذاری عکس پرسنلی (۴*۳)</p>
                  <p className="text-[11px] text-red-500 mt-1 font-bold">
                    در صورت عدم بارگذاری، ثبت‌نام انجام نخواهد شد.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl border-2 border-indigo-100 shadow-sm w-full max-w-sm hover:border-indigo-400 transition-colors">
                    <input
                      type="file"
                      name="photo"
                      className="text-xs w-full cursor-pointer"
                      accept="image/*"
                      required
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  حجم فایل باید زیر ۳۰۰ کیلوبایت باشد.
                </p>
              </div>

              {/* دکمه نهایی */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 text-white font-black text-xl hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={24} />
                {loading ? "در حال ثبت اطلاعات..." : "ثبت نهایی اطلاعات"}
              </button>

              <div className="flex justify-center border-t border-slate-100 pt-6">
                <Link
                  href="/admin-login"
                  className="flex items-center gap-2 text-slate-400 text-sm hover:text-indigo-600 transition-all font-bold group"
                >
                  <LogIn size={18} className="group-hover:-translate-x-1 transition-transform" />
                  ورود به پنل مدیریت
                </Link>
              </div>
            </form>
          </section>

          {/* سایدبار اطلاعاتی */}
          <aside className="hidden lg:flex flex-col rounded-[24px] bg-gradient-to-br from-[#2f49c9] to-[#6d3df2] p-10 text-white text-center justify-between relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

            <div className="relative z-10 space-y-6">
              <div className="mx-auto w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 flex items-center justify-center mb-8">
                <ShieldCheck size={45} />
              </div>
              <h2 className="text-3xl font-black leading-tight">
                سامانه یکپارچه مهارتی کارآموزان
              </h2>
              <div className="h-1 w-20 bg-indigo-400 mx-auto rounded-full"></div>
              <p className="leading-loose opacity-90 text-sm font-medium">
                لطفاً قبل از تایید نهایی، تمامی اطلاعات وارد شده را مجدداً بررسی کنید.
                اطلاعات وارد شده روی گواهینامه مهارت شما درج خواهد شد.
              </p>
            </div>

            <div className="relative z-10 mt-auto space-y-4">
              <div className="p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm text-right space-y-2">
                <p className="text-xs font-bold opacity-60">نکات مهم:</p>
                <ul className="text-[11px] space-y-2 opacity-90 list-disc list-inside">
                  <li>عکس باید با زمینه سفید و جدید باشد.</li>
                  <li>کد ملی بدون خط تیره وارد شود.</li>
                  <li>سوابق مهارتی در اولویت‌بندی شما موثر است.</li>
                </ul>
              </div>
              <p className="text-[10px] opacity-50">
                طراحی شده توسط سیستم مدیریت مهارت - ۱۴۰۵
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* استایل‌های اختصاصی برای ورودی‌ها */}
      <style jsx>{`
        .input {
          height: 52px;
          width: 100%;
          border-radius: 16px;
          border: 2px solid #f1f5f9;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
          background-color: #f8fafc;
          color: #1e293b;
        }
        .input:focus {
          border-color: #6366f1;
          background-color: white;
          box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.08);
        }
        .label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          margin-right: 4px;
          margin-bottom: 4px;
        }
        select.input {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 16px center;
          background-size: 14px;
        }
      `}</style>
    </main>
  );
}
