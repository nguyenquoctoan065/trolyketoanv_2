import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Loader2,
  Sparkles,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "./Toast";

export default function AuthScreen({
  onAuthSuccess,
}: {
  onAuthSuccess: (user: any) => void;
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng điền đầy đủ địa chỉ Email và Mật khẩu của bạn!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(
        "Địa chỉ Email không đúng định dạng (ví dụ: ten@congty.com). Vui lòng nhập lại!",
      );
      return;
    }

    // Only enforce minimum password length when signing up
    if (isSignUp && password.length < 6) {
      toast.error("Mật khẩu phải dài tối thiểu 6 ký tự để đảm bảo an toàn!");
      return;
    }

    // When signing up, confirmPassword must be provided
    if (isSignUp && !confirmPassword) {
      toast.error("Vui lòng nhập lại mật khẩu để xác nhận!");
      return;
    }
    if (isSignUp && password.trim() !== confirmPassword.trim()) {
      toast.error(
        "Mật khẩu xác nhận không khớp nhau. Vui lòng nhập lại mật khẩu!",
      );
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // If email confirmation is enabled, they need to check email,
          // but if not, they might be logged in directly.
          if (data.session) {
            toast.success("Đăng ký tài khoản thành công!");
            onAuthSuccess(data.user);
          } else {
            toast.success(
              "Đăng ký thành công! Vui lòng kiểm tra hộp thư email để xác nhận tài khoản.",
            );
            setIsSignUp(false); // Switch to login
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          toast.success("Đăng nhập thành công!");
          onAuthSuccess(data.user);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let friendlyMessage =
        "Đã xảy ra lỗi hệ thống khi xác thực. Vui lòng thử lại sau!";

      if (err && err.message) {
        const msg = err.message.toLowerCase();
        if (
          msg.includes("invalid login credentials") ||
          msg.includes("invalid credentials")
        ) {
          friendlyMessage =
            "Tài khoản hoặc mật khẩu không đúng. Vui lòng kiểm tra lại!";
        } else if (
          msg.includes("invalid password") ||
          msg.includes("wrong password") ||
          msg.includes("password is incorrect")
        ) {
          friendlyMessage = "Mật khẩu sai. Vui lòng thử lại!";
        } else if (msg.includes("email not confirmed")) {
          friendlyMessage =
            "Tài khoản của bạn chưa được kích hoạt qua Email. Vui lòng kiểm tra hộp thư của bạn (hoặc thư rác) để nhấp vào link kích hoạt nhé!";
        } else if (
          msg.includes("user already registered") ||
          msg.includes("email already in use")
        ) {
          friendlyMessage =
            "Email này đã được đăng ký tài khoản trước đó. Bạn hãy đăng nhập hoặc sử dụng một email khác nhé!";
        } else if (msg.includes("signup is disabled")) {
          friendlyMessage =
            "Chức năng đăng ký tài khoản mới hiện đang tạm khóa. Vui lòng liên hệ quản trị viên!";
        } else if (
          msg.includes("rate limit") ||
          msg.includes("too many requests")
        ) {
          friendlyMessage =
            "Bạn đã thao tác đăng nhập/đăng ký quá nhanh. Vui lòng đợi khoảng 1 phút rồi thử lại nhé!";
        } else {
          friendlyMessage = err.message;
        }
      }
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative p-4 overflow-hidden font-sans">
      {/* Decorative Gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat opacity-[0.02] pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 md:p-10 relative z-10 transition-all duration-500 hover:shadow-primary-500/5">
        {/* Header App Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4 animate-bounce duration-1000">
            <CheckCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
            AccoBot
          </h1>
          <p className="text-xs text-primary-600 font-semibold tracking-wider uppercase mt-1">
            Trợ lý Kế toán Thông minh AI
          </p>
        </div>

        {/* Auth Tabs */}
        <div className="grid grid-cols-2 bg-gray-100/80 p-1 rounded-xl mb-8 border border-gray-200/50">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            className={`py-2.5 text-sm font-semibold rounded-lg transition-all ${
              !isSignUp
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            className={`py-2.5 text-sm font-semibold rounded-lg transition-all ${
              isSignUp
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Đăng ký
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-6 font-display">
          {isSignUp ? "Tạo tài khoản mới" : "Đăng nhập vào hệ thống"}
        </h2>

        {/* Auth Form (disable native browser validation to use custom toasts) */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                required
                placeholder="ten@congty.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none text-sm transition-all text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none text-sm transition-all text-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="animate-in fade-in duration-300 slide-in-from-top-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Nhập lại mật khẩu
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none text-sm transition-all text-gray-800"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-primary-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>{isSignUp ? "Đăng ký" : "Đăng nhập"}</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản Sử dụng và Chính sách
          Bảo mật dữ liệu kế toán của AccoBot.
        </p>
      </div>
    </div>
  );
}
