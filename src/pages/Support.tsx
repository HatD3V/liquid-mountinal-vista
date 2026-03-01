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
    <div className="min-h-screen pt-16">
      <iframe
        ref={iframeRef}
        data-tally-src="https://tally.so/r/9qdRyQ"
        width="100%"
        style={{ position: "fixed", top: 64, left: 0, right: 0, bottom: 0, border: 0 }}
        height="calc(100vh - 64px)"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="MountinalCorp Support."
      />
    </div>
  );
};

export default Support;
