"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { getCollageGridLayout } from "@/lib/mockup-preview";
import { artworkTransformToBox, type ArtworkTransform } from "@/lib/artwork-transform";
import type { Product360Kind, Product360ViewProps } from "@/lib/product-360";
import { cn } from "@/lib/utils";

type DrinkwareKind = Exclude<Product360Kind, "flat">;

interface DrinkwareSpec {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  /** Width of each printed panel, in degrees around the product. */
  arcDeg: number;
  /** Height of the printed panel as a share of the body height. */
  zoneHeight: number;
}

const SPECS: Record<DrinkwareKind, DrinkwareSpec> = {
  tumbler: { radiusTop: 0.95, radiusBottom: 0.82, height: 3.4, arcDeg: 140, zoneHeight: 0.78 },
  glass: { radiusTop: 0.9, radiusBottom: 0.9, height: 3.0, arcDeg: 130, zoneHeight: 0.7 },
  mug: { radiusTop: 0.95, radiusBottom: 0.86, height: 2.1, arcDeg: 150, zoneHeight: 0.8 },
};

const TEXTURE_WIDTH = 2048;

interface PaintInput {
  frontUrls: string[];
  backUrls: string[];
  frontTransform: ArtworkTransform;
  backTransform: ArtworkTransform;
  wrap: boolean;
  showFront: boolean;
  showBack: boolean;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

/** Same placement rules as the 2D estimate: the transform box is a % of the print panel. */
function drawArtwork(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  zone: Rect,
  transform: ArtworkTransform
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(zone.x, zone.y, zone.w, zone.h);
  ctx.clip();

  if (images.length === 1) {
    const box = artworkTransformToBox(transform);
    const bw = (zone.w * box.w) / 100;
    const bh = (zone.h * box.h) / 100;
    drawCover(
      ctx,
      images[0],
      zone.x + (zone.w * box.cx) / 100 - bw / 2,
      zone.y + (zone.h * box.cy) / 100 - bh / 2,
      bw,
      bh
    );
  } else if (images.length > 1) {
    const { cols, rows } = getCollageGridLayout(images.length);
    const cw = zone.w / cols;
    const ch = zone.h / rows;
    images.slice(0, cols * rows).forEach((img, i) => {
      drawCover(ctx, img, zone.x + (i % cols) * cw, zone.y + Math.floor(i / cols) * ch, cw, ch);
    });
  }

  ctx.restore();
}

function makeShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  gradient.addColorStop(0, "rgba(0,0,0,0.55)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

interface ViewerApi {
  repaint: (input: PaintInput) => void;
  goTo: (side: "front" | "back") => void;
}

interface DrinkwareViewerProps extends Product360ViewProps {
  kind: DrinkwareKind;
}

export function DrinkwareViewer({
  kind,
  productName,
  frontArtworkUrls,
  backArtworkUrls,
  frontTransform,
  backTransform,
  wrap = false,
  showFront = true,
  showBack = true,
  disclaimer,
}: DrinkwareViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ViewerApi | null>(null);
  const autoRotateRef = useRef(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [failed, setFailed] = useState(false);

  // Build the scene once per product kind.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const spec = SPECS[kind];
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.style.cursor = "grab";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.85;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 1.4, 9.5);
    camera.lookAt(0, 0.05, 0);

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 5, 4);
    scene.add(key);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Printed texture: u wraps around the product, front panel centred at u=0.25, back at u=0.75.
    const avgRadius = (spec.radiusTop + spec.radiusBottom) / 2;
    const circumference = 2 * Math.PI * avgRadius;
    const texW = TEXTURE_WIDTH;
    const texH = Math.round((texW * spec.height) / circumference);
    const canvas = document.createElement("canvas");
    canvas.width = texW;
    canvas.height = texH;
    const ctx = canvas.getContext("2d")!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const isGlass = kind === "glass";
    const thetaStart = -Math.PI / 2;
    const disposables: Array<{ dispose: () => void }> = [texture, envTexture, pmrem];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    const group = new THREE.Group();
    scene.add(group);

    const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material) => {
      track(geometry);
      track(material);
      return new THREE.Mesh(geometry, material);
    };

    const h = spec.height;
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: isGlass ? 0.15 : 0.28,
      clearcoat: isGlass ? 0 : 0.7,
      clearcoatRoughness: 0.15,
      transparent: isGlass,
      side: THREE.FrontSide,
    });

    if (kind === "tumbler") {
      group.add(
        mesh(new THREE.CylinderGeometry(spec.radiusTop, spec.radiusBottom, h, 128, 1, true, thetaStart), bodyMaterial)
      );
      const bottom = mesh(
        new THREE.CircleGeometry(spec.radiusBottom, 64),
        new THREE.MeshStandardMaterial({ color: 0xdadada, roughness: 0.5 })
      );
      bottom.rotation.x = Math.PI / 2;
      bottom.position.y = -h / 2;
      group.add(bottom);

      const clear = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.22,
        roughness: 0.08,
        clearcoat: 1,
      });
      const lid = mesh(new THREE.CylinderGeometry(spec.radiusTop + 0.04, spec.radiusTop + 0.04, 0.26, 64), clear);
      lid.position.y = h / 2 + 0.13;
      group.add(lid);
      const lidTop = mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 0.06, 48),
        new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.4, transparent: true, opacity: 0.8 })
      );
      lidTop.position.y = h / 2 + 0.29;
      group.add(lidTop);
    } else if (kind === "mug") {
      group.add(
        mesh(new THREE.CylinderGeometry(spec.radiusTop, spec.radiusBottom, h, 128, 1, true, thetaStart), bodyMaterial)
      );
      const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf7f7f5, roughness: 0.25, clearcoat: 0.7 });
      const inner = mesh(
        new THREE.CylinderGeometry(spec.radiusTop - 0.06, spec.radiusBottom - 0.06, h, 64, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xf1efe9, roughness: 0.4, side: THREE.BackSide })
      );
      group.add(inner);
      const floor = mesh(new THREE.CircleGeometry(spec.radiusBottom - 0.06, 64), ceramic);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -h / 2 + 0.08;
      group.add(floor);
      const rim = mesh(new THREE.TorusGeometry(spec.radiusTop - 0.03, 0.035, 12, 96), ceramic);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = h / 2;
      group.add(rim);
      const bottom = mesh(new THREE.CircleGeometry(spec.radiusBottom, 64), ceramic);
      bottom.rotation.x = Math.PI / 2;
      bottom.position.y = -h / 2;
      group.add(bottom);
      const handle = mesh(new THREE.TorusGeometry(0.56, 0.12, 20, 48, Math.PI), ceramic);
      handle.rotation.z = -Math.PI / 2;
      handle.position.set(spec.radiusTop - 0.12, 0.05, 0);
      group.add(handle);
    } else {
      // Glass can with bamboo lid and straw: translucent shell, printed panel just inside it.
      const shell = mesh(
        new THREE.CylinderGeometry(spec.radiusTop + 0.02, spec.radiusBottom + 0.02, h, 96, 1, true),
        new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.16,
          roughness: 0.05,
          clearcoat: 1,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      shell.renderOrder = 2;
      const decal = mesh(
        new THREE.CylinderGeometry(spec.radiusTop, spec.radiusBottom, h, 128, 1, true, thetaStart),
        bodyMaterial
      );
      decal.renderOrder = 1;
      group.add(decal, shell);

      const base = mesh(
        new THREE.CylinderGeometry(spec.radiusBottom + 0.02, spec.radiusBottom + 0.02, 0.16, 64),
        new THREE.MeshPhysicalMaterial({ color: 0xdfe9f5, transparent: true, opacity: 0.16, roughness: 0.05, depthWrite: false })
      );
      base.position.y = -h / 2 + 0.08;
      group.add(base);

      const bamboo = new THREE.MeshStandardMaterial({ color: 0xc89a5b, roughness: 0.6 });
      const lid = mesh(new THREE.CylinderGeometry(spec.radiusTop + 0.05, spec.radiusTop + 0.05, 0.22, 64), bamboo);
      lid.position.y = h / 2 + 0.11;
      group.add(lid);
      const straw = mesh(
        new THREE.CylinderGeometry(0.055, 0.055, h + 0.9, 16),
        new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, roughness: 0.05 })
      );
      straw.position.set(0.22, 0.38, 0);
      straw.rotation.z = -0.07;
      group.add(straw);
    }

    group.position.y = kind === "mug" ? 0 : -0.1;

    // Soft contact shadow so it sits on a surface.
    const shadowTexture = track(makeShadowTexture());
    const shadow = mesh(
      new THREE.PlaneGeometry(4.2, 4.2),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -h / 2 + group.position.y - 0.02;
    scene.add(shadow);

    // --- painting ---------------------------------------------------------------------------
    let paintToken = 0;
    const repaint = async (input: PaintInput) => {
      const token = ++paintToken;
      const [front, back] = await Promise.all([
        Promise.all(input.frontUrls.map(loadImage)),
        Promise.all(input.backUrls.map(loadImage)),
      ]);
      if (token !== paintToken) return;

      ctx.clearRect(0, 0, texW, texH);
      if (!isGlass) {
        ctx.fillStyle = "#f7f7f5";
        ctx.fillRect(0, 0, texW, texH);
      }

      const frontImgs = front.filter((i): i is HTMLImageElement => Boolean(i));
      const backImgs = back.filter((i): i is HTMLImageElement => Boolean(i));
      const zoneH = texH * spec.zoneHeight;
      const zoneY = (texH - zoneH) / 2;
      const zoneW = input.wrap ? texW : (texW * spec.arcDeg) / 360;

      const paintZone = (images: HTMLImageElement[], centerU: number, transform: ArtworkTransform) => {
        if (!images.length) return;
        const x = centerU * texW - zoneW / 2;
        // Draw wrapped copies so a panel crossing the seam still lines up.
        for (const dx of [0, -texW, texW]) {
          if (x + dx + zoneW < 0 || x + dx > texW) continue;
          drawArtwork(ctx, images, { x: x + dx, y: zoneY, w: zoneW, h: zoneH }, transform);
        }
      };

      if (input.wrap) {
        paintZone(frontImgs, 0.25, input.frontTransform);
      } else {
        if (input.showFront) paintZone(frontImgs, 0.25, input.frontTransform);
        if (input.showBack) paintZone(backImgs, 0.75, input.backTransform);
      }
      texture.needsUpdate = true;
    };

    // --- interaction ------------------------------------------------------------------------
    let rotY = 0;
    let velocity = 0;
    let target: number | null = null;
    let dragging = false;
    let lastX = 0;
    let idleSince = performance.now();

    const el = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      target = null;
      lastX = e.clientX;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      velocity = dx * 0.011;
      rotY += velocity;
    };
    const onUp = () => {
      dragging = false;
      idleSince = performance.now();
      el.style.cursor = "grab";
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    apiRef.current = {
      repaint,
      goTo: (side) => {
        const turn = Math.PI * 2;
        target =
          side === "front"
            ? Math.round(rotY / turn) * turn
            : Math.round((rotY - Math.PI) / turn) * turn + Math.PI;
        velocity = 0;
      },
    };

    // --- sizing + loop ----------------------------------------------------------------------
    const resize = () => {
      const { clientWidth: w, clientHeight: hgt } = host;
      if (!w || !hgt) return;
      renderer.setSize(w, hgt, false);
      camera.aspect = w / hgt;
      // Keep the whole product in frame on narrow screens.
      camera.position.z = w / hgt < 0.9 ? 11.5 : 9.5;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!dragging) {
        if (target !== null) {
          rotY += (target - rotY) * 0.12;
          if (Math.abs(target - rotY) < 0.002) {
            rotY = target;
            target = null;
          }
        } else {
          rotY += velocity;
          velocity *= 0.95;
          if (autoRotateRef.current && Math.abs(velocity) < 0.0008 && performance.now() - idleSince > 1200) {
            rotY += 0.007;
          }
        }
      }
      group.rotation.y = rotY;
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(frame);
      paintToken++;
      observer.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      apiRef.current = null;
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      el.remove();
    };
  }, [kind]);

  // Repaint when the artwork or its placement changes.
  const paintKey = JSON.stringify([
    frontArtworkUrls,
    backArtworkUrls,
    frontTransform,
    backTransform,
    wrap,
    showFront,
    showBack,
  ]);
  useEffect(() => {
    apiRef.current?.repaint({
      frontUrls: frontArtworkUrls,
      backUrls: backArtworkUrls,
      frontTransform,
      backTransform,
      wrap,
      showFront,
      showBack,
    });
    // paintKey covers every input above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paintKey, kind]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">360° view</p>
      <p className="mt-2 text-sm text-chrome-light">
        Drag to spin your {productName.toLowerCase()} all the way around and check your design from every side.
      </p>

      {failed ? (
        <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-chrome-light">
          3D view is not supported on this device. Use Review estimate to check your design instead.
        </p>
      ) : (
        <div
          ref={hostRef}
          className="relative mx-auto mt-4 aspect-square w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#1a1d29] to-[#0a0c14] shadow-[0_0_40px_rgba(6,94,229,0.15)]"
          aria-label={`${productName} 360 degree preview`}
        />
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => apiRef.current?.goTo("front")}
          className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-chrome-light transition-colors hover:text-pure-paper"
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => apiRef.current?.goTo("back")}
          className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-chrome-light transition-colors hover:text-pure-paper"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            autoRotate ? "bg-cyan text-pure-paper" : "border border-white/15 text-chrome-light hover:text-pure-paper"
          )}
          aria-pressed={autoRotate}
        >
          {autoRotate ? "Auto-rotate on" : "Auto-rotate off"}
        </button>
      </div>

      {disclaimer && <p className="mt-3 text-xs leading-relaxed text-chrome-mid">{disclaimer}</p>}
    </div>
  );
}
