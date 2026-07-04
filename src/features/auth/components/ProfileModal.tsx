"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Building, ShieldCheck, Loader2, Edit2, Save, XCircle, Settings, Monitor, Bell } from "lucide-react";
import { UserProfile } from "@/features/auth/hooks/useUserProfile";
import { useUpdateProfile } from "@/features/auth/hooks/useUpdateProfile";
import { SettingsContent } from "@/features/settings/components/SettingsContent"; // Import file SettingsContent bạn đã tạo
import { useUploadAvatar } from "@/features/auth/hooks/useUploadAvatar";
import SapInput from "@/components/ui/SapInput";
import SapButton from "@/components/ui/SapButton";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
  isLoading?: boolean;
  initialTab?: "profile" | "settings";
}

export const UserModal = ({ isOpen, onClose, user, isLoading, initialTab = "profile" }: UserModalProps) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const { mutate, isPending } = useUpdateProfile();
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  useEffect(() => {
    console.log("Ref hiện tại:", fileInputRef.current);
    if (user) setFormData({ name: user.fullname, email: user.email || "", phone: user.phone || "" });
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra file trước khi upload
      if (file.size > 2 * 1024 * 1024) { // giới hạn 2MB
        alert("Ảnh quá lớn, vui lòng chọn file dưới 2MB");
        return;
      }
      uploadAvatar(file);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" 
        onClick={onClose}
      >
        <motion.div 
          onClick={(e) => e.stopPropagation()} 
          className="bg-[var(--color-background)] border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#1d2d3d] dark:bg-zinc-900 p-6 text-white flex-shrink-0 transition-colors">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={20} /></button>
            <div className="flex justify-center gap-8 mt-2">
              {[ {id: 'profile', label: 'Thông tin cá nhân', icon: User}, {id: 'settings', label: 'Cài đặt', icon: Settings} ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} 
                  className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${activeTab === tab.id ? "border-blue-400 text-white" : "border-transparent text-white/50"}`}>
                  <tab.icon size={16} /> <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Body - Dùng flex-grow để tự co giãn */}
          <div className="flex-grow overflow-y-auto p-8 bg-[var(--color-background)] transition-colors scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
             {activeTab === "profile" ? (
               <ProfileSection 
                  user={user} 
                  isEditing={isEditing} 
                  formData={formData} 
                  setFormData={setFormData} 
                  setIsEditing={setIsEditing} 
                  isPending={isPending} 
                  onSave={() => mutate(formData, { onSuccess: () => setIsEditing(false) })} 
                  imgError={imgError} 
                  setImgError={setImgError}
                  fileInputRef={fileInputRef}
                  handleFileChange={handleFileChange}
                  isUploading={isUploading}
                   />
             ) : (
               <SettingsContent />
             )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ProfileSection = ({ user, isEditing, formData, setFormData, setIsEditing, isPending, onSave, imgError, setImgError, fileInputRef, handleFileChange, isUploading }: any) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4 bg-[var(--color-background)] p-5 rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors">
      <div className={`h-16 w-16 rounded-full overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center shrink-0 relative group ${isEditing ? 'cursor-pointer' : ''}`}
          onClick={() => {
            if (isEditing && fileInputRef?.current) {
              fileInputRef.current.click();
            }
          }}>
          {user?.avatarUrl && !imgError ? (
          <img 
            src={`${process.env.NEXT_PUBLIC_URL_PICTURE}${user.avatarUrl}`} 
            alt={user.fullname} 
            className={`h-full w-full object-cover ${isUploading ? 'opacity-50' : ''}`}
            onError={() => setImgError(true)}/>) : (
            <div className={`h-full w-full bg-[#0a6ed1] flex items-center justify-center text-xl font-bold text-white ${isUploading ? 'opacity-50' : ''}`}>
            {user?.shortName || "U"}
          </div>
        )}

        {/* Overlay khi đang upload hoặc khi hover chỉnh sửa */}
        {isEditing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isUploading ? <Loader2 className="animate-spin text-white" /> : <Edit2 className="text-white" size={20} />}
          </div>
        )}
      </div>

      {/* Input file ẩn để gọi qua fileInputRef */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      <div>
        <h2 className="font-bold text-zinc-900 dark:text-zinc-100">{user?.fullname}</h2>
        <span className="text-xs text-[#0a6ed1] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded flex items-center gap-1 w-fit"><ShieldCheck size={12} /> {user?.role}</span>
      </div>
    </div>

    {isEditing ? (
      <div className="space-y-4">
        {/* Input Section */}
        {['name', 'email', 'phone'].map((field) => (
          <div key={field}>
            <label className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-1">
              {field === 'name' ? 'Họ tên' : field === 'email' ? 'Email' : 'SĐT'}
            </label>
            <SapInput 
              icon={field === 'name' ? User : field === 'email' ? Mail : Phone} 
              value={formData[field as keyof typeof formData]} 
              onChange={(e: any) => setFormData({...formData, [field]: e.target.value})} 
            />
          </div>
        ))}
        
        <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <SapButton onClick={onSave} isLoading={isPending}>Lưu thay đổi</SapButton>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} 
            className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors border border-zinc-200 dark:border-zinc-600"
          >
            Hủy
          </button>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-3">
        <InfoItem icon={User} label="ID nhân viên" value={user?.id} />
        <InfoItem icon={Mail} label="Địa chỉ Email" value={user?.email || "Chưa cập nhật"} />
        <InfoItem icon={Phone} label="Số điện thoại" value={user?.phone || "Chưa cập nhật"} />
        <InfoItem icon={Building} label="Phòng ban" value={user?.department || "N/A"} />
        
        <button 
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
          className="mt-2 w-full border border-[#0a6ed1] dark:border-blue-500 text-[#0a6ed1] dark:text-blue-400 h-10 rounded text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          Chỉnh sửa thông tin
        </button>
      </div>
    )}
  </div>
);

const InputItem = ({ label, value, onChange }: any) => (
  <div>
    <label className="text-[11px] text-zinc-500 uppercase tracking-wide block mb-1">{label}</label>
    <input className="w-full h-10 px-3 border border-zinc-300 rounded focus:border-[#0a6ed1] outline-none text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const InfoItem = ({ icon: Icon, label, value }: any) => (
  // Thay bg-white bằng màu nền động theo theme
  <div className="flex items-center gap-4 p-4 bg-[var(--color-background)] border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors">
    <Icon className="text-zinc-400 dark:text-zinc-500" size={18} />
    <div>
      <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{label}</p>
      {/* Thay text-zinc-700 bằng màu chữ phù hợp với nền tối */}
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{value}</p>
    </div>
  </div>
);