import { useEffect, useRef } from "react";

const Support = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Load Tally embed script
    const script = document.createElement("script");
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <iframe
        ref={iframeRef}
        data-tally-src="https://tally.so/r/9qdRyQ"
        width="100%"
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, border: 0 }}
        height="100%"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="Mountinal-Corp Support."
      />
    </div>
  );
};

export default Support;
