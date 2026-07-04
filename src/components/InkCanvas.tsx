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

type InkStroke = {
  x: number;
  y: number;
  length: number;
  bend: number;
  alpha: number;
};

export function InkCanvas({ reducedMotion, moonIllumination }: InkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>(Array.from({ length: 96 }, () => makeParticle()));
  const strokesRef = useRef<InkStroke[]>(Array.from({ length: 16 }, () => makeStroke()));

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
    const particles = particlesRef.current;
    const strokes = strokesRef.current;

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
      drawInkMargins(context, rect.width, rect.height, timestamp);
      drawInkBloom(context, rect.width, rect.height, timestamp);
      drawBrushStrokes(context, strokes, rect.width, rect.height, timestamp);
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
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    if (!reducedMotion) {
      frameId = window.requestAnimationFrame(animate);
    }

    return () => {
      observer.disconnect();
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

function drawInkMargins(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  timestamp: number,
) {
  const breath = 0.88 + Math.sin(timestamp / 5100) * 0.12;
  const leftWash = context.createLinearGradient(0, 0, width * 0.34, 0);
  leftWash.addColorStop(0, "rgba(12, 13, 14, 0.12)");
  leftWash.addColorStop(0.42, "rgba(12, 13, 14, 0.045)");
  leftWash.addColorStop(1, "rgba(12, 13, 14, 0)");
  context.fillStyle = leftWash;
  context.fillRect(0, 0, width * 0.42, height);

  const lowerBloom = context.createRadialGradient(
    width * 0.34,
    height * 1.02,
    0,
    width * 0.34,
    height * 1.02,
    Math.min(width, height) * 0.56 * breath,
  );
  lowerBloom.addColorStop(0, "rgba(13, 14, 15, 0.16)");
  lowerBloom.addColorStop(0.62, "rgba(13, 14, 15, 0.045)");
  lowerBloom.addColorStop(1, "rgba(13, 14, 15, 0)");
  context.fillStyle = lowerBloom;
  context.fillRect(0, 0, width, height);

  const rightMist = context.createRadialGradient(
    width * 0.86,
    height * 0.86,
    0,
    width * 0.86,
    height * 0.86,
    Math.min(width, height) * 0.38,
  );
  rightMist.addColorStop(0, "rgba(31, 61, 115, 0.045)");
  rightMist.addColorStop(1, "rgba(31, 61, 115, 0)");
  context.fillStyle = rightMist;
  context.fillRect(0, 0, width, height);
}

function drawInkBloom(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  timestamp: number,
) {
  const breath = 0.85 + Math.sin(timestamp / 3600) * 0.15;
  const blooms = [
    [0.12, 0.22, 0.28, 0.06],
    [0.78, 0.68, 0.3, 0.05],
    [0.46, 0.88, 0.38, 0.04],
    [0.53, 0.36, 0.18, 0.045],
  ];

  for (const [x, y, radius, alpha] of blooms) {
    const gradient = context.createRadialGradient(
      width * x,
      height * y,
      0,
      width * x,
      height * y,
      Math.min(width, height) * radius * breath,
    );
    gradient.addColorStop(0, `rgba(13, 14, 15, ${alpha})`);
    gradient.addColorStop(0.68, `rgba(13, 14, 15, ${alpha * 0.32})`);
    gradient.addColorStop(1, "rgba(13, 14, 15, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }
}

function drawBrushStrokes(
  context: CanvasRenderingContext2D,
  strokes: InkStroke[],
  width: number,
  height: number,
  timestamp: number,
) {
  context.save();
  context.globalCompositeOperation = "multiply";
  context.lineCap = "round";

  for (const stroke of strokes) {
    const sway = Math.sin(timestamp / 4200 + stroke.bend) * 8;
    const startX = stroke.x * width;
    const startY = stroke.y * height;
    const endX = startX + stroke.length * width;
    const endY = startY + sway;
    const controlX = startX + stroke.length * width * 0.48;
    const controlY = startY + stroke.bend * height * 0.055;

    context.beginPath();
    context.strokeStyle = `rgba(18, 18, 18, ${stroke.alpha})`;
    context.lineWidth = Math.max(1, Math.min(width, height) * 0.0025);
    context.moveTo(startX, startY);
    context.quadraticCurveTo(controlX, controlY, endX, endY);
    context.stroke();
  }

  context.restore();
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

function makeStroke(): InkStroke {
  return {
    x: Math.random() * 0.9,
    y: Math.random() * 0.88 + 0.05,
    length: Math.random() * 0.18 + 0.08,
    bend: Math.random() * 2 - 1,
    alpha: Math.random() * 0.035 + 0.012,
  };
}
