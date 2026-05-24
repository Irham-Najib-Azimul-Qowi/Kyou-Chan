'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    fetch('/api/admin/site-config')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, string> = {}
        data.config?.forEach((c: any) => { map[c.key] = c.value })
        setConfig(map)
        setLoading(false)
      })
  }, [])
  
  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/admin/site-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    setSaving(false)
    if (res.ok) toast.success('Settings saved!')
    else toast.error('Failed to save')
  }
  
  const FIELDS = [
    { key: 'bio',            label: 'Bio',            type: 'textarea' },
    { key: 'tagline',        label: 'Tagline',         type: 'text' },
    { key: 'open_for_hire',  label: 'Open for Hire',   type: 'toggle' },
    { key: 'github_url',     label: 'GitHub URL',      type: 'text' },
    { key: 'linkedin_url',   label: 'LinkedIn URL',    type: 'text' },
    { key: 'whatsapp_number',label: 'WhatsApp Number', type: 'text' },
    { key: 'email',          label: 'Email',           type: 'text' },
    { key: 'location',       label: 'Location',        type: 'text' },
  ]
  
  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Site Config</h1>
          <p className="text-sm mt-1 text-[var(--text-secondary)]">
            Edit your portfolio content and settings
          </p>
        </div>
        <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                           disabled:opacity-50 transition-all cursor-pointer"
                style={{ background: 'var(--jade)', color: 'var(--void)' }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
      
      <div className="space-y-5 rounded-2xl border p-6"
           style={{ background: 'var(--surface)', borderColor: 'var(--b1)' }}>
        {!loading && FIELDS.map(field => (
          <div key={field.key}>
            <label className="block text-xs font-mono mb-2 uppercase tracking-wider text-[var(--text-secondary)]">
              {field.label}
            </label>
            
            {field.type === 'toggle' ? (
              <button
                onClick={() => setConfig(c => ({
                  ...c,
                  [field.key]: c[field.key] === 'true' ? 'false' : 'true'
                }))}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-11 h-6 rounded-full relative transition-colors"
                     style={{
                       background: config[field.key] === 'true' ? 'var(--jade)' : 'var(--raised)'
                     }}>
                  <div className="absolute top-1 w-4 h-4 rounded-full transition-transform"
                       style={{
                         background: 'white',
                         left: config[field.key] === 'true' ? '24px' : '4px',
                         transition: 'left 0.2s'
                       }} />
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  {config[field.key] === 'true' ? 'Yes, open for hire' : 'Not available'}
                </span>
              </button>
            ) : field.type === 'textarea' ? (
              <textarea
                value={config[field.key] ?? ''}
                onChange={(e) => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                style={{
                  background: 'var(--raised)',
                  border: '1px solid var(--b1)',
                  color: 'var(--text-1)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--jade)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--b1)'}
              />
            ) : (
              <input
                type="text"
                value={config[field.key] ?? ''}
                onChange={(e) => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--raised)',
                  border: '1px solid var(--b1)',
                  color: 'var(--text-1)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--jade)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--b1)'}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
