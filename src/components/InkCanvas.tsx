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

type InkCloud = {
  x: number;
  y: number;
  radius: number;
  stretch: number;
  alpha: number;
};

type WashThread = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  bend: number;
  alpha: number;
};

const COMPOSITION_CLOUDS: InkCloud[] = [
  { x: 0.12, y: 0.31, radius: 0.22, stretch: 1.7, alpha: 0.07 },
  { x: 0.31, y: 0.34, radius: 0.28, stretch: 2.3, alpha: 0.052 },
  { x: 0.55, y: 0.28, radius: 0.25, stretch: 2.1, alpha: 0.044 },
  { x: 0.77, y: 0.43, radius: 0.2, stretch: 1.8, alpha: 0.048 },
  { x: 0.86, y: 0.81, radius: 0.2, stretch: 1.9, alpha: 0.058 },
];

const WASH_THREADS: WashThread[] = [
  { startX: 0.06, startY: 0.35, endX: 0.38, endY: 0.31, bend: -0.12, alpha: 0.075 },
  { startX: 0.24, startY: 0.42, endX: 0.68, endY: 0.31, bend: 0.1, alpha: 0.052 },
  { startX: 0.47, startY: 0.27, endX: 0.88, endY: 0.4, bend: -0.09, alpha: 0.045 },
  { startX: 0.04, startY: 0.76, endX: 0.42, endY: 0.72, bend: 0.06, alpha: 0.05 },
  { startX: 0.53, startY: 0.82, endX: 0.97, endY: 0.75, bend: 0.08, alpha: 0.058 },
];

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
      drawCompositionClouds(context, rect.width, rect.height, timestamp);
      drawInkBloom(context, rect.width, rect.height, timestamp);
      drawSeasonGround(context, rect.width, rect.height, timestamp);
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

function drawCompositionClouds(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  timestamp: number,
) {
  const breath = 0.94 + Math.sin(timestamp / 6100) * 0.06;
  const drift = Math.sin(timestamp / 7800) * width * 0.008;
  const baseSize = Math.min(width, height);

  context.save();
  context.globalCompositeOperation = "multiply";

  for (const cloud of COMPOSITION_CLOUDS) {
    const centerX = width * cloud.x + drift * (cloud.x > 0.5 ? -1 : 1);
    const centerY = height * cloud.y + Math.sin(timestamp / 5400 + cloud.x * 8) * height * 0.006;
    const radius = baseSize * cloud.radius * breath;
    const gradient = context.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius * cloud.stretch,
    );

    gradient.addColorStop(0, `rgba(12, 13, 14, ${cloud.alpha})`);
    gradient.addColorStop(0.45, `rgba(12, 13, 14, ${cloud.alpha * 0.44})`);
    gradient.addColorStop(0.74, `rgba(12, 13, 14, ${cloud.alpha * 0.15})`);
    gradient.addColorStop(1, "rgba(12, 13, 14, 0)");
    context.fillStyle = gradient;
    context.fillRect(centerX - radius * cloud.stretch, centerY - radius, radius * cloud.stretch * 2, radius * 2);
  }

  context.lineCap = "round";
  context.lineJoin = "round";

  for (const thread of WASH_THREADS) {
    const startX = width * thread.startX;
    const startY = height * thread.startY;
    const endX = width * thread.endX;
    const endY = height * thread.endY;
    const controlX = (startX + endX) / 2;
    const controlY = (startY + endY) / 2 + height * thread.bend + Math.sin(timestamp / 6600) * 4;

    context.beginPath();
    context.strokeStyle = `rgba(16, 17, 18, ${thread.alpha})`;
    context.lineWidth = Math.max(1.1, baseSize * 0.0038);
    context.moveTo(startX, startY);
    context.quadraticCurveTo(controlX, controlY, endX, endY);
    context.stroke();

    context.beginPath();
    context.strokeStyle = `rgba(16, 17, 18, ${thread.alpha * 0.38})`;
    context.lineWidth = Math.max(2.6, baseSize * 0.0072);
    context.moveTo(startX + width * 0.012, startY + height * 0.012);
    context.quadraticCurveTo(controlX, controlY + height * 0.026, endX - width * 0.012, endY + height * 0.01);
    context.stroke();
  }

  context.restore();
}

function drawSeasonGround(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  timestamp: number,
) {
  const sway = Math.sin(timestamp / 3900) * 4;

  context.save();
  context.globalCompositeOperation = "multiply";
  context.lineCap = "round";
  context.lineJoin = "round";

  const ground = context.createLinearGradient(0, height * 0.76, 0, height);
  ground.addColorStop(0, "rgba(13, 14, 15, 0)");
  ground.addColorStop(0.72, "rgba(13, 14, 15, 0.06)");
  ground.addColorStop(1, "rgba(13, 14, 15, 0.12)");
  context.fillStyle = ground;
  context.fillRect(0, height * 0.72, width, height * 0.28);

  context.strokeStyle = "rgba(16, 17, 18, 0.08)";
  context.lineWidth = Math.max(1.2, Math.min(width, height) * 0.003);

  const tufts = [
    [0.12, 0.94, -0.06, -0.2],
    [0.16, 0.96, 0.03, -0.18],
    [0.79, 0.93, -0.04, -0.16],
    [0.84, 0.95, 0.05, -0.22],
    [0.9, 0.94, -0.03, -0.18],
  ];

  for (const [x, y, dx, dy] of tufts) {
    const startX = width * x;
    const startY = height * y;
    context.beginPath();
    context.moveTo(startX, startY);
    context.quadraticCurveTo(
      startX + width * dx * 0.52 + sway,
      startY + height * dy * 0.45,
      startX + width * dx,
      startY + height * dy,
    );
    context.stroke();
  }

  context.restore();
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
