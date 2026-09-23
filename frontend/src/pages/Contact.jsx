import { useState } from "react";
import {
  Mail,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
} from "lucide-react";
import Button from "../components/common/Button/Button";
import MotionUp from "../components/animation/Motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/axios";

const Contact = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const newErrors = {};

    const name = formData.name.trim();
    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length < 2 || name.length > 100) {
      newErrors.name = "Name must be between 2 and 100 characters";
    }

    const email = formData.email.trim();
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please provide a valid email";
    }

    const subject = formData.subject.trim();
    if (!subject) {
      newErrors.subject = "Subject is required";
    } else if (subject.length < 2 || subject.length > 200) {
      newErrors.subject = "Subject must be between 2 and 200 characters";
    }

    const message = formData.message.trim();
    if (!message) {
      newErrors.message = "Message is required";
    } else if (message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (message.length > 5000) {
      newErrors.message = "Message cannot exceed 5000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    setServerError("");

    try {
      await api.post("/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      setStatus("success");
      setFormData({ name: user?.name || "", email: user?.email || "", subject: "", message: "" });
    } catch (err) {
      setStatus("idle");
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to send message. Please try again later."
        );
      }
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/15 to-amber-500/10 blur-[140px] rounded-full pointer-events-none dark:opacity-80 opacity-40"></div>
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-blue-500/15 to-indigo-500/10 blur-[140px] rounded-full pointer-events-none dark:opacity-60 opacity-30"></div>

        <MotionUp>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card border border-orange-500/30 bg-orange-500/5 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm backdrop-blur-md mb-6">
              <Layers className="w-4 h-4 text-accent-orange" />
              <span className="text-accent-orange font-bold">Get in Touch</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary leading-[1.1] mb-6">
              Contact <span className="text-accent-orange">Us</span>
            </h1>

            <p className="text-secondary max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Have a question, feedback, or need assistance?
              <br className="hidden sm:block" />
              We&apos;re here to help.
            </p>
          </div>
        </MotionUp>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <MotionUp>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              {/* Contact Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-extrabold text-primary">
                    Contact Information
                  </h2>
                  <p className="text-secondary text-sm leading-relaxed">
                    Reach out to us through any of the following channels. We aim to respond within 24 hours on business days.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl glass-card border border-border-color">
                    <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-accent-orange" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-primary mb-0.5">Email</h3>
                      <a
                        href="mailto:support@campusshare.edu"
                        className="text-sm text-secondary hover:text-accent-orange transition-colors"
                      >
                        support@campusshare.edu
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl glass-card border border-border-color">
                    <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-accent-orange" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-primary mb-0.5">Response Time</h3>
                      <p className="text-sm text-secondary">
                        We typically respond within 24 hours during business days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div className="p-6 sm:p-8 rounded-2xl glass-card border border-border-color">
                  <h2 className="text-xl font-extrabold text-primary mb-6">
                    Send Us a Message
                  </h2>

                  {status === "success" ? (
                    <MotionUp>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-primary mb-2">
                          Message Sent Successfully
                        </h3>
                        <p className="text-secondary text-sm max-w-md mb-6">
                          Thank you for reaching out. We&apos;ve received your message and will get back to you soon.
                        </p>
                        <Button
                          onClick={() => setStatus("idle")}
                          variant="outline"
                          size="md"
                        >
                          Send Another Message
                        </Button>
                      </div>
                    </MotionUp>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                      {serverError && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {serverError}
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-bold text-primary mb-1.5"
                        >
                          Full Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className={`w-full px-4 py-2.5 rounded-xl bg-bg-secondary border text-sm text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-orange/40 transition-colors ${
                            errors.name
                              ? "border-red-500/50"
                              : "border-border-color"
                          }`}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-bold text-primary mb-1.5"
                        >
                          Email Address
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className={`w-full px-4 py-2.5 rounded-xl bg-bg-secondary border text-sm text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-orange/40 transition-colors ${
                            errors.email
                              ? "border-red-500/50"
                              : "border-border-color"
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-bold text-primary mb-1.5"
                        >
                          Subject
                        </label>
                        <input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="What is this about?"
                          className={`w-full px-4 py-2.5 rounded-xl bg-bg-secondary border text-sm text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-orange/40 transition-colors ${
                            errors.subject
                              ? "border-red-500/50"
                              : "border-border-color"
                          }`}
                        />
                        {errors.subject && (
                          <p className="mt-1 text-xs text-red-500">{errors.subject}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-bold text-primary mb-1.5"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us how we can help..."
                          className={`w-full px-4 py-2.5 rounded-xl bg-bg-secondary border text-sm text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-orange/40 transition-colors resize-none ${
                            errors.message
                              ? "border-red-500/50"
                              : "border-border-color"
                          }`}
                        />
                        {errors.message && (
                          <p className="mt-1 text-xs text-red-500">{errors.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={status === "submitting"}
                        className="w-full sm:w-auto"
                      >
                        {status === "submitting" ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </MotionUp>
      </section>
    </div>
  );
};

export default Contact;
