/* Revamps hero: one subtle signature interaction.
   Warm light that breathes and gently follows the cursor.
   Calm, not flashy. Raw WebGL, no dependencies. */
(function() {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  var gl = canvas.getContext('webgl', { alpha: true, antialias: false });
  if (!gl) { canvas.style.display = 'none'; return; }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    var hero = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = hero.clientWidth * dpr;
    canvas.height = hero.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  var mouse = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 };
  document.addEventListener('mousemove', function(e) {
    var r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = 1 - (e.clientY - r.top) / r.height;
  }, { passive: true });

  var vs = 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }';
  var fs = [
    'precision mediump float;',
    'uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;',
    'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float noise(vec2 p) {',
    '  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);',
    '  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);',
    '}',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / uRes;',
    '  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0);',
    '  float t = uTime * 0.06;',
    '  vec2 m = uMouse * vec2(uRes.x / uRes.y, 1.0);',
    '  float md = distance(p, m);',
    // Gentle warm glow following cursor
    '  float glow = smoothstep(0.9, 0.0, md) * 0.5;',
    // Slow drifting warmth
    '  float n = noise(p * 1.2 + vec2(t, -t * 0.5));',
    '  float n2 = noise(p * 2.0 - vec2(t * 0.4, t * 0.3) + 3.0);',
    // Warm paper tones: soft amber and sage
    '  vec3 warm = vec3(0.98, 0.94, 0.86);',
    '  vec3 amber = vec3(0.85, 0.68, 0.38);',
    '  vec3 sage = vec3(0.62, 0.68, 0.55);',
    '  vec3 col = vec3(0.0);',
    '  col += amber * smoothstep(0.55, 0.9, n) * 0.16;',
    '  col += sage * smoothstep(0.6, 0.95, n2) * 0.10;',
    '  col += amber * glow * 0.22;',
    '  col += warm * glow * smoothstep(0.4, 0.0, md) * 0.12;',
    '  float a = clamp((n * 0.5 + glow * 0.8) * 0.55, 0.0, 0.5);',
    '  gl_FragColor = vec4(col, a);',
    '}'
  ].join('\n');

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) { canvas.style.display = 'none'; return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, v); gl.attachShader(prog, f);
  gl.linkProgram(prog); gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'uRes');
  var uTime = gl.getUniformLocation(prog, 'uTime');
  var uMouse = gl.getUniformLocation(prog, 'uMouse');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var start = performance.now();
  var running = true;
  new IntersectionObserver(function(e) {
    running = e[0].isIntersecting;
    if (running) requestAnimationFrame(frame);
  }).observe(canvas.parentElement);

  if (reduced) {
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, 20); gl.uniform2f(uMouse, 0.5, 0.4);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return;
  }

  function frame(now) {
    if (!running) return;
    mouse.x += (mouse.tx - mouse.x) * 0.03;
    mouse.y += (mouse.ty - mouse.y) * 0.03;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
