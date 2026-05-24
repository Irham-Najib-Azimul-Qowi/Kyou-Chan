"use client";

export function BrushDivider() {
  return (
    <div className="relative mx-auto my-16 w-full max-w-5xl px-5 flex items-center justify-center">
      {/* Garis Horizontal Tipis dengan fade gradient di kedua sisi */}
      <div 
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(78, 203, 160, 0.2) 20%, rgba(78, 203, 160, 0.2) 80%, transparent 100%)"
        }}
        className="w-full h-[1px]"
      />
      {/* Titik kecil di tengah (Diamond) */}
      <div className="absolute bg-[var(--bg-deep)] px-4 text-[var(--jade)] font-medium text-xs select-none">
        ◆
      </div>
    </div>
  );
}
