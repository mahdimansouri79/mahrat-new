"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Database,
  RefreshCcw,
  Users,
  Pencil,
  Trash2,
  Plus,
  X,
  Search,
  FileSpreadsheet,
  Download,
  LogOut,
  MessageSquare,
} from "lucide-react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type UserType = {
  id: string;
  first_name: string;
  last_name: string;
  father_name?: string;
  national_id: string;
  phone?: string;
  education?: string;
  birth_date?: string;
  dispatch_date?: string;
  priority1?: string;
  priority2?: string;
  priority3?: string;
  address?: string;
  service_unit?: string;
  degree?: string;
  major?: string;
  need_dormitory?: boolean;
  created_at: string;
};


type CourseType = {
  id: string;
  title: string;
  created_at?: string;
};

type TicketType = {
  id: number;
  full_name: string;
  national_id: string;
  phone: string;
  message: string;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [courses, setCourses] = useState<CourseType[]>([]);
  const [newCourse, setNewCourse] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserType>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  // صفحه‌بندی کاربران
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // وضعیت دانلود ZIP
  const [downloadingZip, setDownloadingZip] = useState(false);

  // تیکت‌ها
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // گرفتن کاربران
  const loadUsers = async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD USERS ERROR:", error);
      setErrorMessage("خطا در دریافت اطلاعات کاربران از دیتابیس");
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  };
  const serviceUnitMap: Record<string, string> = {
  "1": "کارت سبز",
  "2": "آموزشی",
  "3": "سپاه ثارالله",
  "4": "لشکر ۴۱",
  "5": "فاوا قدس",
  "6": "آمادگاه شهید باهنر",
  "7": "تیپ ۳۸ ذوالفقار",
  "8": "تیپ تکاور صاحب الزمان سیرجان",
  "9": "گروه موشکی توپخانه ۶۵ رفسنجان",
  "10": "گروه امام حسین",
};

  // گرفتن دوره‌ها
  const loadCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD COURSES ERROR:", error);
    } else {
      setCourses(data || []);
    }
  };

  // گرفتن تیکت‌ها
  const loadTickets = async () => {
    setLoadingTickets(true);

    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD TICKETS ERROR:", error);
    } else {
      setTickets(data || []);
    }

    setLoadingTickets(false);
  };

  // بررسی اتصال دیتابیس
  const checkDatabaseConnection = async () => {
    setDbStatus("idle");

    const { error } = await supabase.from("users").select("id").limit(1);

    if (error) {
      console.error("DB CONNECTION ERROR:", error);
      setDbStatus("error");
    } else {
      setDbStatus("success");
    }
  };

  // افزودن دوره + جلوگیری از تکراری
  const addCourse = async () => {
    const title = newCourse.trim();
    if (!title) return;

    const duplicate = courses.find(
      (course) => course.title.trim().toLowerCase() === title.toLowerCase()
    );

    if (duplicate) {
      alert("این دوره قبلاً ثبت شده است");
      return;
    }

    const { error } = await supabase.from("courses").insert([{ title }]);

    if (error) {
      console.error("ADD COURSE ERROR:", error);
      alert("خطا در افزودن دوره");
      return;
    }

    setNewCourse("");
    loadCourses();
  };

  // حذف دوره
  const deleteCourse = async (id: string) => {
    const confirmDelete = confirm("آیا از حذف این دوره مطمئن هستید؟");
    if (!confirmDelete) return;

    const deletingCourse = courses.find((c) => c.id === id);

    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      console.error("DELETE COURSE ERROR:", error);
      alert("خطا در حذف دوره");
      return;
    }

    if (selectedCourse && deletingCourse?.title === selectedCourse) {
      setSelectedCourse(null);
    }

    loadCourses();
  };

  // حذف کاربر
  const deleteUser = async (id: string) => {
    const confirmDelete = confirm("آیا از حذف این کاربر مطمئن هستید؟");
    if (!confirmDelete) return;

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("DELETE USER ERROR:", error);
      alert("خطا در حذف کاربر");
      return;
    }

    loadUsers();
  };

  // حذف تیکت
  const deleteTicket = async (id: number) => {
    const confirmDelete = confirm("آیا از حذف این تیکت مطمئن هستید؟");
    if (!confirmDelete) return;

    const { error } = await supabase.from("tickets").delete().eq("id", id);

    if (error) {
      console.error("DELETE TICKET ERROR:", error);
      alert("خطا در حذف تیکت");
      return;
    }

    setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
  };

  // باز کردن مودال ادیت
  const openEditModal = (user: UserType) => {
    setEditingUser(user);
    setEditForm(user);
  };
  //پاک کردن تمامی افراد
    const deleteAllUsers = async () => {
  const confirmDelete = confirm(
    "آیا مطمئن هستید که می‌خواهید تمام اطلاعات کاربران حذف شود؟ این عمل قابل بازگشت نیست."
  );

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("users")
    .delete()
    .neq("id", "0");

  if (error) {
    alert("خطا در حذف اطلاعات");
    console.error(error);
    return;
  }

  alert("تمام اطلاعات کاربران حذف شد");

  setUsers([]); // خالی شدن لیست در صفحه
};

  // ذخیره ادیت
  const saveEditUser = async () => {
    if (!editingUser) return;

    setSavingEdit(true);

    const { error } = await supabase
      .from("users")
      .update({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        father_name: editForm.father_name,
        national_id: editForm.national_id,
        phone: editForm.phone,
        education: editForm.education,
        birth_date: editForm.birth_date,
        dispatch_date: editForm.dispatch_date,
        priority1: editForm.priority1,
        priority2: editForm.priority2,
        priority3: editForm.priority3,
        address: editForm.address,
        service_unit: editForm.service_unit,
        need_dormitory: editForm.need_dormitory,
      })

      .eq("id", editingUser.id);

    setSavingEdit(false);

    if (error) {
      console.error("EDIT USER ERROR:", error);
      alert("خطا در ویرایش اطلاعات");
      return;
    }

    setEditingUser(null);
    setEditForm({});
    loadUsers();
  };

  // خروجی اکسل
  const exportToExcel = () => {
    const excelData = filteredUsers.map((user) => ({
      "نام": user.first_name || "",
      "نام خانوادگی": user.last_name || "",
      "نام پدر": user.father_name || "",
      "کد ملی": user.national_id || "",
      "شماره تماس": user.phone || "",
      "مدرک تحصیلی": user.degree || "",
     "رشته تحصیلی": user.major || "",
      "تاریخ تولد": user.birth_date || "",
      "تاریخ اعزام": user.dispatch_date || "",
      "اولویت 1": user.priority1 || "",
      "اولویت 2": user.priority2 || "",
      "اولویت 3": user.priority3 || "",
      "آدرس / شهر": user.address || "",
      "یگان خدمتی": serviceUnitMap[user.service_unit ?? ""] || "",
      "نیاز به خوابگاه": user.need_dormitory ? "بله" : "خیر",
      "تاریخ ثبت": user.created_at
        ? new Date(user.created_at).toLocaleDateString("fa-IR")
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    XLSX.writeFile(workbook, "users-report.xlsx");
  };

  // دانلود ZIP همه عکس‌ها
  const downloadAllPhotosZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();

      const { data: folders, error: foldersError } = await supabase.storage
        .from("users-photos")
        .list("", { limit: 1000 });

      if (foldersError) throw foldersError;

      if (folders) {
        for (const folder of folders) {
          if (folder.name.startsWith(".")) continue;

          const { data: files, error: filesError } = await supabase.storage
            .from("users-photos")
            .list(folder.name);

          if (filesError) continue;

          if (files && files.length > 0) {
            const photoFile = files.find((f) => f.name.startsWith("photo."));

            if (photoFile) {
              const filePath = `${folder.name}/${photoFile.name}`;

              const { data, error: downloadError } = await supabase.storage
                .from("users-photos")
                .download(filePath);

              if (!downloadError && data) {
                const extension = photoFile.name.split(".").pop();
                zip.file(`${folder.name}.${extension}`, data);
              }
            }
          }
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "users-photos-by-national-id.zip");
    } catch (error) {
      console.error("Error creating ZIP:", error);
      alert("خطا در ساخت فایل ZIP");
    } finally {
      setDownloadingZip(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadCourses();
    loadTickets();
  }, []);

  // فیلتر کاربران بر اساس دوره + جستجو
  const filteredUsers = useMemo(() => {
    let result = users;

    if (selectedCourse) {
      result = result.filter((user) => user.priority1 === selectedCourse);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(
        (user) =>
          `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase().includes(term) ||
          (user.national_id || "").includes(term)
      );
    }

    return result;
  }, [users, selectedCourse, searchTerm]);

  // تعداد افراد هر دوره
  const getCourseCount = (courseTitle: string) => {
    return users.filter((user) => user.priority1 === courseTitle).length;
  };

  // صفحه‌بندی کاربران
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCourse]);

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* هدر */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-3 text-blue-600">
            <Users size={26} />
            <h1 className="text-xl font-bold">
              پنل مدیریت ({filteredUsers.length} کاربر)
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={checkDatabaseConnection}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition text-sm"
            >
              <Database size={18} />
              بررسی اتصال دیتابیس
            </button>

            <button
              onClick={() => {
                loadUsers();
                loadCourses();
                loadTickets();
              }}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition text-sm"
            >
              <RefreshCcw size={18} />
              بروزرسانی
            </button>
              <button
              onClick={deleteAllUsers}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
            >
              حذف تمام کاربران
            </button>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition text-sm"
            >
              <FileSpreadsheet size={18} />
              خروجی اکسل
            </button>

            <button
              onClick={downloadAllPhotosZip}
              disabled={downloadingZip}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              {downloadingZip ? "در حال ساخت ZIP..." : "دانلود ZIP عکس‌ها"}
            </button>

            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition text-sm"
            >
              <LogOut size={18} />
              خروج
            </button>
          </div>
        </div>

        {/* وضعیت اتصال دیتابیس */}
        {dbStatus === "success" && (
          <div className="bg-green-100 text-green-700 p-4 rounded-xl">
            ✅ اتصال به دیتابیس برقرار است
          </div>
        )}

        {dbStatus === "error" && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl">
            ❌ اتصال به دیتابیس برقرار نیست — تنظیمات Supabase را بررسی کنید
          </div>
        )}

        {/* خطا */}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* سایدبار دوره‌ها */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-4">
              <h2 className="text-lg font-bold text-gray-800">عنوان دوره ها</h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="نام دوره..."
                  className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addCourse}
                  className="bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  <Plus size={18} />
                </button>
              </div>

              {selectedCourse && (
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="w-full text-sm bg-gray-100 hover:bg-gray-200 rounded-xl py-2"
                >
                  نمایش همه کاربران
                </button>
              )}

              <div className="space-y-2">
                {courses.length === 0 ? (
                  <p className="text-sm text-gray-400">هنوز دوره‌ای ثبت نشده</p>
                ) : (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      className={`flex items-center justify-between gap-2 border rounded-xl p-3 transition ${
                        selectedCourse === course.title
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <button
                        onClick={() => setSelectedCourse(course.title)}
                        className="flex-1 text-right"
                      >
                        <div className="font-medium text-sm text-gray-800">
                          {course.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          تعداد اولویت ۱: {getCourseCount(course.title)}
                        </div>
                      </button>

                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* بخش اصلی */}
          <div className="lg:col-span-3 space-y-6">
            {/* جستجو */}
            <div className="bg-white rounded-2xl shadow-sm border p-4">
              <div className="relative">
                <Search
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو بر اساس نام، نام خانوادگی یا کد ملی..."
                  className="w-full border rounded-xl pr-10 pl-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* جدول کاربران */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-gray-800">لیست کاربران</h2>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-600">
                    <th className="p-4 text-right">نام</th>
                    <th className="p-4 text-right">کد ملی</th>
                    <th className="p-4 text-right">دوره</th>
                    <th className="p-4 text-right">شهر</th>
                    <th className="p-4 text-right">یگان</th>
                    <th className="p-4 text-right">خوابگاه</th>
                    <th className="p-4 text-right">تاریخ ثبت</th>
                    <th className="p-4 text-right">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center p-6 text-gray-400">
                        در حال بارگذاری...
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-6 text-gray-400">
                        کاربری یافت نشد
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-medium">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="p-4">{user.national_id}</td>
                        <td className="p-4">{user.priority1 || "-"}</td>
                        <td className="p-4">{user.address || "-"}</td>
                        <td className="p-4">
                          {user.service_unit ? `یگان ${user.service_unit}` : "-"}
                        </td>
                        <td className="p-4">
                          {user.need_dormitory ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              بله
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                              خیر
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-500">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString("fa-IR")
                            : "-"}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-2 rounded-xl hover:bg-yellow-600 transition text-xs"
                            >
                              <Pencil size={14} />
                              ادیت
                            </button>

                            <button
                              onClick={() => deleteUser(user.id)}
                              className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-xl hover:bg-red-700 transition text-xs"
                            >
                              <Trash2 size={14} />
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* صفحه‌بندی */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border p-4 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  قبلی
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-xl text-sm ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  بعدی
                </button>
              </div>
            )}

            {/* بخش تیکت‌ها */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold">تیکت‌های ثبت‌شده</h2>
                </div>
                <span className="text-sm text-gray-500">
                  تعداد: {tickets.length}
                </span>
              </div>

              {loadingTickets ? (
                <div className="text-sm text-gray-500">در حال بارگذاری تیکت‌ها...</div>
              ) : tickets.length === 0 ? (
                <div className="text-sm text-gray-500">هیچ تیکتی ثبت نشده است.</div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-gray-800">
                            {ticket.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            کد ملی: {ticket.national_id}
                          </p>
                          <p className="text-sm text-gray-600">
                            شماره تماس: {ticket.phone}
                          </p>
                          <p className="text-xs text-gray-400">
                            {ticket.created_at
                              ? new Date(ticket.created_at).toLocaleString("fa-IR")
                              : "-"}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteTicket(ticket.id)}
                          className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition text-sm"
                        >
                          حذف
                        </button>
                      </div>

                      <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-7 whitespace-pre-line">
                        {ticket.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* مودال ادیت */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">ویرایش مشخصات کاربر</h2>
                <button onClick={() => setEditingUser(null)}>
                  <X />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  value={editForm.first_name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, first_name: e.target.value })
                  }
                  placeholder="نام"
                  className="border rounded-xl px-3 py-2"
                />

                <input
                  value={editForm.last_name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, last_name: e.target.value })
                  }
                  placeholder="نام خانوادگی"
                  className="border rounded-xl px-3 py-2"
                />

                <input
                  value={editForm.father_name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, father_name: e.target.value })
                  }
                  placeholder="نام پدر"
                  className="border rounded-xl px-3 py-2"
                />

                <input
                  value={editForm.national_id || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, national_id: e.target.value })
                  }
                  placeholder="کد ملی"
                  className="border rounded-xl px-3 py-2"
                />

                <input
                  value={editForm.phone || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder="شماره تماس"
                  className="border rounded-xl px-3 py-2"
                />

                <input
                  value={editForm.education || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, education: e.target.value })
                  }
                  placeholder="رشته تحصیلی"
                  className="border rounded-xl px-3 py-2"
                />

                <input
                  value={editForm.birth_date || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, birth_date: e.target.value })
                  }
                  placeholder="تاریخ تولد"
                  className="border rounded-xl px-3 py-2"
                />

                <input
                  value={editForm.dispatch_date || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dispatch_date: e.target.value })
                  }
                  placeholder="تاریخ اعزام"
                  className="border rounded-xl px-3 py-2"
                />
  
                <select
                  value={editForm.priority1 || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, priority1: e.target.value })
                  }
                  className="border rounded-xl px-3 py-2"
                >
                  <option value="">انتخاب دوره اولویت 1</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.title}>
                      {course.title}
                    </option>
                  ))}
                </select>

                <input
                  value={editForm.priority2 || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, priority2: e.target.value })
                  }
                  placeholder="اولویت 2"
                  className="border rounded-xl px-3 py-2"
                />

                <input
                  value={editForm.priority3 || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, priority3: e.target.value })
                  }
                  placeholder="اولویت 3"
                  className="border rounded-xl px-3 py-2"
                />
                <select
                  value={editForm.service_unit || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, service_unit: e.target.value })
                  }
                  className="border rounded-xl px-3 py-2"
                >
                  <option value="">انتخاب یگان خدمتی</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((unit) => (
                    <option key={unit} value={unit}>
                      یگان {unit}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-3 border rounded-xl px-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editForm.need_dormitory)}
                    onChange={(e) =>
                      setEditForm({ ...editForm, need_dormitory: e.target.checked })
                    }
                    className="w-5 h-5 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    نیاز به خوابگاه
                  </span>
                </label>
                <input
                  value={editForm.address || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  placeholder="شهر / آدرس"
                  className="border rounded-xl px-3 py-2 md:col-span-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                >
                  انصراف
                </button>
                <button
                  onClick={saveEditUser}
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingEdit ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
