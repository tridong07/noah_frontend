"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Building, ShieldCheck, Loader2, Edit2, Settings } from "lucide-react";
import { UserProfile } from "@/features/auth/hooks/useUserProfile";
import { useUpdateProfile } from "@/features/auth/hooks/useUpdateProfile";
import { SettingsContent } from "@/features/settings/components/SettingsContent";
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
    if (user) setFormData({ name: user.fullname, email: user.email || "", phone: user.phone || "" });
  }, [user]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" 
        onClick={onClose}
      >
        <motion.div 
          onClick={(e) => e.stopPropagation()} 
          className="bg-[var(--color-background)] border border-[var(--color-border-subtle)] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#1d2d3d] p-6 text-white flex-shrink-0 transition-colors">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={20} /></button>
            <div className="flex justify-center gap-8 mt-2">
              {[ {id: 'profile', label: 'Thông tin cá nhân', icon: User}, {id: 'settings', label: 'Cài đặt', icon: Settings} ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
                  className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${activeTab === tab.id ? "border-blue-400 text-white" : "border-transparent text-white/50"}`}>
                  <tab.icon size={16} /> <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-grow overflow-y-auto p-8 bg-[var(--color-background)] transition-colors">
             {activeTab === "profile" ? (
               <ProfileSection 
                  user={user} isEditing={isEditing} formData={formData} setFormData={setFormData} 
                  setIsEditing={setIsEditing} isPending={isPending} onSave={() => mutate(formData, { onSuccess: () => setIsEditing(false) })} 
                  imgError={imgError} setImgError={setImgError} fileInputRef={fileInputRef} isUploading={isUploading}
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

const ProfileSection = ({ user, isEditing, formData, setFormData, setIsEditing, onSave, isPending, imgError, setImgError, fileInputRef, isUploading, uploadAvatar }: any) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4 p-5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-card-bg)]">
      
      {/* Cập nhật phần Avatar */}
      <div className="h-16 w-16 rounded-full overflow-hidden border border-[var(--color-border-subtle)] bg-[var(--color-background)] flex items-center justify-center shrink-0 relative group cursor-pointer"
           onClick={() => fileInputRef.current?.click()} // Trigger input
      >
        {user?.avatarUrl && !imgError ? (
          <img src={`${process.env.NEXT_PUBLIC_URL_PICTURE}${user.avatarUrl}`} alt={user.fullname} className="h-full w-full object-cover" onError={() => setImgError(true)}/>
        ) : (
          <div className="h-full w-full bg-[var(--color-sap-blue)] flex items-center justify-center text-xl font-bold text-white">
            {user?.shortName || "U"}
          </div>
        )}
        
        {/* Overlay khi hover để người dùng biết có thể đổi ảnh */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? <Loader2 className="animate-spin text-white" size={20} /> : <Edit2 className="text-white" size={20} />}
        </div>
      </div>
      
      {/* Input ẩn để chọn file */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadAvatar(file);
        }}
      />

      <div>
        <h2 className="font-bold text-[var(--color-foreground)]">{user?.fullname}</h2>
        <span className="text-xs text-[var(--color-sap-blue)] bg-[var(--color-sap-blue)]/10 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
          <ShieldCheck size={12} /> {user?.role}
        </span>
      </div>
    </div>

    {isEditing ? (
      <div className="space-y-4">
        {['name', 'email', 'phone'].map((field) => (
          <div key={field}>
            <label className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wide block mb-1">
              {field === 'name' ? 'Họ tên' : field === 'email' ? 'Email' : 'SĐT'}
            </label>
            <SapInput 
              icon={field === 'name' ? User : field === 'email' ? Mail : Phone} 
              value={formData[field as keyof typeof formData]} 
              onChange={(e: any) => setFormData({...formData, [field]: e.target.value})} 
            />
          </div>
        ))}
        <div className="flex gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
          <SapButton onClick={onSave} isLoading={isPending}>Lưu thay đổi</SapButton>
          <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-lg text-sm font-medium border border-[var(--color-border-subtle)] text-[var(--color-foreground)] hover:bg-[var(--color-border-subtle)]">Hủy</button>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-3">
        <InfoItem icon={User} label="ID nhân viên" value={user?.id} />
        <InfoItem icon={Mail} label="Địa chỉ Email" value={user?.email || "Chưa cập nhật"} />
        <InfoItem icon={Phone} label="Số điện thoại" value={user?.phone || "Chưa cập nhật"} />
        <InfoItem icon={Building} label="Phòng ban" value={user?.department || "N/A"} />
        <SapButton onClick={() => setIsEditing(true)} > Chỉnh sửa thông tin</SapButton>
      </div>
    )}
  </div>
);

const InfoItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-4 p-4 bg-[var(--color-card-bg)] border border-[var(--color-border-subtle)] rounded-lg transition-colors">
    <Icon className="text-[var(--color-text-muted)]" size={18} />
    <div>
      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-[var(--color-foreground)]">{value}</p>
    </div>
  </div>
);