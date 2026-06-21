"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Send, SearchCheck, FileText, Phone, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function TrackPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    national_id: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (
      !formData.full_name.trim() ||
      !formData.national_id.trim() ||
      !formData.phone.trim() ||
      !formData.message.trim()
    ) {
      setErrorMessage("لطفاً تمامی فیلدها را تکمیل کنید.");
      return;
    }

    if (!/^\d{10}$/.test(formData.national_id)) {
      setErrorMessage("کد ملی باید ۱۰ رقم باشد.");
      return;
    }

    if (!/^09\d{9}$/.test(formData.phone)) {
      setErrorMessage("شماره تماس باید با 09 شروع شده و 11 رقم باشد.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("tickets").insert([
        {
          full_name: formData.full_name,
          national_id: formData.national_id,
          phone: formData.phone,
          message: formData.message,
        },
      ]);

      if (error) {
        setErrorMessage("ثبت درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
      } else {
        setSuccessMessage("درخواست پیگیری شما با موفقیت ثبت شد.");
        setFormData({
          full_name: "",
          national_id: "",
          phone: "",
          message: "",
        });
      }
    } catch (error) {
      setErrorMessage("مشکلی در ارتباط با سرور رخ داده است.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
    >
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 md:py-16">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-600 transition"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">بازگشت به صفحه اصلی</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-6 md:p-10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-2xl">
              <SearchCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800">
                سامانه پیگیری درخواست‌ها
              </h1>
              <p className="text-slate-500 mt-2 text-sm md:text-base">
                ثبت درخواست، پیگیری وضعیت، اعلام مشکلات و دریافت پاسخ از واحد پشتیبانی
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                <User className="w-5 h-5" />
                راهنمایی مشاهده نتیجه آزمون
              </div>
              <p className="text-sm text-slate-600 leading-7">

                توضیحات:

                بعد از ۲ الی ۳ روز کاری از زمان آزمون آنلاین نمره داخل سایت گذاشته می‌شود.
                نمره قبولی تئوری ۵۰ به بالا می‌باشد.
                زمان ثبت نمره عملی حدوداً یک الی دو ماه بعد از نمره تئوری است.
                در صورت درج نمره عملی و نتیجه نهایی قبولی برای دریافت مدرک خود به سایت https://pay.portaltvto.com/pay/licence2 رفته و هزینه صدور گواهی خود به مبلغ ۱۰۰ هزار تومان را پرداخت کنید تا مدرک شما صادر گردد.
                سپس به سایت https://azmoon.portaltvto.com/estelam/estelam رفته و مدرک خود را دریافت کنید.              </p>
            </div>


            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
                <Phone className="w-5 h-5" />
                دستورالعمل معرفی به آزمون مجدد
              </div>
              <p className="text-sm text-slate-600 leading-7">
                ابتدا وارد لینک زیر شوید و اطلاعات خواسته شده را به دقت پر کنید. سپس قسمت اعتبار بار دوم معرفی به آزمون کتبی که به مبلغ ۲۰۰ هزار تومان است را به اندازه یک تعداد انتخاب کنید و گزینه ذخیره را بزنید.
                https://pay.portaltvto.com/payment/shop/prepay

                در صفحه بعد مشخصات خود را تایید کنید. سپس وارد صفحه پرداخت می‌شوید. پرداخت خود را انجام دهید.
                بعد از پرداخت و ثبت اطلاعات خود در این صفحه ، رسید پرداختی خود را به مدیر گروه روبیکا ارسال کنید تا معرفی به آزمون شوید.              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-6 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
              فرم ثبت درخواست پیگیری
            </h2>
            <p className="text-slate-500 text-sm md:text-base">
              لطفاً فرم زیر را تکمیل کرده و درخواست خود را ارسال کنید.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="مثلاً: علی رضایی"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  کد ملی
                </label>
                <input
                  type="text"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleChange}
                  placeholder="مثلاً: 1234567890"
                  maxLength={10}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  شماره تماس
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="مثلاً: 09123456789"
                  maxLength={11}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                توضیحات درخواست
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                placeholder="لطفاً درخواست، مشکل یا سوال خود را کامل بنویسید..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
                {successMessage}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {loading ? "در حال ارسال..." : "ارسال درخواست"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
