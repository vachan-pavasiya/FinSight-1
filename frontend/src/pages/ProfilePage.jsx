import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  
  const { register: regProfile, handleSubmit: submitProfile } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '' }
  });
  
  const { register: regPwd, handleSubmit: submitPwd, reset: resetPwd, formState: { errors: pwdErrors } } = useForm();

  const onProfileSubmit = async (data) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      resetPwd();
    } catch (err) {
      toast.error('Failed to change password');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold gradient-text">Profile Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
          <form onSubmit={submitProfile(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input {...regProfile('name', { required: true })} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email Address</label>
              <input type="email" {...regProfile('email', { required: true })} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Joined Date</label>
              <input type="text" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} disabled className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-gray-500 cursor-not-allowed" />
            </div>
            <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">Save Changes</button>
          </form>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
          <form onSubmit={submitPwd(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Current Password</label>
              <input type="password" {...regPwd('currentPassword', { required: true })} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input type="password" {...regPwd('newPassword', { required: true, minLength: 6 })} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
              <input type="password" {...regPwd('confirmPassword', { required: true })} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none transition" />
            </div>
            <button type="submit" className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
