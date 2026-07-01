"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Building, ShieldCheck, Loader2, Edit2, Save, XCircle } from "lucide-react";
import { UserProfile } from "@/features/auth/hooks/useUserProfile";
import { useUpdateProfile } from "@/features/auth/hooks/useUpdateProfile"; // Giả định bạn đã tạo hook này

// 1. Định nghĩa Interface này ở đây
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
  isLoading?: boolean;
}

export const ProfileModal = ({ isOpen, onClose, user, isLoading }: ProfileModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const { mutate, isPending } = useUpdateProfile();

  // Reset dữ liệu mỗi khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData({ name: user.fullname, email: user.email || "", phone: user.phone || "" });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSave = () => {
    mutate(formData, { onSuccess: () => setIsEditing(false) });
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#1d2d3d] p-6 text-white text-center relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={20} /></button>
            <div className="h-20 w-20 bg-[#0a6ed1] rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3 border-4 border-white/10">
              {user?.shortName || "U"}
            </div>
            <h2 className="font-semibold text-lg">{user?.fullname}</h2>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            {isEditing ? (
              <div className="space-y-3">
                <InputItem label="Họ tên" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
                <InputItem label="Email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
                <InputItem label="SĐT" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} />
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                    {isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Lưu
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                    <XCircle size={16} /> Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <InfoItem icon={User} label="ID" value={user?.id} />
                <InfoItem icon={Mail} label="Email" value={user?.email || "Chưa cập nhật"} />
                <InfoItem icon={Phone} label="SĐT" value={user?.phone || "Chưa cập nhật"} />
                <InfoItem icon={Building} label="Phòng ban" value={user?.department || "N/A"} />
                <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-center gap-2 text-blue-600 text-sm font-medium py-2 hover:bg-blue-50 rounded-lg">
                  <Edit2 size={16} /> Chỉnh sửa thông tin
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const InputItem = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => (
  <div className="flex flex-col">
    <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{label}</label>
    <input 
      className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

// Component cho Input chỉnh sửa
const InfoItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
    <Icon className="text-slate-400 shrink-0" size={16} />
    <div className="flex flex-col">
      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-slate-700 font-medium">{value}</span>
    </div>
  </div>
);