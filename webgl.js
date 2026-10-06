/* Revamps WebGL: atmospheric fluid background
   Three.js fullscreen shader with mouse displacement, scroll velocity, inertia.
   Calm, cinematic, physical. */

(function() {
  'use strict';

  var canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    if (canvas) canvas.style.display = 'none';
    return;
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(pointer: coarse)').matches;

  // Renderer
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch (e) {
    canvas.style.display = 'none';
    return;
  }

  var DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(DPR);

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // State with inertia
  var state = {
    mouse: new THREE.Vector2(0.5, 0.5),
    mouseTarget: new THREE.Vector2(0.5, 0.5),
    mouseVel: new THREE.Vector2(0, 0),
    scrollVel: 0,
    scrollTarget: 0,
    time: 0,
    sectionMix: 0,
    sectionTarget: 0
  };

  // Mouse tracking with velocity
  var lastMX = 0.5, lastMY = 0.5, lastT = performance.now();
  function onMouseMove(e) {
    var now = performance.now();
    var dt = Math.max((now - lastT) / 1000, 0.001);
    var nx = e.clientX / window.innerWidth;
    var ny = 1 - (e.clientY / window.innerHeight);
    // Velocity (clamped to avoid spikes)
    var vx = (nx - lastMX) / dt;
    var vy = (ny - lastMY) / dt;
    var speed = Math.sqrt(vx * vx + vy * vy);
    var clamped = Math.min(speed, 8);
    if (speed > 0.001) {
      state.mouseVel.set(vx / speed * clamped, vy / speed * clamped);
    }
    state.mouseTarget.set(nx, ny);
    lastMX = nx; lastMY = ny; lastT = now;
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Touch: treat as mouse
  window.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) {
      var t = e.touches[0];
      state.mouseTarget.set(t.clientX / window.innerWidth, 1 - (t.clientY / window.innerHeight));
    }
  }, { passive: true });

  // Scroll velocity
  var lastScrollY = window.scrollY, lastScrollT = performance.now();
  function onScroll() {
    var now = performance.now();
    var dt = Math.max((now - lastScrollT) / 1000, 0.001);
    var dy = window.scrollY - lastScrollY;
    state.scrollTarget = THREE.MathUtils.clamp(dy / dt / 2000, -1, 1);
    lastScrollY = window.scrollY;
    lastScrollT = now;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Section-based color mood (which section is in view)
  var sections = document.querySelectorAll('.section, .hero, .final-cta');
  function updateSection() {
    var vh = window.innerHeight;
    var best = 0, bestDist = Infinity;
    sections.forEach(function(s, i) {
      var r = s.getBoundingClientRect();
      var center = r.top + r.height / 2;
      var dist = Math.abs(center - vh / 2);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    // Map section index to 0..1 for color variation
    state.sectionTarget = sections.length > 1 ? best / (sections.length - 1) : 0;
  }
  window.addEventListener('scroll', updateSection, { passive: true });
  updateSection();

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w * DPR, h * DPR);
  }

  // Shader: layered fluid noise, mouse displacement, scroll response
  // Palette: warm dark base, amber light, subtle warmth. No purple.
  var uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uMouseVel: { value: new THREE.Vector2(0, 0) },
    uScrollVel: { value: 0 },
    uSection: { value: 0 },
    uReduced: { value: reducedMotion ? 1 : 0 }
  };

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: [
      'varying vec2 vUv;',
      'void main() {',
      '  vUv = uv;',
      '  gl_Position = vec4(position.xy, 0.0, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'precision highp float;',
      'varying vec2 vUv;',
      'uniform float uTime;',
      'uniform vec2 uResolution;',
      'uniform vec2 uMouse;',
      'uniform vec2 uMouseVel;',
      'uniform float uScrollVel;',
      'uniform float uSection;',
      'uniform float uReduced;',
      '',
      '// Warm dark palette',
      'vec3 cVoid   = vec3(0.031, 0.031, 0.047);',
      'vec3 cAbyss  = vec3(0.055, 0.055, 0.078);',
      'vec3 cAmber  = vec3(0.851, 0.643, 0.357);',
      'vec3 cWarm   = vec3(0.45, 0.32, 0.22);',
      'vec3 cCool   = vec3(0.18, 0.22, 0.28);',
      '',
      'float hash(vec2 p) {',
      '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);',
      '}',
      'float noise(vec2 p) {',
      '  vec2 i = floor(p); vec2 f = fract(p);',
      '  vec2 u = f * f * (3.0 - 2.0 * f);',
      '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),',
      '             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);',
      '}',
      'float fbm(vec2 p) {',
      '  float v = 0.0; float a = 0.5;',
      '  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);',
      '  for (int i = 0; i < 5; i++) {',
      '    v += a * noise(p); p = rot * p * 2.0; a *= 0.5;',
      '  }',
      '  return v;',
      '}',
      '',
      'void main() {',
      '  vec2 uv = vUv;',
      '  vec2 asp = vec2(uResolution.x / uResolution.y, 1.0);',
      '  vec2 p = uv * asp;',
      '  float t = uTime * (uReduced > 0.5 ? 0.0 : 1.0);',
      '',
      '  // Mouse displacement with falloff',
      '  vec2 m = uMouse * asp;',
      '  float md = distance(p, m);',
      '  float mInfluence = smoothstep(1.2, 0.0, md);',
      '',
      '  // Velocity adds energy',
      '  float vel = length(uMouseVel);',
      '  float energy = smoothstep(0.0, 3.0, vel) * 0.35 + abs(uScrollVel) * 0.4;',
      '',
      '  // Displace the sampling position (liquid feel)',
      '  vec2 disp = (m - p) * mInfluence * 0.25;',
      '  disp += uMouseVel * mInfluence * 0.08;',
      '  vec2 q = p + disp;',
      '',
      '  // Layered fluid noise',
      '  float n1 = fbm(q * 1.4 + vec2(t * 0.05, -t * 0.03));',
      '  float n2 = fbm(q * 2.2 - vec2(t * 0.03, t * 0.04) + 5.2);',
      '  float n3 = fbm(q * 3.5 + vec2(-t * 0.02, t * 0.06) + n1 * 1.5);',
      '',
      '  // Base gradient: deep and atmospheric',
      '  vec3 col = mix(cVoid, cAbyss, n1);',
      '',
      '  // Warm undertones shifting with section',
      '  float warmth = smoothstep(0.35, 0.8, n2);',
      '  vec3 warmCol = mix(cWarm * 0.25, cAmber * 0.18, uSection);',
      '  col = mix(col, warmCol + cAbyss, warmth * 0.45);',
      '',
      '  // Cool depth in shadows',
      '  float coolness = smoothstep(0.6, 0.2, n1) * 0.3;',
      '  col = mix(col, cCool * 0.5, coolness);',
      '',
      '  // Amber light: soft, following mouse and flow',
      '  float light = smoothstep(0.55, 0.95, n3);',
      '  light *= 0.5 + mInfluence * 0.6 + energy * 0.4;',
      '  col += cAmber * light * 0.22;',
      '',
      '  // Subtle grain for filmic quality',
      '  float grain = hash(uv * uResolution.xy * 0.5 + fract(t) * 100.0) - 0.5;',
      '  col += grain * 0.028;',
      '',
      '  // Vignette: focus toward center',
      '  float vig = smoothstep(1.4, 0.4, distance(uv, vec2(0.5, 0.5)));',
      '  col *= mix(0.72, 1.0, vig);',
      '',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n'),
    depthTest: false,
    depthWrite: false
  });

  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  resize();
  window.addEventListener('resize', resize);

  // Animation loop with damping (inertia)
  var clock = new THREE.Clock();
  var visible = true;

  var visObserver = new IntersectionObserver(function(entries) {
    visible = entries[0].isIntersecting;
  });
  visObserver.observe(document.body);

  // Pause when tab hidden
  document.addEventListener('visibilitychange', function() {
    visible = !document.hidden;
    if (visible) requestAnimationFrame(animate);
  });

  function animate() {
    if (!visible) return;
    requestAnimationFrame(animate);

    var dt = Math.min(clock.getDelta(), 0.05);
    state.time += dt;

    // Damped interpolation (spring-like, physical)
    var damp = 1 - Math.exp(-dt * 4.5);
    state.mouse.lerp(state.mouseTarget, damp);
    state.mouseVel.multiplyScalar(1 - Math.exp(-dt * 3.0));
    state.scrollVel += (state.scrollTarget - state.scrollVel) * (1 - Math.exp(-dt * 5.0));
    state.scrollTarget *= (1 - Math.exp(-dt * 2.0));
    state.sectionMix += (state.sectionTarget - state.sectionMix) * (1 - Math.exp(-dt * 1.5));

    uniforms.uTime.value = state.time;
    uniforms.uMouse.value.copy(state.mouse);
    uniforms.uMouseVel.value.copy(state.mouseVel);
    uniforms.uScrollVel.value = state.scrollVel;
    uniforms.uSection.value = state.sectionMix;

    renderer.render(scene, camera);
  }

  // Reduced motion: render single static frame
  if (reducedMotion) {
    uniforms.uTime.value = 10.0;
    renderer.render(scene, camera);
  } else {
    animate();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', function() {
    mesh.geometry.dispose();
    material.dispose();
    renderer.dispose();
  });

})();
