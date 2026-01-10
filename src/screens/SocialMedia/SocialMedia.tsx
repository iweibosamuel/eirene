import { Button } from "../../components/ui/button";
import { CardContent } from "../../components/ui/card";
import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

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
  const [showCrop, setShowCrop] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    width: 250,
    height: 250,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const isVideoFile = fileType.startsWith("video/");
    setIsVideo(isVideoFile);

    if (isVideoFile) {
      // Videos don't need cropping
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedMedia(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Images need to be checked and possibly cropped
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          if (img.width === 250 && img.height === 250) {
            // Image is already 250x250, use it directly
            setUploadedMedia(reader.result as string);
          } else {
            // Image needs cropping
            setTempImage(reader.result as string);
            setShowCrop(true);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current || !tempImage) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    // Use original crop dimensions for high quality
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext("2d", { alpha: true });

    if (!ctx) return;

    // Disable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedMedia(reader.result as string);
          setShowCrop(false);
          setTempImage(null);
        };
        reader.readAsDataURL(blob);
      }
    }, "image/png", 1.0);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      // Wait for all fonts to load
      await document.fonts.ready;
      
      const cardElement = cardRef.current;
      
      // Wait for all images to load
      const images = cardElement.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
      
      const width = 582;
      const height = 666;
      
      // Store original styles
      const originalBorder = cardElement.style.border;
      const uploadButton = cardElement.querySelector('button');
      const originalButtonDisplay = uploadButton ? (uploadButton as HTMLElement).style.display : '';
      
      // Temporarily remove border and hide upload button
      cardElement.style.border = 'none';
      if (uploadButton) {
        (uploadButton as HTMLElement).style.display = 'none';
      }
      
      // Give extra time for layout to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      // Import html2canvas dynamically
      const html2canvas = (await import("html2canvas")).default;
      
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2,
        width: width,
        height: height,
        windowWidth: width,
        windowHeight: height,
        logging: true,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000,
        removeContainer: true,
      });

      // Restore original styles
      cardElement.style.border = originalBorder;
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
    <>
      {/* Crop Modal */}
      {showCrop && tempImage && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-4 text-black">Crop Your Image to 250x250</h2>
            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                minWidth={250}
                minHeight={250}
              >
                <img
                  ref={imgRef}
                  src={tempImage}
                  alt="Crop preview"
                  style={{ maxWidth: "100%" }}
                />
              </ReactCrop>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowCrop(false);
                  setTempImage(null);
                }}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCropComplete}
                className="bg-[#ee0b48] hover:bg-[#ee0b48]/90"
              >
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="bg-[#02006b] w-full min-h-screen lg:h-screen overflow-auto lg:overflow-hidden relative flex items-center justify-center p-4 md:p-6 lg:p-4">
      <div className="top-[-1321px] left-[-115px] w-[1832px] h-[1833px] bg-[#ee0b48] rounded-[916px/916.5px] absolute blur-[127px] z-0" />

      {/* Content Container */}
      <div className="relative w-full max-w-[1400px] h-auto lg:h-full lg:max-h-screen flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-between gap-6 lg:gap-8 py-4 lg:py-0 pb-24 lg:pb-0 z-10">
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
          </nav>

          {/* Download button - visible on all screen sizes */}
          {uploadedMedia && (
            <Button
              onClick={handleDownload}
              className="fixed bottom-4 left-4 right-4 lg:relative lg:bottom-auto lg:left-auto lg:right-auto w-auto max-w-[361px] mx-auto lg:w-full mt-0 lg:mt-8 h-[50px] md:h-[60px] bg-[#ee0b48] hover:bg-[#ee0b48]/90 text-white rounded-[150px] flex items-center justify-center gap-3 z-50"
            >
              <Download className="w-5 h-5 md:w-6 md:h-6" />
              <span className="[font-family:'Roboto',Helvetica] font-black text-base md:text-lg">
                Download Your Invite
              </span>
            </Button>
          )}
        </div>

        {/* Right side - Visible card with border and button */}
        <div 
          ref={cardRef}
          className="flex flex-col w-[582px] h-[666px] items-center justify-center gap-[8.44px] px-[8.44px] py-[16.88px] rounded-[16.88px] overflow-hidden border-[5.06px] border-solid border-white flex-shrink-0 relative z-10"
          style={{
            backgroundImage: 'url(/BG.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
        <CardContent className="inline-flex flex-col items-center justify-center gap-[15.97px] p-0 relative w-full z-10" data-card-content>
          <header className="flex items-center gap-1 z-10" data-header>
            <img
              className="w-[43.04px] h-[43.04px] z-10 brightness-0 invert"
              alt="Layer"
              src="/layer-1.svg"
            />

            <h1 className="[font-family:'Alumni_Sans',Helvetica] font-bold text-white text-[22.7px] tracking-[0] leading-[normal] whitespace-nowrap z-10">
              Open Heavens
            </h1>
          </header>

          <section className="inline-flex flex-col items-center gap-[7.98px] relative flex-[0_0_auto] z-10">
            <p className="w-[393.57px] mt-[-1.00px] [font-family:'Roboto',Helvetica] font-black text-white text-[17.6px] text-center tracking-[0] leading-[normal] z-10">
              I will be attending
            </p>

            <div className="relative w-[247.14px] h-[133.22px] z-10" data-title>
              <h2 className="absolute top-0 left-0 w-[243px] [font-family:'Fjalla_One',Helvetica] font-normal text-white text-[64.3px] text-center tracking-[0] leading-[69.6px] whitespace-nowrap z-10">
                POWER AS
              </h2>
              <h2 className="absolute top-[63px] left-11 [font-family:'Fjalla_One',Helvetica] font-normal text-white text-[64.3px] text-center tracking-[0] leading-[69.6px] whitespace-nowrap z-10">
                OF OLD
              </h2>
            </div>

            <div className="inline-flex flex-col items-center gap-[15px] relative flex-[0_0_auto] z-10 mt-6">
              {/* Image container */}
              <div className="flex flex-col w-[250px] h-[250px] items-center justify-end gap-[8.44px] p-[16.88px] rounded-[16.88px] overflow-hidden relative bg-gray-100">
                {uploadedMedia ? (
                  isVideo ? (
                    <video
                      src={uploadedMedia}
                      className="absolute inset-0 w-full h-full"
                      style={{ objectFit: 'cover' }}
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
                      style={{ objectFit: 'cover' }}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-400" />
                )}
                
                {/* Upload button positioned at bottom */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-[51.48px] items-center justify-center gap-[8.44px] p-[8.44px] w-full bg-white rounded-[126.6px] hover:bg-white/90 z-10"
                >
                  <span className="[font-family:'Roboto',Helvetica] font-black text-black text-[13.5px] text-center tracking-[0] leading-[normal] whitespace-nowrap">
                    {uploadedMedia ? "Change media" : "Add picture or video"}
                  </span>
                </Button>
              </div>
            </div>

            <img
              src="/date.png"
              alt="Event Date and Location"
              className="w-[90%] h-auto mt-6"
            />
          </section>
        </CardContent>
      </div>
      </div>
    </main>
    </>
  );
};
