import { useEffect, useRef } from "react";

type InkCanvasProps = {
  reducedMotion: boolean;
  moonIllumination: number;
};

type Particle = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  drift: number;
};

export function InkCanvas({ reducedMotion, moonIllumination }: InkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      return;
    }

    let frameId = 0;
    let lastPaint = 0;
    const particles = Array.from({ length: 72 }, () => makeParticle());

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint(0);
    };

    const paint = (timestamp: number) => {
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      context.globalCompositeOperation = "source-over";

      drawMist(context, rect.width, rect.height, moonIllumination, timestamp);
      drawInkBloom(context, rect.width, rect.height);
      drawParticles(context, particles, rect.width, rect.height, timestamp);
    };

    const animate = (timestamp: number) => {
      if (timestamp - lastPaint > 48) {
        paint(timestamp);
        lastPaint = timestamp;
      }
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);

    if (!reducedMotion) {
      frameId = window.requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frameId);
    };
  }, [reducedMotion, moonIllumination]);

  return <canvas ref={canvasRef} className="ink-canvas" aria-hidden="true" />;
}

function drawMist(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  moonIllumination: number,
  timestamp: number,
) {
  const pulse = 0.5 + Math.sin(timestamp / 2400) * 0.5;
  const indigoAlpha = 0.05 + moonIllumination * 0.08;
  const gradient = context.createRadialGradient(
    width * (0.68 + pulse * 0.03),
    height * 0.22,
    width * 0.05,
    width * 0.68,
    height * 0.25,
    width * 0.58,
  );

  gradient.addColorStop(0, `rgba(25, 50, 94, ${indigoAlpha})`);
  gradient.addColorStop(0.52, "rgba(25, 50, 94, 0.035)");
  gradient.addColorStop(1, "rgba(25, 50, 94, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawInkBloom(context: CanvasRenderingContext2D, width: number, height: number) {
  const blooms = [
    [0.18, 0.18, 0.18, 0.05],
    [0.82, 0.72, 0.24, 0.045],
    [0.48, 0.9, 0.34, 0.035],
  ];

  for (const [x, y, radius, alpha] of blooms) {
    const gradient = context.createRadialGradient(
      width * x,
      height * y,
      0,
      width * x,
      height * y,
      Math.min(width, height) * radius,
    );
    gradient.addColorStop(0, `rgba(13, 14, 15, ${alpha})`);
    gradient.addColorStop(0.68, `rgba(13, 14, 15, ${alpha * 0.32})`);
    gradient.addColorStop(1, "rgba(13, 14, 15, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }
}

function drawParticles(
  context: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number,
  timestamp: number,
) {
  context.save();
  context.globalCompositeOperation = "multiply";

  for (const particle of particles) {
    const y = (particle.y * height + Math.sin(timestamp / 2200 + particle.drift) * 9) % height;
    context.beginPath();
    context.fillStyle = `rgba(20, 20, 20, ${particle.alpha})`;
    context.arc(particle.x * width, y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function makeParticle(): Particle {
  return {
    x: Math.random(),
    y: Math.random(),
    radius: Math.random() * 1.8 + 0.2,
    alpha: Math.random() * 0.07 + 0.015,
    drift: Math.random() * Math.PI * 2,
  };
}
