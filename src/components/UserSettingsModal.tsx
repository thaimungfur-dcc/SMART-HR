import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import { dbSync } from '../services/dbSync';
import { DraggableModal } from './shared/DraggableModal';
import { Camera, Upload, RefreshCw, Check, Trash2, User as UserIcon, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const { user, login } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Camera refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(user?.avatar || null);
      setError(null);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, user]);

  const startCamera = async () => {
    setError(null);
    setIsCameraActive(true);
    setPreviewUrl(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      setError('Could not access device camera. Please check camera permissions in your browser settings.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        const size = Math.min(video.videoWidth, video.videoHeight);
        canvas.width = size;
        canvas.height = size;
        
        // Crop center square
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        
        context.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewUrl(dataUrl);
        stopCamera();
      }
    }
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPreviewUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          text: 'Please upload an image file (JPEG, PNG, etc.)',
          confirmButtonColor: '#932c2e'
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAndSave = async () => {
    if (!previewUrl || !user) return;
    setIsUploading(true);
    
    try {
      let blob: Blob;
      if (previewUrl.startsWith('data:')) {
        const response = await fetch(previewUrl);
        blob = await response.blob();
      } else {
        setIsUploading(false);
        return;
      }

      // 1. Upload to Firebase Storage
      const avatarRef = ref(storage, `avatars/${user.id}_${Date.now()}.jpg`);
      await uploadBytes(avatarRef, blob);
      const downloadUrl = await getDownloadURL(avatarRef);

      // 2. Compile updated user object
      const updatedUser = {
        ...user,
        avatar: downloadUrl
      };

      // 3. Update in Firestore & Local storage
      await dbSync.update('users', [updatedUser]);

      try {
        // Find matching Employee profile and update it too
        const empRes = await dbSync.read('employees');
        if (empRes?.status === 'success' && empRes?.data?.items) {
          const matchingEmp = empRes.data.items.find((item: any) => item.employeeId === user.employeeId);
          if (matchingEmp) {
            await dbSync.update('employees', [{
              ...matchingEmp,
              avatar: downloadUrl
            }]);
          }
        }
      } catch (empErr) {
        console.warn('Could not update Employee profile avatar:', empErr);
      }

      // Update local AuthContext state
      login(updatedUser);

      Swal.fire({
        icon: 'success',
        title: 'Profile Saved',
        text: 'Your profile photo has been successfully updated on Firebase Storage.',
        confirmButtonColor: '#3f809e'
      });

      onClose();
    } catch (err: any) {
      console.error('Failed to change avatar:', err);
      Swal.fire({
        icon: 'error',
        title: 'Profile Update Failed',
        text: err.message || 'Error uploading photo to Firebase Storage.',
        confirmButtonColor: '#932c2e'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearPhoto = () => {
    setPreviewUrl(null);
    stopCamera();
  };

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile Settings"
      width="max-w-md"
    >
      <div className="flex flex-col h-full bg-slate-50 text-slate-800" id="user-profile-settings-modal">
        {/* User Quick Summary */}
        <div className="p-6 bg-gradient-to-r from-[#1d2636] to-[#212c46] text-white flex items-center gap-4 shrink-0 border-b border-slate-700/50">
          <div className="relative">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt={user?.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-[#b58c4f] shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-[#3f809e] to-[#4d87a8] rounded-full flex items-center justify-center font-black text-xl text-white">
                {user?.name?.charAt(0) || <UserIcon size={24} />}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h4 className="font-extrabold text-[#b58c4f] uppercase tracking-widest text-[15px]">{user?.name}</h4>
            <span className="text-xs text-slate-300 font-bold mt-1 uppercase">ID: {user?.employeeId}</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-1">Role: {user?.role}</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => { setActiveTab('camera'); stopCamera(); }}
            className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 decoration-none focus:outline-none ${
              activeTab === 'camera'
                ? 'border-[#3f809e] text-[#3f809e]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Camera Capture
          </button>
          <button
            onClick={() => { setActiveTab('upload'); stopCamera(); }}
            className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 decoration-none focus:outline-none ${
              activeTab === 'upload'
                ? 'border-[#3f809e] text-[#3f809e]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Local Upload
          </button>
        </div>

        {/* Main Interface Content */}
        <div className="p-6 flex-1 flex flex-col justify-center items-center overflow-y-auto">
          {activeTab === 'camera' ? (
            <div className="w-full flex flex-col items-center gap-4">
              {isCameraActive ? (
                <div className="relative w-64 h-64 bg-black rounded-full overflow-hidden border-2 border-slate-300 shadow-inner flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-2 border-slate-300 bg-slate-200 shadow-inner flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Captured view" />
                  ) : (
                    <UserIcon className="w-24 h-24 text-slate-400" />
                  )}
                </div>
              )}

              {error && (
                <p className="text-xs text-[#932c2e] font-black text-center max-w-xs">{error}</p>
              )}

              <div className="flex gap-2">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3f809e] text-white text-xs font-black uppercase tracking-wider hover:bg-[#32667e] active:scale-95 transition-all shadow-md"
                  >
                    <Camera size={16} />
                    {previewUrl && previewUrl !== user?.avatar ? 'Retake Photo' : 'Activate Camera'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={capturePhoto}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#657f4d] text-white text-xs font-black uppercase tracking-wider hover:bg-[#4e633a] active:scale-95 transition-all shadow-md"
                    >
                      <Check size={16} />
                      Capture Frame
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-400 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-500 active:scale-95 transition-all shadow-md"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-4">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full max-w-xs h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-[#3f809e] bg-[#3f809e]/5' 
                    : 'border-slate-300 bg-white hover:border-[#3f809e] hover:bg-slate-50'
                }`}
                onClick={() => document.getElementById('avatar-file-upload')?.click()}
              >
                <input 
                  type="file" 
                  id="avatar-file-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                
                {previewUrl ? (
                  <img src={previewUrl} className="w-40 h-40 object-cover rounded-full border border-slate-200 shadow-md" alt="Preview" />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                      <Upload size={24} />
                    </div>
                    <span className="text-xs font-black uppercase text-slate-600 tracking-wider">Drag & Drop Image</span>
                    <span className="text-[10px] text-slate-400 mt-2 font-medium">Or click to select a local file</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="p-6 bg-slate-100 border-t border-slate-200 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer text-slate-500"
          >
            Cancel
          </button>
          
          <button
            onClick={handleUploadAndSave}
            disabled={isUploading || !previewUrl || previewUrl === user?.avatar}
            className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
              isUploading || !previewUrl || previewUrl === user?.avatar
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-[#3f809e] to-[#4d87a8] text-white hover:shadow-lg active:scale-95 cursor-pointer'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save Avatar
              </>
            )}
          </button>
        </div>
      </div>
    </DraggableModal>
  );
}
