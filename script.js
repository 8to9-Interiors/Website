/**
 * 8 to 9 Interiors — main site script
 * Handles intro animation, navigation, testimonials, map, contact form,
 * and interactive 3D room previews (Three.js).
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ============================================================
   MOBILE NAV TOGGLE
   Adds/removes .is-open on button + menu; CSS handles the rest
   ============================================================ */
   function runVideoIntro() {
  const videoIntro = document.getElementById("video-intro");
  const video = document.getElementById("intro-video");
  if (!videoIntro || !video) return;

  video.addEventListener("ended", function () {
    videoIntro.classList.add("is-done");
    document.body.classList.remove("is-loading");
    setTimeout(function () {
      videoIntro.remove();
    }, 900);
  });
}
function initNavigation() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  if (!navToggle || !navMenu) return;

  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
  }

  navToggle.addEventListener("click", function () {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) closeMenu();
  });
}

/* ============================================================
   TESTIMONIAL SLIDER
   Cycles through blockquotes; dots are generated in JS
   ============================================================ */
function initTestimonials() {
  const slides = document.querySelectorAll(".testimonial-slide");
  const dotsContainer = document.querySelector(".testimonial-dots");
  if (!slides.length || !dotsContainer) return;

  let current = 0;
  let timer;

  slides.forEach(function (_, index) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "testimonial-dot" + (index === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", "Show testimonial " + (index + 1));
    dot.addEventListener("click", function () {
      goTo(index);
      restartTimer();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll(".testimonial-dot");

  function goTo(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = index;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  function restartTimer() {
    clearInterval(timer);
    timer = setInterval(next, 6000);
  }

  restartTimer();
}

/* ============================================================
   CONTACT FORM (demo validation — no backend yet)
   ============================================================ */
function initContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      alert("Please fill in the required fields.");
      return;
    }

    alert("Thank you, " + name + "! Your enquiry has been received.");
    form.reset();
  });
}

/* ============================================================
   LEAFLET MAP — studio location pin
   ============================================================ */
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl || typeof L === "undefined") return;

  const map = L.map("map", { scrollWheelZoom: false }).setView([28.6659, 77.4066], 17);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  L.marker([28.6659, 77.4066]).addTo(map)
    .bindPopup("Plaza Hardware Shop, Gaur Siddhartham, Siddharth Vihar, Ghaziabad - 201009");
}

/* ============================================================
   THREE.JS 3D ROOM VIEWER
   Builds interactive interior scenes with geometry + lighting.
   Each room type assembles walls, furniture, and accents.
   ============================================================ */
const GOLD = 0xc5a059;
const DARK = 0x121212;
const WALL = 0x1b1b1b;
const FLOOR = 0x2a2318;

let viewerRenderer;
let viewerScene;
let viewerCamera;
let viewerControls;
let viewerFrameId;

function makeMaterial(color, opts) {
  return new THREE.MeshStandardMaterial(Object.assign({
    color: color,
    roughness: 0.65,
    metalness: 0.08
  }, opts || {}));
}

function addMesh(group, geometry, material, x, y, z, rx, ry, rz) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  if (rx) mesh.rotation.x = rx;
  if (ry) mesh.rotation.y = ry;
  if (rz) mesh.rotation.z = rz;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function buildRoomShell(group) {
  const floorGeo = new THREE.PlaneGeometry(8, 8);
  addMesh(group, floorGeo, makeMaterial(FLOOR), 0, 0, 0, -Math.PI / 2);

  const wallMat = makeMaterial(WALL);
  addMesh(group, new THREE.PlaneGeometry(8, 4), wallMat, 0, 2, -4);
  addMesh(group, new THREE.PlaneGeometry(8, 4), wallMat, -4, 2, 0, 0, Math.PI / 2);
  addMesh(group, new THREE.PlaneGeometry(8, 4), wallMat, 4, 2, 0, 0, -Math.PI / 2);
}

function buildLivingRoom(group) {
  buildRoomShell(group);
  const sofaMat = makeMaterial(0x3a2f28);
  addMesh(group, new THREE.BoxGeometry(3.2, 0.7, 1.2), sofaMat, 0, 0.35, -2.4);
  addMesh(group, new THREE.BoxGeometry(3.2, 0.9, 0.25), sofaMat, 0, 0.75, -3.05);
  addMesh(group, new THREE.BoxGeometry(1.6, 0.45, 0.9), makeMaterial(GOLD, { metalness: 0.4 }), 0, 0.25, -0.8);
  addMesh(group, new THREE.BoxGeometry(2.4, 1.2, 0.12), makeMaterial(0x0a0a0a), 0, 1.4, -3.92);
  addMesh(group, new THREE.BoxGeometry(0.15, 2.2, 0.15), makeMaterial(GOLD, { metalness: 0.6 }), -1.2, 1.1, -1.5);
}

function buildBedroom(group) {
  buildRoomShell(group);
  addMesh(group, new THREE.BoxGeometry(2.4, 0.5, 2), makeMaterial(0x2d2620), 0, 0.25, -2);
  addMesh(group, new THREE.BoxGeometry(2.4, 0.25, 2), makeMaterial(0xf0ece4), 0, 0.62, -2);
  addMesh(group, new THREE.BoxGeometry(2.6, 1.1, 0.15), makeMaterial(0x222222), 0, 0.85, -3.05);
  addMesh(group, new THREE.BoxGeometry(0.5, 0.5, 0.5), makeMaterial(GOLD, { metalness: 0.5 }), 1.4, 0.25, -0.8);
  addMesh(group, new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), makeMaterial(GOLD, { metalness: 0.7 }), 1.4, 0.85, -0.8);
}

function buildKitchen(group) {
  buildRoomShell(group);
  addMesh(group, new THREE.BoxGeometry(6, 0.9, 0.6), makeMaterial(0x1f1f1f), 0, 0.45, -3.65);
  addMesh(group, new THREE.BoxGeometry(6, 0.05, 0.65), makeMaterial(0x3a3530), 0, 0.92, -3.65);
  addMesh(group, new THREE.BoxGeometry(1.2, 0.9, 0.6), makeMaterial(GOLD, { metalness: 0.35 }), -2.2, 0.45, -3.65);
  addMesh(group, new THREE.BoxGeometry(1.4, 0.15, 0.8), makeMaterial(0x444444), 0, 0.55, -1.2);
  addMesh(group, new THREE.BoxGeometry(0.5, 1.6, 0.5), makeMaterial(0x2a2a2a), 2.5, 0.8, -3.2);
}

function buildBathroom(group) {
  buildRoomShell(group);
  addMesh(group, new THREE.BoxGeometry(1.6, 0.5, 0.7), makeMaterial(0xeeeeee), -1.5, 0.25, -2.5);
  addMesh(group, new THREE.BoxGeometry(2.2, 0.08, 1.2), makeMaterial(0x555555), 0.5, 0.45, -1.2);
  addMesh(group, new THREE.BoxGeometry(0.8, 1.6, 0.08), makeMaterial(0x999999), 3.85, 1.2, -1.5);
  addMesh(group, new THREE.BoxGeometry(0.6, 0.9, 0.6), makeMaterial(0x333333), 2.8, 0.45, -2.8);
  addMesh(group, new THREE.BoxGeometry(6, 0.04, 0.15), makeMaterial(GOLD, { emissive: GOLD, emissiveIntensity: 0.35 }), 0, 3.2, -3.95);
}

const roomBuilders = {
  living: buildLivingRoom,
  bedroom: buildBedroom,
  kitchen: buildKitchen,
  bathroom: buildBathroom
};

const roomTitles = {
  living: "Living Hall — 3D Preview",
  bedroom: "Bedroom — 3D Preview",
  kitchen: "Kitchen — 3D Preview",
  bathroom: "Bathroom — 3D Preview"
};

function disposeViewer() {
  if (viewerFrameId) cancelAnimationFrame(viewerFrameId);
  if (viewerRenderer) {
    viewerRenderer.dispose();
    viewerRenderer = null;
  }
  viewerScene = null;
  viewerCamera = null;
  viewerControls = null;
}

function openRoomViewer(roomKey) {
  const modal = document.getElementById("viewer-modal");
  const canvas = document.getElementById("viewer-canvas");
  const title = document.getElementById("viewer-title");

  if (!modal || !canvas) return;

  disposeViewer();

  title.textContent = roomTitles[roomKey] || "3D Room Preview";
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");

  viewerScene = new THREE.Scene();
  viewerScene.background = new THREE.Color(0x111111);

  viewerCamera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  viewerCamera.position.set(4.5, 3.2, 5.5);

  viewerRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  viewerRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  viewerRenderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  viewerRenderer.shadowMap.enabled = true;
  viewerRenderer.outputColorSpace = THREE.SRGBColorSpace;
  viewerRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  viewerRenderer.toneMappingExposure = 1.2;

  viewerControls = new OrbitControls(viewerCamera, canvas);
  viewerControls.enableDamping = true;
  viewerControls.target.set(0, 1, -1.5);
  viewerControls.maxPolarAngle = Math.PI * 0.49;
  viewerControls.minDistance = 2;
  viewerControls.maxDistance = 15;

  const ambient = new THREE.AmbientLight(0xffffff, 1.5);
  viewerScene.add(ambient);
  const keyLight = new THREE.DirectionalLight(0xffe8c8, 2);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  viewerScene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
  fillLight.position.set(-5, 3, -5);
  viewerScene.add(fillLight);

  const glbModels = {
    living:  'modern_apartment_interior.glb',
    bedroom: 'bedroom_interior.glb',
    bathroom: 'bathroom_interior.glb',
    kitchen: null
  };

  const modelFile = glbModels[roomKey];

  if (modelFile) {
    const loader = new GLTFLoader();
    title.textContent = "Loading...";
    loader.load(
      modelFile,
      function (gltf) {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        // Don't scale — use model as is
model.position.sub(center);
viewerScene.add(model);
title.textContent = roomTitles[roomKey];

// Move camera inside the model
const box2 = new THREE.Box3().setFromObject(model);
const center2 = box2.getCenter(new THREE.Vector3());
const size2 = box2.getSize(new THREE.Vector3());

viewerCamera.position.set(
  center2.x,
  center2.y + size2.y * 0.1,
  center2.z + size2.z * 0.1
);
viewerControls.target.set(center2.x, center2.y, center2.z - size2.z * 0.3);
viewerControls.minDistance = 0.1;
viewerControls.maxDistance = size2.z * 2;
viewerControls.update();
      },
      function (xhr) {
        title.textContent = "Loading... " + Math.round((xhr.loaded / xhr.total) * 100) + "%";
      },
      function (error) {
        console.error("GLB load error:", error);
        title.textContent = "Failed to load model";
      }
    );
  } else {
    const roomGroup = new THREE.Group();
    buildKitchen(roomGroup);
    viewerScene.add(roomGroup);
    title.textContent = roomTitles[roomKey];
  }

  function animate() {
    viewerFrameId = requestAnimationFrame(animate);
    viewerControls.update();
    viewerRenderer.render(viewerScene, viewerCamera);
  }
  animate();
}

function closeRoomViewer() {
  const modal = document.getElementById("viewer-modal");
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  disposeViewer();
}

function initCatalogueViewer() {
  document.querySelectorAll(".catalogue-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openRoomViewer(btn.dataset.room);
    });
  });

  document.querySelectorAll("[data-close-viewer]").forEach(function (el) {
    el.addEventListener("click", closeRoomViewer);
  });

  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeRoomViewer();
  });

  window.addEventListener("resize", function () {
    const canvas = document.getElementById("viewer-canvas");
    if (!viewerRenderer || !viewerCamera || !canvas || document.getElementById("viewer-modal").hidden) return;
    viewerCamera.aspect = canvas.clientWidth / canvas.clientHeight;
    viewerCamera.updateProjectionMatrix();
    viewerRenderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  });
}
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdwaHhIxn0sMuZKqZ3cZ8a9YqixSakSP3GZq_rJreT8h5xFaQ/formResponse';

// 👇 Replace these with actual enty IDs from Inspect
const ENTRY_NAME    = 'entry.584877107';
const ENTRY_EMAIL   = 'entry.653930433';
const ENTRY_PHONE   = 'entry.1659474746';
const ENTRY_MESSAGE = 'entry.1795675503X';

contactForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = new FormData();
  formData.append(ENTRY_NAME,    document.getElementById('name').value);
  formData.append(ENTRY_EMAIL,   document.getElementById('email').value);
  formData.append(ENTRY_PHONE,   document.getElementById('phone').value);
  formData.append(ENTRY_MESSAGE, document.getElementById('message').value);

  fetch(GOOGLE_FORM_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  }).then(() => {
    formStatus.textContent = '✓ Message sent successfully!';
    contactForm.reset();
  }).catch(() => {
    formStatus.textContent = '✗ Something went wrong. Please try again.';
  });
});
/* ============================================================
   BOOT — run everything when DOM is ready
   ============================================================ */
runVideoIntro();
initNavigation();
initTestimonials();
initContactForm();
initMap();
initCatalogueViewer();
