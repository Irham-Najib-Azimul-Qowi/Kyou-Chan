import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundColor: "#080809",
            color: "#EEEEF0",
            padding: "80px",
            justifyContent: "space-between",
            fontFamily: "serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle Grid Lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.1,
              display: "flex",
              flexWrap: "wrap",
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Radial Glow Blob - Jade */}
          <div
            style={{
              position: "absolute",
              left: "-10%",
              bottom: "-20%",
              width: "50%",
              height: "50%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(61,214,140,0.15) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Radial Glow Blob - Indigo */}
          <div
            style={{
              position: "absolute",
              right: "-10%",
              top: "-20%",
              width: "50%",
              height: "50%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Large Faint Kanji watermark in the center/right */}
          <div
            style={{
              position: "absolute",
              right: "40px",
              bottom: "20px",
              fontSize: "300px",
              fontWeight: 900,
              color: "#3DD68C",
              opacity: 0.03,
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            知
          </div>

          {/* Top Row: Badge & domain */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "9999px",
                border: "1px solid rgba(61,214,140,0.3)",
                backgroundColor: "rgba(61,214,140,0.06)",
                padding: "6px 16px",
                fontSize: "14px",
                color: "#3DD68C",
                fontWeight: "bold",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#3DD68C",
                }}
              />
              Live inference active
            </div>
            <span
              style={{
                fontSize: "16px",
                color: "#52525A",
                fontWeight: "bold",
                letterSpacing: "0.1em",
              }}
            >
              NAJINKYOU.DEV
            </span>
          </div>

          {/* Main content row */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              zIndex: 10,
            }}
          >
            {/* Huge Kanji */}
            <div
              style={{
                fontSize: "100px",
                fontWeight: 900,
                color: "#3DD68C",
                lineHeight: 0.9,
              }}
            >
              名人強
            </div>

            {/* English Title */}
            <div
              style={{
                fontSize: "44px",
                fontWeight: 300,
                color: "#9696A0",
                letterSpacing: "0.2em",
                marginTop: "16px",
                textTransform: "uppercase",
              }}
            >
              Najin Kyou
            </div>

            {/* Decorative Divider */}
            <div
              style={{
                width: "60px",
                height: "2px",
                backgroundColor: "#3DD68C",
                margin: "24px 0",
              }}
            />

            {/* Subtext */}
            <div
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                color: "#3DD68C",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Data Scientist & AI Engineer
            </div>

            <div
              style={{
                fontSize: "16px",
                color: "#52525A",
                marginTop: "8px",
                fontWeight: 300,
              }}
            >
              RAG pipelines · Computer Vision · Mobile Deep Learning
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
