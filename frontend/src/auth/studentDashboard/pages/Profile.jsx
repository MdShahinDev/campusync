import { motion } from "framer-motion";
import { Camera, Mail, Phone, MapPin, Edit } from "lucide-react";
import { Link } from "react-router-dom";

const profileData = {
  name: "User Name",
  email: "user@example.com",
  phone: "+880 123 456 789",
  location: "Dhaka, Bangladesh",
  role: "Resource Manager",
  joinDate: "January 2026",
  bio: "Passionate about managing resources efficiently and helping teams collaborate better.",
  deptartment: "Computer Science & Engineering"
};

export default function Profile() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Profile
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            View your profile information.
          </p>
        </div>
        <Link
          to="/student/profile/edit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 self-start"
        >
          <Edit size={16} />
          Edit Profile
        </Link>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        {/* Cover */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-accent-orange/20 to-accent-orange-hover/10 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-3xl font-bold border-4 border-bg-primary shadow-lg">
                U
              </div>
              <button className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-bg-primary border border-border-color text-text-muted hover:text-accent-orange transition-colors">
                <Camera size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pt-14 px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                {profileData.name}
              </h2>
              <p className="text-sm text-accent-orange font-medium">
                {profileData.role}
              </p>
            </div>
            <span className="text-xs text-text-muted bg-bg-secondary px-3 py-1.5 rounded-full self-start">
              Joined {profileData.joinDate}
            </span>
          </div>

          <p className="text-sm text-text-secondary mt-4 leading-relaxed">
            {profileData.bio}
          </p>

          {/* Details */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProfileDetail icon={<Mail size={16} />} label="Email" value={profileData.email} />
            <ProfileDetail icon={<Phone size={16} />} label="Phone" value={profileData.phone} />
            <ProfileDetail icon={<MapPin size={16} />} label="Location" value={profileData.location} />
            <ProfileDetail icon={<MapPin size={16} />} label="Departmen" value={profileData.deptartment} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ProfileDetail({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary">
      <span className="text-text-muted">{icon}</span>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}
