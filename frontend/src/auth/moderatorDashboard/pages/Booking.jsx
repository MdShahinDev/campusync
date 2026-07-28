import { motion } from "framer-motion";
import { Calendar, Clock, User } from "lucide-react";

const bookings = [
  {
    id: 1,
    resource: "Conference Room A",
    user: "John Doe",
    date: "2026-07-28",
    time: "10:00 AM - 12:00 PM",
    status: "Confirmed",
  },
  {
    id: 2,
    resource: "Lab B",
    user: "Jane Smith",
    date: "2026-07-28",
    time: "2:00 PM - 5:00 PM",
    status: "Pending",
  },
  {
    id: 3,
    resource: "Meeting Room C",
    user: "Mike Johnson",
    date: "2026-07-29",
    time: "9:00 AM - 11:00 AM",
    status: "Confirmed",
  },
  {
    id: 4,
    resource: "Computer Lab D",
    user: "Sarah Wilson",
    date: "2026-07-29",
    time: "1:00 PM - 4:00 PM",
    status: "Pending",
  },
];

export default function Booking() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Bookings
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          View and manage resource bookings.
        </p>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-2">
                <h3 className="font-bold text-text-primary">
                  {booking.resource}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <User size={14} /> {booking.user}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {booking.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {booking.time}
                  </span>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1.5 rounded-full self-start sm:self-center ${
                  booking.status === "Confirmed"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-yellow-500/10 text-yellow-500"
                }`}
              >
                {booking.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
