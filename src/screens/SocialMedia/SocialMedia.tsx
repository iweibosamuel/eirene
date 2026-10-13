import { Button } from "../../components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Download, Share2 } from "lucide-react";
import ReactCrop, { Crop } from "react-image-crop";

const CARD_WIDTH = 540;
const CARD_HEIGHT = 675;

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Draw a source into the target rect like CSS `background-size: cover`
const drawCover = (
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  x: number,
  y: number,
  w: number,
  h: number
) => {
  const ratio = Math.max(w / sourceWidth, h / sourceHeight);
  const sw = w / ratio;
  const sh = h / ratio;
  ctx.drawImage(source, (sourceWidth - sw) / 2, (sourceHeight - sh) / 2, sw, sh, x, y, w, h);
};

const SHARE_TEXT =
  "I will be attending REVIVE: A Well Watered Garden! 24th Oct, 10AM at The Petra Place, Lekki. Create your invite: " +
  window.location.origin;

// Native share sheet with image files (iOS / Android browsers)
const canShareFiles =
  typeof navigator !== "undefined" &&
  !!navigator.canShare?.({
    files: [new File([""], "invite.png", { type: "image/png" })],
  });

export const SocialMedia = (): JSX.Element => {
  const [uploadedMedia, setUploadedMedia] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    width: 225,
    height: 250,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [inviteBlob, setInviteBlob] = useState<Blob | null>(null);
  const [layout, setLayout] = useState({ scale: 1, top: 160 });

  // Scale the card down so it always fits centred on screen
  useEffect(() => {
    const update = () => {
      const top = Math.min(220, Math.max(110, window.innerHeight * 0.18));
      const scale = Math.min(
        1,
        (window.innerWidth - 32) / CARD_WIDTH,
        (window.innerHeight - top - 100) / CARD_HEIGHT
      );
      setLayout({ scale: Math.max(scale, 0.4), top });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
          if (img.width * 10 === img.height * 9) {
            // Image already matches the photo box shape, use it directly
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

  // Render the finished invite to a PNG blob
  const renderInvite = async (): Promise<Blob | null> => {
    if (!uploadedMedia) return null;

    // Draw the invite directly on a canvas at 2x the on-screen card size,
    // mirroring the card layout (pill at 15.5%, photo box at 44%).
    const scale = 2;
    const width = CARD_WIDTH * scale;
    const height = CARD_HEIGHT * scale;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    await document.fonts.load(`900 ${16 * scale}px Roboto`);

    // Background
    const bg = await loadImage("/invite-bg.jpg");
    drawCover(ctx, bg, bg.naturalWidth, bg.naturalHeight, 0, 0, width, height);

    // "I will be attending" pill
    const pillText = "I WILL BE ATTENDING";
    const pillHeight = 40 * scale;
    const pillPadding = 20 * scale;
    ctx.font = `900 ${16 * scale}px Roboto, Helvetica, sans-serif`;
    const pillWidth = ctx.measureText(pillText).width + pillPadding * 2;
    const pillX = (width - pillWidth) / 2;
    const pillY = height * 0.155;
    ctx.fillStyle = "#e5168a";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pillText, width / 2, pillY + pillHeight / 2);

    // Photo / video, cropped to fill the rounded box
    const boxWidth = 252 * scale;
    const boxHeight = 280 * scale;
    const boxX = (width - boxWidth) / 2;
    const boxY = height * 0.44;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 16 * scale);
    ctx.clip();
    if (isVideo) {
      const video = cardRef.current?.querySelector("video");
      if (video) {
        drawCover(ctx, video, video.videoWidth, video.videoHeight, boxX, boxY, boxWidth, boxHeight);
      }
    } else {
      const photo = await loadImage(uploadedMedia);
      drawCover(ctx, photo, photo.naturalWidth, photo.naturalHeight, boxX, boxY, boxWidth, boxHeight);
    }
    ctx.restore();

    return new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1.0));
  };

  // Pre-render photo invites so sharing can open the share sheet instantly
  // (iOS rejects navigator.share if too much time passes after the tap).
  useEffect(() => {
    setInviteBlob(null);
    if (!uploadedMedia || isVideo) return;
    let cancelled = false;
    renderInvite()
      .then((blob) => {
        if (!cancelled) setInviteBlob(blob);
      })
      .catch((error) => console.error("Error pre-rendering invite:", error));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedMedia, isVideo]);

  const getInvite = async () => inviteBlob ?? (await renderInvite());

  const saveBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eirene-revive-invite-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    try {
      const blob = await getInvite();
      if (blob) saveBlob(blob);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    }
  };

  const handleShare = async () => {
    try {
      const blob = await getInvite();
      if (!blob) return;
      const file = new File([blob], "eirene-revive-invite.png", { type: "image/png" });

      // Native iOS / Android share sheet (WhatsApp, Instagram, TikTok, ...)
      await navigator.share({ files: [file], text: SHARE_TEXT });
    } catch (error) {
      if ((error as DOMException).name === "AbortError") return; // user closed the sheet
      console.error("Error sharing image:", error);
      alert("Sharing failed. Please download your invite and share it instead.");
    }
  };


  return (
    <>
      {/* Crop Modal */}
      {showCrop && tempImage && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-4 text-black">Crop Your Image</h2>
            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={9 / 10}
                minWidth={225}
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
                className="bg-[#e5168a] hover:bg-[#e5168a]/90"
              >
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      )}

      <main
        className="w-full min-h-screen overflow-auto relative flex flex-col items-center px-4 pb-24 lg:pb-8"
        style={{
          paddingTop: layout.top,
          backgroundColor: '#ffffff',
          backgroundImage: 'url("/artboard.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Invite card (wrapper reserves the scaled size so it stays centred) */}
        <div
          className="relative flex-shrink-0 z-10"
          style={{ width: CARD_WIDTH * layout.scale, height: CARD_HEIGHT * layout.scale }}
        >
        <div
          ref={cardRef}
          className="absolute top-0 left-0 w-[540px] h-[675px] rounded-[20px] overflow-hidden shadow-xl"
          style={{
            transform: `scale(${layout.scale})`,
            transformOrigin: 'top left',
            backgroundImage: 'url("/invite-bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute top-[15.5%] left-0 right-0 flex justify-center z-10">
            <p className="h-[40px] px-5 flex items-center justify-center rounded-full bg-[#e5168a] [font-family:'Roboto',Helvetica] font-black text-white text-[16px] leading-none uppercase whitespace-nowrap">
              I will be attending
            </p>
          </div>

          {/* Image container */}
          <div className="absolute top-[44%] left-0 right-0 mx-auto w-[252px] h-[280px] flex flex-col items-center justify-end p-[12px] rounded-[16px] overflow-hidden bg-white/70 z-10">
            {uploadedMedia &&
              (isVideo ? (
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
                <div
                  role="img"
                  aria-label="Uploaded"
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: `url(${uploadedMedia})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              ))}

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
              className="flex h-[44px] items-center justify-center p-[8px] w-full bg-white rounded-[126.6px] hover:bg-white/90 z-10 shadow"
            >
              <span className="[font-family:'Roboto',Helvetica] font-black text-black text-[13px] text-center whitespace-nowrap">
                {uploadedMedia ? "Change media" : "Add picture or video here"}
              </span>
            </Button>
          </div>
        </div>
        </div>

        {/* Share & download buttons */}
        {uploadedMedia && (
          <div className="fixed bottom-4 left-4 right-4 lg:relative lg:bottom-auto lg:left-auto lg:right-auto max-w-[440px] mx-auto lg:w-full lg:mt-6 flex gap-3 z-50">
            {canShareFiles && (
            <Button
              onClick={handleShare}
              className="flex-1 h-[50px] md:h-[60px] bg-[#e5168a] hover:bg-[#e5168a]/90 text-white rounded-[150px] flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5 md:w-6 md:h-6" />
              <span className="[font-family:'Roboto',Helvetica] font-black text-base md:text-lg">
                Share
              </span>
            </Button>
            )}
            <Button
              onClick={handleDownload}
              className="flex-1 h-[50px] md:h-[60px] bg-white hover:bg-white/90 text-[#e5168a] border-2 border-[#e5168a] rounded-[150px] flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5 md:w-6 md:h-6" />
              <span className="[font-family:'Roboto',Helvetica] font-black text-base md:text-lg">
                Download
              </span>
            </Button>
          </div>
        )}


      </main>
    </>
  );
};
