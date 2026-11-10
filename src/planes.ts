/*
 * Project screenshots on scroll-reactive WebGL planes.
 * The <img> stays in the DOM for layout, the lightbox and screen readers; a
 * textured plane is drawn over it and bends with scroll velocity. Nothing
 * animates at idle: the loop stops once velocity settles and no CSS transition
 * is running inside the stage.
 */

type Uniform = { value: unknown };
type MeshLike = {
  setParent: (p: unknown) => void;
  position: { set: (x: number, y: number, z: number) => void };
  scale: { set: (x: number, y: number, z: number) => void };
  program: { uniforms: Record<string, Uniform> };
  visible: boolean;
};
type Ogl = {
  Renderer: new (o: Record<string, unknown>) => {
    gl: WebGL2RenderingContext;
    setSize: (w: number, h: number) => void;
    render: (o: Record<string, unknown>) => void;
  };
  Camera: new (gl: unknown, o?: Record<string, unknown>) => {
    orthographic: (o: Record<string, number>) => void;
    position: { z: number };
  };
  Transform: new () => unknown;
  Plane: new (gl: unknown, o?: Record<string, unknown>) => unknown;
  Program: new (gl: unknown, o: Record<string, unknown>) => unknown;
  Mesh: new (gl: unknown, o: Record<string, unknown>) => MeshLike;
  Texture: new (gl: unknown, o?: Record<string, unknown>) => unknown;
};

const VERT = `
attribute vec2 uv;
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uVel;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  p.y += uVel * 0.03 * sin(uv.x * 3.14159265);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const FRAG = `
precision highp float;
uniform sampler2D tMap;
uniform float uVel;
uniform float uAlpha;
uniform float uSeed;
uniform vec2 uUvScale;
uniform vec2 uUvOffset;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 uv = vUv;
  uv.y += uVel * 0.06 * sin(vUv.x * 3.14159265);
  uv.x += uVel * 0.015 * sin(vUv.y * 3.14159265);
  uv = clamp(uv, 0.0, 1.0);
  uv = uUvOffset + uv * uUvScale;
  vec4 c = texture2D(tMap, uv);
  float g = (hash(gl_FragCoord.xy + uSeed) - 0.5) * 0.045 * (0.35 + abs(uVel));
  gl_FragColor = vec4(c.rgb + g, c.a * uAlpha);
}`;

type Slide = { fig: HTMLElement; img: HTMLImageElement; mesh: MeshLike | null; natW: number; natH: number };

export function planes(): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (innerWidth < 720) return;
  const stages = [...document.querySelectorAll<HTMLElement>(".shot-stage")].filter((s) =>
    s.querySelector(".shot-slide img"),
  );
  if (!stages.length) return;
  if (!document.createElement("canvas").getContext("webgl2")) return;

  let ogl: Ogl | null = null;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        void setup(e.target as HTMLElement);
      }
    },
    { rootMargin: "240px 0px" },
  );
  stages.forEach((s) => io.observe(s));

  async function lib(): Promise<Ogl | null> {
    if (ogl) return ogl;
    try {
      ogl = (await import("./vendor/ogl.mjs")) as unknown as Ogl;
      return ogl;
    } catch {
      return null;
    }
  }

  async function setup(stage: HTMLElement) {
    const mod = await lib();
    if (!mod) return;
    const { Renderer, Camera, Transform, Plane, Program, Mesh, Texture } = mod;

    const lastSlide = [...stage.querySelectorAll<HTMLElement>(".shot-slide")].pop();
    if (!lastSlide) return;
    const canvas = document.createElement("canvas");
    canvas.className = "gl";
    canvas.setAttribute("aria-hidden", "true");
    lastSlide.after(canvas);

    let renderer: InstanceType<Ogl["Renderer"]>;
    try {
      renderer = new Renderer({
        canvas,
        dpr: Math.min(devicePixelRatio || 1, 2),
        alpha: true,
        antialias: false,
        depth: false,
        premultipliedAlpha: true,
        webgl: 2,
      });
    } catch {
      canvas.remove();
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const camera = new Camera(gl);
    camera.position.z = 1;
    const scene = new Transform();
    const geometry = new Plane(gl, { widthSegments: 24, heightSegments: 24 });

    const slides: Slide[] = [...stage.querySelectorAll<HTMLElement>(".shot-slide")].map((fig) => ({
      fig,
      img: fig.querySelector("img") as HTMLImageElement,
      mesh: null,
      natW: 0,
      natH: 0,
    }));

    let W = 1;
    let H = 1;
    const size = () => {
      const r = stage.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      renderer.setSize(W, H);
      camera.orthographic({ left: -W / 2, right: W / 2, top: H / 2, bottom: -H / 2, near: 0.1, far: 10 });
    };
    size();

    let vel = 0;
    let target = 0;
    let lastY = scrollY;
    let running = 0;
    let raf = 0;
    let hot = false;
    let seed = 0;

    const draw = () => {
      const sr = stage.getBoundingClientRect();
      for (const s of slides) {
        if (!s.mesh) continue;
        const alpha = parseFloat(getComputedStyle(s.fig).opacity) || 0;
        if (alpha <= 0.001) {
          s.mesh.visible = false;
          continue;
        }
        const r = s.img.getBoundingClientRect();
        s.mesh.visible = true;
        s.mesh.position.set(r.left + r.width / 2 - sr.left - W / 2, H / 2 - (r.top + r.height / 2 - sr.top), 0);
        s.mesh.scale.set(r.width, r.height, 1);
        const ia = s.natW / s.natH;
        const ra = r.width / r.height;
        let sx = 1;
        let sy = 1;
        let ox = 0;
        let oy = 0;
        if (ia > ra) {
          sx = ra / ia;
          ox = (1 - sx) / 2;
        } else {
          sy = ia / ra;
          oy = 1 - sy;
        }
        const u = s.mesh.program.uniforms;
        u.uUvScale!.value = [sx, sy];
        u.uUvOffset!.value = [ox, oy];
        u.uVel!.value = vel;
        u.uAlpha!.value = alpha;
        u.uSeed!.value = seed;
      }
      renderer.render({ scene, camera });
    };

    const frame = () => {
      raf = 0;
      target *= 0.72;
      vel += (target - vel) * 0.18;
      seed = (seed + 1.37) % 1000;
      const moving = Math.abs(vel) > 0.0015 || Math.abs(target) > 0.0015;
      draw();
      if (moving || running > 0 || hot) raf = requestAnimationFrame(frame);
      else {
        vel = 0;
        target = 0;
        draw();
      }
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    new ResizeObserver(() => {
      size();
      wake();
    }).observe(stage);

    for (const s of slides) {
      const im = new Image();
      im.decoding = "async";
      im.src = s.img.currentSrc || s.img.src;
      im
        .decode()
        .then(() => {
          s.natW = im.naturalWidth;
          s.natH = im.naturalHeight;
          const tex = new Texture(gl, { image: im, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, flipY: true });
          const program = new Program(gl, {
            vertex: VERT,
            fragment: FRAG,
            uniforms: {
              tMap: { value: tex },
              uVel: { value: 0 },
              uAlpha: { value: 1 },
              uSeed: { value: 0 },
              uUvScale: { value: [1, 1] },
              uUvOffset: { value: [0, 0] },
            },
            transparent: true,
            depthTest: false,
          });
          const mesh = new Mesh(gl, { geometry, program });
          mesh.setParent(scene);
          s.mesh = mesh;
          s.img.style.opacity = "0";
          wake();
        })
        .catch(() => {
          /* image failed to load: the <img> stays as it is */
        });
    }

    addEventListener(
      "scroll",
      () => {
        const y = scrollY;
        target = Math.max(-1, Math.min(1, (y - lastY) / 28));
        lastY = y;
        wake();
      },
      { passive: true },
    );
    stage.addEventListener("transitionstart", () => {
      running++;
      wake();
    });
    const done = () => {
      running = Math.max(0, running - 1);
      wake();
    };
    stage.addEventListener("transitionend", done);
    stage.addEventListener("transitioncancel", done);
    const frameEl = stage.closest<HTMLElement>(".shotframe") ?? stage;
    frameEl.addEventListener("pointerenter", () => {
      hot = true;
      wake();
    });
    frameEl.addEventListener("pointerleave", () => {
      hot = false;
      wake();
    });

    (stage as HTMLElement & { __gl?: unknown }).__gl = {
      get vel() {
        return vel;
      },
      get raf() {
        return raf;
      },
      slides,
    };
    wake();
  }
}
