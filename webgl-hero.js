// WebGL interactive hero for revamps.studio
// Click = particle explosion + shockwave. Mouse = flow trails.
(function() {
  var canvas = document.getElementById('webgl-hero');
  if (!canvas) return;
  
  var gl = canvas.getContext('webgl', { alpha: true, antialias: false });
  if (!gl) { canvas.style.display = 'none'; return; }

  function resize() {
    var hero = canvas.parentElement;
    var w = hero.clientWidth, h = hero.clientHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  var clicks = []; // {x, y, start}
  
  function updateMouse(cx, cy) {
    var r = canvas.getBoundingClientRect();
    mouse.tx = Math.max(0, Math.min(1, (cx - r.left) / r.width));
    mouse.ty = Math.max(0, Math.min(1, 1 - (cy - r.top) / r.height));
  }
  
  document.addEventListener('mousemove', function(e) { updateMouse(e.clientX, e.clientY); });
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  
  // CLICK = explosion
  canvas.parentElement.addEventListener('click', function(e) {
    var r = canvas.getBoundingClientRect();
    var x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    var y = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height));
    clicks.push({ x: x, y: y, start: performance.now() / 1000 });
    if (clicks.length > 8) clicks.shift();
    updateMouse(e.clientX, e.clientY);
  });
  canvas.parentElement.addEventListener('touchstart', function(e) {
    if (e.touches.length > 0) {
      var t = e.touches[0];
      var r = canvas.getBoundingClientRect();
      var x = Math.max(0, Math.min(1, (t.clientX - r.left) / r.width));
      var y = Math.max(0, Math.min(1, 1 - (t.clientY - r.top) / r.height));
      clicks.push({ x: x, y: y, start: performance.now() / 1000 });
      if (clicks.length > 8) clicks.shift();
    }
  }, { passive: true });

  var vsSource = [
    'attribute vec2 aPos;',
    'void main() { gl_Position = vec4(aPos, 0.0, 1.0); }'
  ].join('\n');

  var fsSource = [
    'precision mediump float;',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'uniform vec2 uMouse;',
    'uniform vec4 uClicks[8];', // xy = pos, z = start time, w = active
    'uniform int uClickCount;',
    '',
    '// New palette: deep space blue, electric cyan, hot coral, warm gold',
    'vec3 deepBlue = vec3(0.039, 0.055, 0.102);',
    'vec3 midBlue  = vec3(0.078, 0.180, 0.314);',
    'vec3 cyan     = vec3(0.000, 0.941, 1.000);',
    'vec3 coral    = vec3(1.000, 0.420, 0.420);',
    'vec3 gold     = vec3(1.000, 0.851, 0.239);',
    '',
    'float hash(vec2 p) {',
    '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);',
    '}',
    'float noise(vec2 p) {',
    '  vec2 i = floor(p), f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),',
    '             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);',
    '}',
    'float fbm(vec2 p) {',
    '  float v = 0.0, a = 0.5;',
    '  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }',
    '  return v;',
    '}',
    '',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / uRes;',
    '  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0);',
    '  float t = uTime * 0.1;',
    '',
    '  vec2 m = uMouse * vec2(uRes.x / uRes.y, 1.0);',
    '  float md = distance(p, m);',
    '',
    '  // Mouse trail: cyan glow following cursor',
    '  float trail = smoothstep(0.35, 0.0, md) * 0.6;',
    '',
    '  // Flowing background',
    '  float n1 = fbm(p * 1.8 + vec2(t, -t * 0.6));',
    '  float n2 = fbm(p * 2.5 - vec2(t * 0.5, t * 0.3) + 4.7);',
    '  float n3 = fbm(p * 3.2 + vec2(-t * 0.4, t * 0.8) + 9.1);',
    '',
    '  vec3 col = mix(deepBlue * 0.6, deepBlue * 1.3, n1);',
    '  float wisp = smoothstep(0.4, 0.75, n2) * 0.5;',
    '  col = mix(col, midBlue, wisp);',
    '',
    '  // Cyan energy veins',
    '  float vein = smoothstep(0.68, 0.95, n3) * smoothstep(0.3, 0.7, n1);',
    '  col = mix(col, cyan * 0.7, vein * 0.35);',
    '',
    '  // Gold accents (sparse)',
    '  float goldm = smoothstep(0.75, 0.95, n2 * n3 * 2.0) * 0.3;',
    '  col = mix(col, gold * 0.8, goldm);',
    '',
    '  // Mouse glow',
    '  col += cyan * trail * 0.25;',
    '',
    '  // CLICK EXPLOSIONS',
    '  for (int i = 0; i < 8; i++) {',
    '    if (i >= uClickCount) break;',
    '    vec4 c = uClicks[i];',
    '    if (c.w < 0.5) continue;',
    '    vec2 cp = c.xy * vec2(uRes.x / uRes.y, 1.0);',
    '    float age = uTime - c.z;',
    '    if (age < 0.0 || age > 2.5) continue;',
    '',
    '    float cd = distance(p, cp);',
    '',
    '    // Expanding shockwave ring',
    '    float ringR = age * 1.2;',
    '    float ring = smoothstep(0.08, 0.0, abs(cd - ringR)) * (1.0 - age / 2.5);',
    '    col += mix(cyan, gold, age / 2.5) * ring * 0.8;',
    '',
    '    // Particle burst (radiating dots)',
    '    float ang = atan(p.y - cp.y, p.x - cp.x);',
    '    float particles = 0.0;',
    '    for (int k = 0; k < 3; k++) {',
    '      float ka = float(k);',
    '      float pa = ang * (3.0 + ka) + ka * 2.1 + age * 2.0;',
    '      float pr = age * (0.5 + ka * 0.25);',
    '      float pd = distance(p, cp + vec2(cos(pa), sin(pa)) * pr);',
    '      particles += smoothstep(0.03, 0.0, pd) * (1.0 - age / 2.0);',
    '    }',
    '    vec3 pcol = mix(coral, gold, fract(age * 2.0));',
    '    col += pcol * particles * 0.9;',
    '',
    '    // Core flash',
    '    float flash = smoothstep(0.25 * (1.0 - age / 1.0), 0.0, cd) * max(0.0, 1.0 - age * 2.0);',
    '    col += vec3(1.0, 0.95, 0.85) * flash * 0.7;',
    '  }',
    '',
    '  // Vignette for text readability',
    '  float vig = smoothstep(1.3, 0.35, distance(uv, vec2(0.5, 0.45)));',
    '  col *= mix(0.5, 1.0, vig);',
    '',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, vsSource);
  var fs = compile(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) { canvas.style.display = 'none'; return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('Link error:', gl.getProgramInfoLog(prog));
    canvas.style.display = 'none';
    return;
  }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'uRes');
  var uTime = gl.getUniformLocation(prog, 'uTime');
  var uMouse = gl.getUniformLocation(prog, 'uMouse');
  var uClicks = gl.getUniformLocation(prog, 'uClicks');
  var uClickCount = gl.getUniformLocation(prog, 'uClickCount');

  var start = performance.now() / 1000;
  var running = true;

  var observer = new IntersectionObserver(function(entries) {
    running = entries[0].isIntersecting;
    if (running) requestAnimationFrame(frame);
  });
  observer.observe(canvas.parentElement);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, 8.0);
    gl.uniform2f(uMouse, 0.5, 0.5);
    gl.uniform1i(uClickCount, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return;
  }

  function frame() {
    if (!running) return;
    var now = performance.now() / 1000;
    var elapsed = now - start;
    
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;

    // Pack clicks into uniform array
    var clickData = new Float32Array(8 * 4);
    var activeCount = 0;
    for (var i = 0; i < clicks.length && i < 8; i++) {
      var c = clicks[i];
      var age = elapsed - (c.start - start);
      if (age >= 0 && age <= 2.5) {
        clickData[activeCount * 4] = c.x;
        clickData[activeCount * 4 + 1] = c.y;
        clickData[activeCount * 4 + 2] = c.start - start;
        clickData[activeCount * 4 + 3] = 1.0;
        activeCount++;
      }
    }

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform4fv(uClicks, clickData);
    gl.uniform1i(uClickCount, activeCount);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
