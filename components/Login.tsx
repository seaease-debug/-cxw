
import React, { useState, useEffect } from 'react';
import { Skeleton } from './ui/Skeleton';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { ClipboardCheck, RefreshCw, ShieldAlert, Activity, User, Lock, Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import { UserAccount } from '../types';

interface LoginProps {
  onLogin: (user: UserAccount) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(code);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (captchaInput !== captchaCode) {
      setError('验证码校验不通过');
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const user = await res.json();
        onLogin(user);
      } else {
        setError('用户名或密码错误，请核实后重试');
        generateCaptcha();
      }
    } catch {
      setError('网络连接异常，请确保后端服务已启动');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full relative flex items-center justify-center p-6 bg-slate-950 overflow-hidden select-none font-sans">
      <style>{`
        @keyframes breath {
          0%, 100% { transform: scale(1); opacity: 0.88; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes float {
          0% { transform: translateY(15px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .login-card-float {
          animation: float 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .login-card-float input,
        .login-card-float input:focus,
        .login-card-float input:focus-visible,
        .login-card-float input:active {
          outline: none !important;
          border-radius: 14px !important;
        }
      `}</style>

      {/* Cinema-grade background image with subtle scale breathing animation */}
      <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat animate-[breath_25s_ease-in-out_infinite] z-0"></div>
      
      {/* Deep mask overlay (lowers exposure by approx 15%) to keep text perfectly legible */}
      <div className="absolute inset-0 bg-black/55 z-0"></div>

      {/* Main split-screen responsive layout container */}
      <main className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-[120px] flex flex-col md:flex-row justify-between items-center h-full min-h-[700px] gap-12">
        
        {/* Left Side: Center Vertically (~55% width visual feel, aligned perfectly with the card) */}
        <div className="flex-1 flex flex-col justify-center text-white py-6 md:pr-12 max-w-xl md:translate-y-0">
          {/* Visual hierarchy ①: Logo and Title */}
          <div className="flex items-center gap-4">
            <img 
              alt="School Logo" 
              className="w-14 h-14 object-contain rounded-full bg-white/10 p-1 backdrop-blur-md border border-white/15 shadow-xl" 
              style={{ filter: 'brightness(1.15)' }}
              src="/logo.png" 
            />
            <div>
              {/* ② 科技信息中心 / Technology Information Center */}
              <h1 className="text-[22px] font-bold tracking-wider text-white">科技信息中心</h1>
              <p className="text-xs font-medium tracking-widest uppercase text-white/45 mt-0.5">
                Technology Information Center
              </p>
            </div>
          </div>

          {/* Spacer: Blank space ~48px */}
          <div className="h-12"></div>

          {/* ③ 固定资产 登记平台 in two lines */}
          <div className="space-y-4">
            <h2 className="text-7xl font-black leading-[1.1] tracking-tight text-white select-none">
              固定资产<br />登记平台
            </h2>
            <div>
              <p className="text-teal-400 font-bold text-lg tracking-wide">
                校园资产数字化管理平台
              </p>
              <p className="text-white/40 text-[14px] tracking-widest uppercase mt-1 font-medium">
                Digital Asset Management Platform
              </p>
            </div>
          </div>

          {/* Spacer: features distance */}
          <div className="h-16"></div>

          {/* Three Feature highlights: vertical layout, 40px gap */}
          <div className="space-y-10">
            {/* Feature 1 */}
            <div className="flex items-center gap-5 group">
              <div className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 hover:scale-105">
                <ClipboardCheck className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="font-bold text-[18px] text-white tracking-wide">高效登记</h3>
                <p className="text-sm text-white/60 mt-0.5">数字化流程，秒级完成资产入库</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-5 group">
              <div className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 hover:scale-105">
                <Activity className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="font-bold text-[18px] text-white tracking-wide">实时流转</h3>
                <p className="text-sm text-white/60 mt-0.5">全生命周期追踪，状态实时更新</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-5 group">
              <div className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 hover:scale-105">
                <ShieldAlert className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="font-bold text-[18px] text-white tracking-wide">智能预警</h3>
                <p className="text-sm text-white/60 mt-0.5">异常状态自动提醒，保障资产安全</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card (Apple Vision Pro Glassmorphism, shifted left ~90px, height adjusted to 630px to perfectly match left content) */}
        <div className="flex-shrink-0 w-full md:w-[420px] flex justify-end">
          <section className="login-card-float w-full md:w-[420px] h-[630px] md:-translate-x-[90px] flex flex-col justify-between p-8 pt-7 pb-7 bg-[var(--color-glass-surface)] backdrop-blur-[24px] border border-white/10 rounded-glass-card shadow-xl relative overflow-hidden">
            
            {/* Form Top Area */}
            <div>
              {/* Responsive mobile header (only visible on small screens) */}
              <div className="md:hidden flex items-center gap-3 mb-6">
                <img 
                  alt="School Logo" 
                  className="w-10 h-10 object-contain rounded-full bg-white/10 p-1" 
                  src="/logo.png" 
                />
                <div>
                  <h1 className="text-base font-bold text-white">科技信息中心</h1>
                  <p className="text-teal-400 font-semibold text-xs uppercase tracking-wider">Fixed Asset Platform</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-400/10 flex items-center justify-center border border-teal-400/20 shrink-0 shadow-sm">
                    <LogIn className="w-4.5 h-4.5 text-teal-400" />
                  </div>
                  <h3 className="text-[22px] md:text-[24px] font-bold text-white tracking-tight leading-none">欢迎回来</h3>
                </div>
                <p className="text-white/65 text-xs mt-2.5 ml-1">请输入您的账号密码登录管理系统</p>
              </div>

              {loading ? (
                <div className="space-y-4 mt-6">
                  <div>
                    <Skeleton className="h-3 w-20 mb-1.5 bg-white/10" borderRadius="0.25rem" />
                    <Skeleton className="h-[54px] w-full bg-white/5" borderRadius="14px" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-16 mb-1.5 bg-white/10" borderRadius="0.25rem" />
                    <Skeleton className="h-[54px] w-full bg-white/5" borderRadius="14px" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Skeleton className="h-3 w-16 mb-1.5 bg-white/10" borderRadius="0.25rem" />
                      <Skeleton className="h-[54px] w-full bg-white/5" borderRadius="14px" />
                    </div>
                    <div className="flex flex-col justify-end">
                      <Skeleton className="h-[54px] w-full bg-white/5" borderRadius="14px" />
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-3 rounded-glass-field text-xs font-semibold text-center animate-pulse" role="alert">
                      {error}
                    </div>
                  )}

                  {/* Username Field */}
                  <div>
                    <label htmlFor="username" className="block text-xs font-bold text-white/70 tracking-wider uppercase mb-1.5 ml-1">
                      账号 / ACCOUNT
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none flex items-center justify-center">
                        <User className="w-5 h-5 text-teal-400" />
                      </div>
                      <input 
                        type="text" 
                        id="username"
                        required
                        className="w-full pl-11 pr-4 h-11 bg-white/5 border border-white/10 rounded-glass-field text-white placeholder-white/25 text-sm font-medium transition-all duration-300 hover:border-teal-400/50 focus:border-teal-400 focus:bg-white/10 focus:ring-2 focus:ring-teal-400/30 focus:outline-none"
                        placeholder="请输入用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-white/70 tracking-wider uppercase mb-1.5 ml-1">
                      密码 / PASSWORD
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none flex items-center justify-center">
                        <Lock className="w-5 h-5 text-teal-400" />
                      </div>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        id="password"
                        required
                        className="w-full pl-11 pr-11 h-11 bg-white/5 border border-white/10 rounded-glass-field text-white placeholder-white/25 text-sm font-medium transition-all duration-300 hover:border-teal-400/50 focus:border-teal-400 focus:bg-white/10 focus:ring-2 focus:ring-teal-400/30 focus:outline-none"
                        placeholder="请输入密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <IconButton
                          type="button"
                          icon={showPassword ? <EyeOff className="w-6 h-6 text-teal-400/70 hover:text-teal-400" /> : <Eye className="w-6 h-6 text-teal-400/70 hover:text-teal-400" />}
                          label={showPassword ? "隐藏密码" : "显示密码"}
                          onClick={() => setShowPassword(!showPassword)}
                          size="md"
                          className="flex items-center justify-center text-teal-400 hover:text-teal-300 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Captcha Field */}
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <label htmlFor="captcha" className="block text-xs font-bold text-white/70 tracking-wider uppercase mb-1.5 ml-1">
                        验证码 / CAPTCHA
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none flex items-center justify-center">
                          <Shield className="w-5 h-5 text-teal-400" />
                        </div>
                        <input
                          type="text"
                          id="captcha"
                          required
                          className="w-full pl-11 pr-4 h-11 bg-white/5 border border-white/10 rounded-glass-field text-white placeholder-white/25 text-sm font-medium text-center tracking-[0.2em] transition-all duration-300 hover:border-teal-400/50 focus:border-teal-400 focus:bg-white/10 focus:ring-2 focus:ring-teal-400/30 focus:outline-none"
                          placeholder="验证码"
                          maxLength={4}
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={generateCaptcha}
                      aria-label={`验证码，当前为 ${captchaCode.split('').join(' ')}，点击刷新`}
                      className="h-[54px] rounded-glass-field bg-white/10 border-white/10 hover:bg-white/15 group/btn border-none"
                    >
                      <span aria-hidden="true" className="text-teal-400 italic font-bold tracking-widest text-xl mr-2">
                        {captchaCode}
                      </span>
                      <RefreshCw className="w-3.5 h-3.5 text-white/40 group-hover/btn:rotate-180 transition-transform duration-500" />
                    </Button>
                  </div>
                    <p id="captcha-desc" className="sr-only">请输入上方显示的 4 位数字验证码。如果看不清可以点击验证码刷新。</p>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      variant="primary"
                      size="lg"
                      className="w-full h-[54px] rounded-glass-field"
                    >
                      <span>进入管理系统 →</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Form Footer Area */}
            <footer className="pt-4 border-t border-white/8 text-center">
              <p className="text-xs text-white/35 font-bold tracking-widest uppercase">
                EDUASSET PRO V2.5.0 LTS
              </p>
              <p className="text-xs text-white/25 mt-1 tracking-wider uppercase">
                © 2026 NINGBO HIGH SCHOOL. ALL RIGHTS RESERVED.
              </p>
            </footer>
          </section>
        </div>

      </main>
    </div>
  );
};

export default Login;
