"use client";

const skillsList = [
  "Python", "LangChain", "Gemini", "Pinecone", "MediaPipe", "TFLite", 
  "FastAPI", "Next.js", "React", "Laravel", "Kotlin", "Jetpack Compose", "Room"
];

export function MarqueeStrip() {
  // Triple the list to ensure a seamless looping effect
  const doubleList = [...skillsList, ...skillsList, ...skillsList, ...skillsList];

  return (
    <div 
      className="w-full border-y border-[var(--b1)] h-12 flex items-center overflow-hidden pointer-events-none relative z-10"
      style={{
        background: "linear-gradient(90deg, #080809 0%, #0e0e10 50%, #080809 100%)"
      }}
    >
      <div className="animate-marquee whitespace-nowrap flex items-center py-2">
        {doubleList.map((skill, index) => {
          // Alternating jade and indigo colors
          const isJade = index % 2 === 0;
          const textColor = isJade ? "text-[var(--jade)]" : "text-[var(--indigo)]";
          
          return (
            <span 
              key={index} 
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              className={`inline-flex items-center text-[13px] font-medium mx-6 ${textColor}`}
            >
              {skill}
              <span className="text-[var(--text-3)] ml-6 font-semibold select-none">
                ··
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
