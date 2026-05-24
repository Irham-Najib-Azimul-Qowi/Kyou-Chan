"use client";
import { useState, useRef } from "react";
import { 
  Settings, 
  Upload, 
  ToggleLeft, 
  ToggleRight, 
  MessageCircle, 
  Save 
} from "lucide-react";
import toast from "react-hot-toast";

export default function SiteConfigPage() {
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [bio, setBio] = useState(
    "Irham Najib Azimul Qowi is a Software Engineering student at Politeknik Negeri Madiun, Indonesia. Under the stage name Najin Kyou, he focuses on practical AI: RAG, machine learning, computer vision, and applications."
  );
  const [isFreelanceOpen, setIsFreelanceOpen] = useState(true);
  const [githubUrl, setGithubUrl] = useState("https://github.com/irhamqowi");
  const [linkedinUrl, setLinkedinUrl] = useState("https://linkedin.com/in/irham-najib");
  const [whatsappNumber, setWhatsappNumber] = useState("+6281234567890");
  
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePreview(url);
      toast.success("Profile photo uploaded to preview!");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Site configuration saved successfully (simulated)!");
  };

  return (
    <div className="space-y-6 relative z-10 max-w-2xl">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <h2 
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
          className="text-3xl font-light text-[var(--text-primary)] flex items-center gap-2"
        >
          <Settings className="h-6 w-6 text-[var(--jade)]" /> Site Configuration
        </h2>
        <p className="text-xs text-[var(--text-secondary)] font-light mt-1">
          Adjust your global portfolio data fields, open status, and social bindings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-[var(--bg-surface)] border border-[var(--border-normal)] rounded-xl p-6 shadow-sm">
        
        {/* Profile Picture Upload & Preview */}
        <div className="space-y-3">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
            Profile Photo
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-subtle)]">
            <div className="relative w-20 h-20 rounded-full border-2 border-[var(--jade-border)] bg-[var(--bg-void)] overflow-hidden flex items-center justify-center">
              {profilePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={profilePreview} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span 
                  style={{ fontFamily: '"Noto Serif JP", serif', fontWeight: 900 }}
                  className="text-3xl text-[var(--jade)] select-none"
                >
                  名
                </span>
              )}
            </div>
            
            <div className="space-y-2 text-center sm:text-left">
              <input 
                type="file" 
                ref={fileRef} 
                onChange={handleFileChange} 
                accept="image/*"
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-[var(--bg-overlay)] border border-[var(--border-normal)] hover:border-[var(--jade-border)] text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--jade)] transition-colors cursor-pointer mx-auto sm:mx-0"
              >
                <Upload className="h-4 w-4" /> Upload New Photo
              </button>
              <p className="text-[10px] text-[var(--text-muted)] font-light">
                Supports JPG, PNG or WEBP. Max file size: 2MB. Direct upload to Supabase Storage.
              </p>
            </div>
          </div>
        </div>

        {/* Bio text area */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
            Professional Bio / Summary
          </label>
          <textarea
            required
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)] transition-all resize-y"
          />
        </div>

        {/* Open for freelance switch */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-subtle)]">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-primary)]">
              Freelance & Work Status
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-light block">
              Toggle this state to update the pulsing active badge on your homepage.
            </span>
          </div>
          
          <button
            type="button"
            onClick={() => setIsFreelanceOpen(!isFreelanceOpen)}
            className="text-[var(--text-secondary)] hover:text-[var(--jade)] p-1 cursor-pointer transition-colors"
          >
            {isFreelanceOpen ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[var(--jade)]">Open for Freelance</span>
                <ToggleRight className="h-8 w-8 text-[var(--jade)]" />
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Closed for Freelance</span>
                <ToggleLeft className="h-8 w-8 text-[var(--text-muted)]" />
              </div>
            )}
          </button>
        </div>

        {/* Social URL controls */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
          <span className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
            Social Coordinates
          </span>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* GitHub */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5 text-[var(--text-muted)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg> GitHub URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)]"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5 text-[var(--text-muted)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg> LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)]"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5 text-[var(--text-muted)]" /> WhatsApp Number
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-[var(--bg-raised)] border border-[var(--border-normal)] rounded px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--jade-border)]"
              />
            </div>
          </div>
        </div>

        {/* Save button block */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-[var(--jade)] hover:bg-[#5ae6b5] text-[var(--bg-void)] px-6 py-3 rounded font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" /> Save Global Configuration
          </button>
        </div>

      </form>
    </div>
  );
}
