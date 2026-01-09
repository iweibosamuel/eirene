import { Button } from "../../components/ui/button";
import { CardContent } from "../../components/ui/card";
import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";

const steps = [
  {
    number: "Step 1",
    title: "Add your photo/ Video",
  },
  {
    number: "Step 2",
    title:
      "Download and share on your social media platforms. Use the #Openheavens #powerasofold #petralekki",
  },
  {
    number: "Step 3",
    title: "Get 10 other people to make this post!",
  },
];

export const SocialMedia = (): JSX.Element => {
  const [uploadedMedia, setUploadedMedia] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const isVideoFile = fileType.startsWith("video/");
    setIsVideo(isVideoFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedMedia(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      // Wait for all fonts to load
      await document.fonts.ready;
      
      const cardElement = cardRef.current;
      
      // Store original styles
      const originalBorder = cardElement.style.border;
      const originalOverflow = cardElement.style.overflow;
      const originalHeight = cardElement.style.height;
      const originalMaxHeight = cardElement.style.maxHeight;
      const uploadButton = cardElement.querySelector('button');
      const originalButtonDisplay = uploadButton ? (uploadButton as HTMLElement).style.display : '';
      
      // Temporarily remove border and hide upload button
      cardElement.style.border = 'none';
      if (uploadButton) {
        (uploadButton as HTMLElement).style.display = 'none';
      }
      
      // CRITICAL: Remove height constraints and overflow to capture full content
      cardElement.style.overflow = 'visible';
      cardElement.style.height = 'auto';
      cardElement.style.maxHeight = 'none';
      
      // Give extra time for layout to settle
      await new Promise(resolve => setTimeout(resolve, 200));

      // Import html2canvas dynamically
      const html2canvas = (await import("html2canvas")).default;
      
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Fix spacing in the cloned document before capture
          const styles = `
            [data-header] {
              display: flex !important;
              align-items: center !important;
              gap: 8px !important;
            }
            [data-header] h1 {
              margin-top: 4px !important;
            }
            [data-title] {
              margin-bottom: 24px !important;
            }
            [data-date] {
              margin-bottom: 24px !important;
            }
            [data-footer] {
              margin-top: 24px !important;
              padding-bottom: 20px !important;
            }
          `;
          
          const styleSheet = clonedDoc.createElement('style');
          styleSheet.textContent = styles;
          clonedDoc.head.appendChild(styleSheet);
        },
      });

      // Restore original styles
      cardElement.style.border = originalBorder;
      cardElement.style.overflow = originalOverflow;
      cardElement.style.height = originalHeight;
      cardElement.style.maxHeight = originalMaxHeight;
      if (uploadButton) {
        (uploadButton as HTMLElement).style.display = originalButtonDisplay;
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `open-heavens-invite-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        },
        "image/png",
        1.0
      );
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    }
  };

  return (
    <main className="bg-[#02006b] w-full min-h-screen lg:h-screen overflow-auto lg:overflow-hidden relative flex items-center justify-center p-4 md:p-6 lg:p-4">
      <div className="top-[-1321px] left-[-115px] w-[1832px] h-[1833px] bg-[#ee0b48] rounded-[916px/916.5px] absolute blur-[127px] z-0" />

      {/* Content Container */}
      <div className="relative w-full max-w-[1400px] h-auto lg:h-full lg:max-h-screen flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-between gap-6 lg:gap-8 py-4 lg:py-0 z-10">
        {/* Left side - Title and Steps */}
        <div className="flex flex-col gap-4 md:gap-6 lg:gap-4 flex-shrink-0 relative z-10 w-full lg:w-auto items-center lg:items-start">
          <header className="flex gap-[3.5px] items-center relative z-10 justify-center lg:justify-start">
            <img
              className="w-[clamp(50px,8vw,82.79px)] h-[clamp(50px,8vw,82.79px)] relative z-10 brightness-0 invert"
              alt="Layer"
              src="/layer-1-1.svg"
            />

            <h1 className="mt-[17.7px] [font-family:'Alumni_Sans',Helvetica] font-bold text-white text-[clamp(24px,2.5vw,43.6px)] tracking-[0] leading-[normal] whitespace-nowrap relative z-10">
              Open Heavens
            </h1>
          </header>

          <h1 className="[font-family:'Fjalla_One',Helvetica] font-normal text-white text-[clamp(40px,7vw,90px)] tracking-[0] leading-[1.08] relative z-10 text-center lg:text-left">
            CREATE AN <br />
            INVITE POST
          </h1>

          <nav className="hidden md:flex flex-col w-full max-w-[361px] items-start gap-3 lg:gap-2 relative z-10">
            {steps.map((step, index) => (
              <div key={index}>
                <article className="flex items-center justify-center gap-[3.85px] px-0 py-0 relative w-full flex-[0_0_auto] z-10">
                  <div className="relative flex-1 [font-family:'Bebas_Neue',Helvetica] font-normal text-white text-[clamp(18px,1.5vw,26.5px)] tracking-[0] leading-[normal] z-10">
                    <span className="[font-family:'Bebas_Neue',Helvetica] font-normal text-white text-[clamp(18px,1.5vw,26.5px)] tracking-[0]">
                      {step.number}
                      <br />
                    </span>

                    <span className="[font-family:'Roboto',Helvetica] font-black text-white text-[clamp(11px,0.9vw,15.4px)]">
                      {step.title}
                    </span>
                  </div>
                </article>

                {index < steps.length - 1 && (
                  <img
                    className="relative w-full h-px"
                    alt="Vector"
                    src="/vector-2.svg"
                  />
                )}
              </div>
            ))}

            {/* Download button */}
            {uploadedMedia && (
              <Button
                onClick={handleDownload}
                className="w-full mt-4 md:mt-8 h-[50px] md:h-[60px] bg-[#ee0b48] hover:bg-[#ee0b48]/90 text-white rounded-[150px] flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5 md:w-6 md:h-6" />
                <span className="[font-family:'Roboto',Helvetica] font-black text-base md:text-lg">
                  Download Your Invite
                </span>
              </Button>
            )}
          </nav>
        </div>

        {/* Right side - Visible card with border and button */}
        <div 
          ref={cardRef}
          className="flex flex-col w-full max-w-[500px] lg:max-w-[550px] h-auto min-h-[600px] lg:h-auto lg:max-h-[95vh] items-center justify-between gap-2.5 px-2.5 py-3 lg:py-4 rounded-[20px] overflow-auto border-[8px] lg:border-[11px] border-solid border-white flex-shrink-0 relative z-10"
          style={{
            backgroundImage: 'url(/BG.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
        <CardContent className="flex flex-col items-center gap-[10px] md:gap-[15px] lg:gap-[10px] relative w-full p-0 z-10" data-card-content>
          <header className="relative w-auto h-auto z-10 flex items-center gap-1" data-header>
            <img
              className="w-[clamp(40px,8vw,51px)] h-[clamp(40px,8vw,51px)] z-10 brightness-0 invert"
              alt="Layer"
              src="/layer-1.svg"
            />

            <h1 className="[font-family:'Alumni_Sans',Helvetica] font-bold text-white text-[clamp(18px,4vw,26.9px)] tracking-[0] leading-[normal] whitespace-nowrap z-10">
              Open Heavens
            </h1>
          </header>

          <section className="inline-flex flex-col items-center gap-2.5 relative flex-[0_0_auto] z-10">
            <p className="relative w-full max-w-[466.31px] mt-[-1.00px] [font-family:'Roboto',Helvetica] font-black text-white text-[clamp(14px,3vw,20.8px)] text-center tracking-[0] leading-[normal] z-10">
              I will be attending
            </p>

            <div className="relative w-auto z-10 flex flex-col items-center" data-title>
              <h2 className="[font-family:'Fjalla_One',Helvetica] font-normal text-white text-[clamp(42px,10vw,70px)] text-center tracking-[0] leading-[1.08] whitespace-nowrap z-10">
                POWER AS
              </h2>

              <h2 className="[font-family:'Fjalla_One',Helvetica] font-normal text-white text-[clamp(42px,10vw,70px)] text-center tracking-[0] leading-[1.08] whitespace-nowrap z-10">
                OF OLD
              </h2>
            </div>

            <div className="inline-flex flex-col items-center gap-[15px] relative flex-[0_0_auto] z-10">
              {/* Masked image container with fixed 400px height and border-radius */}
              <div className="flex w-full max-w-[400px] h-[400px] items-end justify-center relative rounded-[20px] overflow-hidden bg-gray-100 p-5">
                {uploadedMedia ? (
                  isVideo ? (
                    <video
                      src={uploadedMedia}
                      className="absolute inset-0 w-full h-full"
                      style={{ objectFit: 'contain' }}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={uploadedMedia}
                      alt="Uploaded"
                      className="absolute inset-0 w-full h-full"
                      style={{ objectFit: 'contain' }}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-400" />
                )}
                
                {/* Upload button positioned over the image */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-[45px] items-center justify-center gap-2.5 px-4 relative w-full max-w-full bg-white rounded-[150px] hover:bg-white/90 z-10"
                >
                  <Upload className="w-4 h-4" />
                  <span className="[font-family:'Roboto',Helvetica] font-black text-black text-sm">
                    {uploadedMedia ? "Change media" : "Add picture or video"}
                  </span>
                </Button>
              </div>
            </div>

            <div className="inline-flex flex-col items-center gap-[8px] lg:gap-[5px] relative flex-[0_0_auto] z-10" data-date>
              <div className="inline-flex flex-col items-start gap-1 lg:gap-0.5 relative flex-[0_0_auto] z-10">
                <p className="relative w-full max-w-[267.71px] mt-[-1.00px] [font-family:'Roboto',Helvetica] font-black text-white text-[clamp(14px,3vw,21.3px)] text-center tracking-[0] leading-[normal] z-10">
                  FRI 23 &amp; SAT 24, JAN 2026
                </p>

                <p className="relative w-full max-w-[267.71px] [font-family:'Roboto',Helvetica] font-bold text-white text-[clamp(12px,2.5vw,17.8px)] text-center tracking-[0] leading-[normal] z-10">
                  FRI 5PM, SAT 8AM &amp; 5PM
                </p>
              </div>
            </div>
          </section>
        </CardContent>

        <footer className="flex flex-col items-center justify-center gap-1 md:gap-2 lg:gap-1 relative w-full flex-[0_0_auto] z-10" data-footer>
          <h3 className="relative w-full max-w-[346.67px] mt-[-1.00px] [font-family:'Bebas_Neue',Helvetica] font-normal text-white text-[clamp(28px,6vw,44.4px)] text-center tracking-[0] leading-[normal] whitespace-nowrap z-10">
            the podium lekki
          </h3>

          <address className="relative w-full max-w-[346.67px] [font-family:'Roboto',Helvetica] font-bold text-white text-[clamp(10px,2vw,14.9px)] text-center tracking-[0] leading-[normal] not-italic z-10">
            124 T.F.KUBOYE RD, LEKKI, LAGOS.
          </address>
        </footer>
      </div>
      </div>
    </main>
  );
};
