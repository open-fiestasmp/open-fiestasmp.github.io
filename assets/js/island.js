/*!
 * Fiesta SMP — floating voxel island (hero background)
 * Hand-rolled WebGL 1, zero dependencies.
 *  - World is generated + meshed once (hidden-face culling, per-vertex AO).
 *  - Renders in 3 draw calls: solid world, clouds, particle sprites.
 *  - Stops rendering when the hero is off-screen or the tab is hidden.
 *  - Lowers its own resolution on slow devices; honours prefers-reduced-motion.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('world');
  if (!canvas) return;
  var root = document.documentElement;
  var hero = canvas.parentNode;
  var copy = document.querySelector('.hero-copy');
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var fine = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  var nav = navigator;
  var lite = root.className.indexOf('lite') > -1 || (nav.hardwareConcurrency || 4) <= 2 || (nav.deviceMemory || 4) <= 2;
  var small = Math.min(screen.width, screen.height) < 600;
  var DPR = Math.min(window.devicePixelRatio || 1, lite ? 1 : small ? 1.5 : 1.75);

  var gl = null;
  try {
    var opts = { alpha: true, premultipliedAlpha: true, antialias: !lite && !small, depth: true, stencil: false, powerPreference: 'low-power' };
    gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
  } catch (e) { gl = null; }
  if (!gl) { root.classList.add('no-gl'); return; }

  /* ------------------------------------------------------------------ utils */
  function rng(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hash3(x, y, z) {
    var h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 1103515245)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function noise(x, y, s) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = hash3(xi, yi, s), b = hash3(xi + 1, yi, s), c = hash3(xi, yi + 1, s), d = hash3(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, s) { return noise(x, y, s) * 0.55 + noise(x * 2.03, y * 2.03, s + 7) * 0.3 + noise(x * 4.1, y * 4.1, s + 13) * 0.15; }

  /* --------------------------------------------------------------- palette */
  var COL = {
    grass: [0.42, 0.76, 0.3], dirt: [0.56, 0.38, 0.25], stone: [0.5, 0.5, 0.56], deep: [0.38, 0.36, 0.45],
    log: [0.45, 0.31, 0.19], logTop: [0.68, 0.54, 0.34], leaf: [0.27, 0.6, 0.26],
    blossom: [0.98, 0.62, 0.79], blossom2: [1, 0.77, 0.88], plank: [0.78, 0.6, 0.37], sand: [0.92, 0.85, 0.62],
    water: [0.24, 0.52, 0.98], gold: [1, 0.72, 0.12], pink: [1, 0.5, 0.68], aqua: [0.26, 0.84, 0.94],
    lime: [0.56, 0.88, 0.28], magenta: [0.88, 0.32, 0.67], cream: [1, 0.95, 0.85],
    lantern: [1, 0.84, 0.48], pig: [0.96, 0.66, 0.69], snout: [0.9, 0.5, 0.57], dark: [0.12, 0.08, 0.11],
    white: [1, 1, 1], cloud: [1, 0.97, 0.99], diamond: [0.36, 0.95, 0.92], oreGold: [1, 0.84, 0.3],
    fR: [0.95, 0.22, 0.3], fY: [1, 0.87, 0.25], fB: [0.5, 0.6, 1], fW: [0.98, 0.97, 1], stem: [0.25, 0.55, 0.22],
    string: [0.2, 0.14, 0.13], emerald: [0.24, 0.9, 0.48]
  };
  var FLAGS = [COL.gold, COL.pink, COL.aqua, COL.lime, COL.magenta, COL.cream];

  // block id -> [top, side, bottom, material, motion]
  // materials: 0 normal, 1 water, 5 cloud, 6 emissive, 8 grass(side), 9 ore
  // motion: 0 none, 1 leaf sway, 2 flag flutter, 3 bob, 4 cloud drift, 5 dance
  var B = [];
  B[1] = [COL.grass, COL.dirt, COL.dirt, 8, 0];
  B[2] = [COL.dirt, COL.dirt, COL.dirt, 0, 0];
  B[3] = [COL.stone, COL.stone, COL.stone, 0, 0];
  B[4] = [COL.deep, COL.deep, COL.deep, 0, 0];
  B[5] = [COL.logTop, COL.log, COL.logTop, 0, 0];
  B[6] = [COL.leaf, COL.leaf, COL.leaf, 0, 1];
  B[7] = [COL.blossom, COL.blossom, COL.blossom, 0, 1];
  B[8] = [COL.blossom2, COL.blossom2, COL.blossom2, 0, 1];
  B[9] = [COL.plank, COL.plank, COL.plank, 0, 0];
  B[10] = [COL.sand, COL.sand, COL.sand, 0, 0];
  B[11] = [COL.water, COL.water, COL.water, 1, 0];
  B[12] = [COL.diamond, COL.diamond, COL.diamond, 9, 0];
  B[13] = [COL.oreGold, COL.oreGold, COL.oreGold, 9, 0];
  B[14] = [COL.gold, COL.gold, COL.gold, 0, 0];
  B[15] = [COL.pink, COL.pink, COL.pink, 0, 0];
  B[16] = [COL.aqua, COL.aqua, COL.aqua, 0, 0];

  /* ------------------------------------------------------------- geometry */
  var P = [], N = [], C = [], M = [], I = [];
  var X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];

  function quad(q, n, c, ao, misc, wt) {
    var b = P.length / 3;
    for (var i = 0; i < 4; i++) {
      P.push(q[i][0], q[i][1], q[i][2]);
      N.push(n[0], n[1], n[2]);
      C.push(c[0], c[1], c[2], ao[i]);
      M.push(misc[0], misc[1], wt ? wt[i] : 0, misc[3]);
    }
    // flip the diagonal so AO interpolates without the classic seam artefact
    if (ao[0] + ao[2] < ao[1] + ao[3]) I.push(b + 1, b + 2, b + 3, b + 1, b + 3, b);
    else I.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }

  function Grid(w, h, d) { this.w = w; this.h = h; this.d = d; this.a = new Uint8Array(w * h * d); }
  Grid.prototype.get = function (x, y, z) {
    return (x < 0 || y < 0 || z < 0 || x >= this.w || y >= this.h || z >= this.d) ? 0 : this.a[x + this.w * (z + this.d * y)];
  };
  Grid.prototype.set = function (x, y, z, v) {
    if (x < 0 || y < 0 || z < 0 || x >= this.w || y >= this.h || z >= this.d) return;
    this.a[x + this.w * (z + this.d * y)] = v;
  };

  // [nx, ny, nz, corners] — corners are CCW seen from outside
  var FACES = [
    [0, 1, 0, [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]]],
    [0, -1, 0, [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]],
    [1, 0, 0, [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]],
    [-1, 0, 0, [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]]],
    [0, 0, 1, [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]],
    [0, 0, -1, [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]]]
  ];
  var AOF = [0.52, 0.7, 0.85, 1];

  function meshGrid(g, ox, oy, oz, motion, phase) {
    var o1 = [0, 0, 0], o2 = [0, 0, 0];
    for (var y = 0; y < g.h; y++) for (var z = 0; z < g.d; z++) for (var x = 0; x < g.w; x++) {
      var id = g.get(x, y, z);
      if (!id) continue;
      var b = B[id], jit = 0.93 + 0.14 * hash3(x, y, z + 99);
      for (var f = 0; f < 6; f++) {
        var F = FACES[f], nx = F[0], ny = F[1], nz = F[2];
        if (g.get(x + nx, y + ny, z + nz)) continue;
        var col = ny > 0 ? b[0] : ny < 0 ? b[2] : b[1];
        var mat = b[3] === 8 ? (ny === 0 ? 8 : 0) : b[3];
        var axis = nx ? 0 : ny ? 1 : 2, t1 = axis === 0 ? 1 : 0, t2 = axis === 2 ? 1 : 2;
        var fx = x + nx, fy = y + ny, fz = z + nz, ao = [], q = [];
        for (var k = 0; k < 4; k++) {
          var cr = F[3][k];
          o1[0] = o1[1] = o1[2] = 0; o2[0] = o2[1] = o2[2] = 0;
          o1[t1] = cr[t1] ? 1 : -1; o2[t2] = cr[t2] ? 1 : -1;
          var s1 = g.get(fx + o1[0], fy + o1[1], fz + o1[2]) ? 1 : 0;
          var s2 = g.get(fx + o2[0], fy + o2[1], fz + o2[2]) ? 1 : 0;
          var sc = g.get(fx + o1[0] + o2[0], fy + o1[1] + o2[1], fz + o1[2] + o2[2]) ? 1 : 0;
          ao.push(AOF[(s1 && s2) ? 0 : 3 - s1 - s2 - sc]);
          q.push([x + cr[0] + ox, y + cr[1] + oy, z + cr[2] + oz]);
        }
        quad(q, [nx, ny, nz], [col[0] * jit, col[1] * jit, col[2] * jit], ao,
          [mat, phase || 0, 0, motion != null ? motion : b[4]], null);
      }
    }
  }

  // oriented box: centre, right-handed basis (u, v, w), half sizes
  var BOXF = [
    [0, 1, [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]]],
    [0, -1, [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]]],
    [1, 1, [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]]],
    [1, -1, [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]]],
    [2, 1, [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]],
    [2, -1, [[-1, -1, -1], [-1, 1, -1], [1, 1, -1], [1, -1, -1]]]
  ];
  function obox(cx, cy, cz, u, v, w, hx, hy, hz, col, misc, hang) {
    var ax = [u, v, w];
    for (var f = 0; f < 6; f++) {
      var F = BOXF[f], a = ax[F[0]], s = F[1], n = [a[0] * s, a[1] * s, a[2] * s], q = [], wt = [];
      for (var k = 0; k < 4; k++) {
        var c = F[2][k], sx = c[0] * hx, sy = c[1] * hy, sz = c[2] * hz;
        q.push([cx + u[0] * sx + v[0] * sy + w[0] * sz, cy + u[1] * sx + v[1] * sy + w[1] * sz, cz + u[2] * sx + v[2] * sy + w[2] * sz]);
        wt.push(hang && c[1] < 0 ? 255 : 0);
      }
      var shade = F[0] === 1 && s < 0 ? 0.8 : 1;
      quad(q, n, col, [shade, shade, shade, shade], misc, wt);
    }
  }
  function box(x0, y0, z0, x1, y1, z1, col, misc) {
    obox((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, X, Y, Z, (x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2, col, misc || [0, 0, 0, 0]);
  }
  function norm(a) { var l = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

  /* ---------------------------------------------------------------- world */
  var R = rng(20211);
  var glows = [], petalsFrom = [], fall = null;
  var solidCount = 0, cloudCount = 0, partData = null, partCount = 0;

  function oak(g, x, y0, z) {
    var h = 4 + (R() * 2 | 0), y, dx, dz;
    for (y = 0; y < h; y++) g.set(x, y0 + y, z, 5);
    for (var ly = h - 2; ly <= h + 1; ly++) {
      var rad = ly < h ? 2 : 1;
      for (dx = -rad; dx <= rad; dx++) for (dz = -rad; dz <= rad; dz++) {
        var corner = Math.abs(dx) === rad && Math.abs(dz) === rad;
        if (corner && (ly === h + 1 || R() < 0.55)) continue;
        if (!g.get(x + dx, y0 + ly, z + dz)) g.set(x + dx, y0 + ly, z + dz, 6);
      }
    }
  }
  function cherry(g, x, y0, z) {
    var h = 5, y, dx, dz;
    for (y = 0; y < h; y++) g.set(x, y0 + y, z, 5);
    for (var ly = h - 2; ly <= h + 1; ly++) {
      var rad = (ly === h - 1 || ly === h) ? 3 : ly === h - 2 ? 2 : 1;
      for (dx = -rad; dx <= rad; dx++) for (dz = -rad; dz <= rad; dz++) {
        var ex = Math.abs(dx) === rad, ez = Math.abs(dz) === rad;
        if (ex && ez && (rad > 1 || R() < 0.7)) continue;
        if ((ex || ez) && R() < 0.22) continue;
        if (!g.get(x + dx, y0 + ly, z + dz)) g.set(x + dx, y0 + ly, z + dz, R() < 0.3 ? 8 : 7);
      }
    }
    for (var n = 0; n < 7; n++) {
      dx = (R() * 7 | 0) - 3; dz = (R() * 7 | 0) - 3;
      if (g.get(x + dx, y0 + h - 2, z + dz) && !g.get(x + dx, y0 + h - 3, z + dz)) g.set(x + dx, y0 + h - 3, z + dz, 7);
    }
    return h;
  }

  function build() {
    var S = 48, HH = 46, cx = 24, cz = 24, base = 30;
    var g = new Grid(S, HH, S);
    var top = new Int16Array(S * S), tv = new Float32Array(S * S);
    var x, y, z, k, i, th;
    for (i = 0; i < S * S; i++) { top[i] = -1; tv[i] = 9; }

    // --- terrain: wobbly disc on top, tapering rocky cone underneath
    for (x = 0; x < S; x++) for (z = 0; z < S; z++) {
      var dx = x + 0.5 - cx, dz = z + 0.5 - cz, r = Math.sqrt(dx * dx + dz * dz), a = Math.atan2(dz, dx);
      var edge = 15 * (0.8 + 0.42 * fbm(Math.cos(a) * 1.5 + 4, Math.sin(a) * 1.5 + 4, 11));
      var t = r / edge;
      if (t >= 1) continue;
      var h = base + Math.round((1 - t * t) * 2.5 + (fbm(x * 0.11, z * 0.11, 21) - 0.5) * 3.2);
      var depth = Math.round(Math.pow(1 - t, 0.75) * 21 + fbm(x * 0.25, z * 0.25, 31) * 5) + 1;
      var bot = Math.max(1, h - depth);
      top[x + z * S] = h; tv[x + z * S] = t;
      for (y = bot; y <= h; y++) {
        var id = y === h ? 1 : y >= h - 2 ? 2 : (y < bot + depth * 0.45 ? 4 : 3);
        if ((id === 3 || id === 4) && R() < 0.045) id = R() < 0.45 ? 12 : 13;
        g.set(x, y, z, id);
      }
    }
    function T(x, z) { return (x < 0 || z < 0 || x >= S || z >= S) ? -1 : top[x + z * S]; }
    var used = [];
    function free(x, z, rad) {
      for (var i = 0; i < used.length; i++) {
        var u = used[i], ddx = u[0] - x, ddz = u[1] - z;
        if (ddx * ddx + ddz * ddz < (u[2] + rad) * (u[2] + rad)) return false;
      }
      return true;
    }
    function W(x, y, z) { return [x - cx, y - base, z - cz]; }

    // --- pond + stream + waterfall off the edge
    var pcx = cx - 6, pcz = cz + 3, wl = 999;
    for (x = pcx - 4; x <= pcx + 4; x++) for (z = pcz - 4; z <= pcz + 4; z++) {
      if (Math.sqrt((x - pcx) * (x - pcx) + (z - pcz) * (z - pcz)) < 3.2 && T(x, z) >= 0) wl = Math.min(wl, T(x, z));
    }
    if (wl < 999) {
      for (x = pcx - 5; x <= pcx + 5; x++) for (z = pcz - 5; z <= pcz + 5; z++) {
        var pd = Math.sqrt((x - pcx) * (x - pcx) + (z - pcz) * (z - pcz));
        th = T(x, z);
        if (th < 0) continue;
        if (pd < 3.2) {
          for (y = wl; y < HH; y++) g.set(x, y, z, 0);
          g.set(x, wl, z, 11); g.set(x, wl - 1, z, 10); top[x + z * S] = wl;
        } else if (pd < 4.4 && th <= wl + 1) g.set(x, th, z, 10);
      }
      used.push([pcx, pcz, 4.6]);
      var fy = wl, fx = -1;
      for (x = pcx - 3; x >= 0; x--) {
        var on = false;
        for (k = 0; k < 2; k++) {
          z = pcz + k; th = T(x, z);
          if (th < 0) continue;
          on = true;
          var wy = Math.min(fy, th);
          for (y = wy; y < HH; y++) g.set(x, y, z, 0);
          g.set(x, wy, z, 11); g.set(x, wy - 1, z, 10); top[x + z * S] = wy; fy = wy;
        }
        if (!on) { fx = x; break; }
        used.push([x, pcz + 0.5, 1.4]);
      }
      if (fx >= 0) {
        var fb = Math.max(0, fy - 24);
        for (k = 0; k < 2; k++) for (y = fy; y > fb; y--) g.set(fx, y, pcz + k, 11);
        fall = W(fx + 0.5, fb + 1, pcz + 1);
      }
    }

    // --- the barter stall (striped wool roof, plank counter, flag pole)
    var scx = cx + 2, scz = cz - 3, h0 = T(scx, scz);
    if (h0 < 0) h0 = base + 2;
    for (x = scx - 2; x <= scx + 3; x++) for (z = scz - 2; z <= scz + 2; z++) {
      th = T(x, z);
      if (th < 0) continue;
      for (y = h0 + 1; y < HH; y++) g.set(x, y, z, 0);
      for (y = Math.min(th, h0); y < h0; y++) g.set(x, y, z, 2);
      g.set(x, h0, z, 1); top[x + z * S] = h0;
    }
    [[scx - 1, scz - 1], [scx + 2, scz - 1], [scx - 1, scz + 1], [scx + 2, scz + 1]].forEach(function (c) {
      for (var yy = h0 + 1; yy <= h0 + 3; yy++) g.set(c[0], yy, c[1], 5);
    });
    for (x = scx - 2; x <= scx + 3; x++) {
      for (z = scz - 2; z <= scz + 2; z++) g.set(x, h0 + 4, z, (x & 1) ? 14 : 15);
      g.set(x, h0 + 5, scz, (x & 1) ? 15 : 16);
    }
    g.set(scx, h0 + 6, scz, 5); g.set(scx, h0 + 7, scz, 5);
    g.set(scx, h0 + 1, scz - 1, 9); g.set(scx + 1, h0 + 1, scz - 1, 9);
    used.push([scx + 0.5, scz, 4.2]);
    var pole = W(scx + 0.5, h0 + 8, scz + 0.5);

    // --- lantern posts around the stall
    var posts = [];
    [0.5, 2.5, 4.4].forEach(function (a0) {
      for (var tr = 0; tr < 14; tr++) {
        var a = a0 + (tr % 2 ? 1 : -1) * Math.ceil(tr / 2) * 0.2;
        var px = Math.round(scx + 0.5 + Math.cos(a) * 7.5), pz = Math.round(scz + Math.sin(a) * 7.5);
        var pt = T(px, pz);
        if (pt < 0 || tv[px + pz * S] > 0.8 || !free(px, pz, 1) || g.get(px, pt, pz) !== 1) continue;
        for (var yy = pt + 1; yy <= pt + 3; yy++) g.set(px, yy, pz, 5);
        posts.push(W(px + 0.5, pt + 4, pz + 0.5));
        used.push([px, pz, 1.6]);
        break;
      }
    });

    // --- trees: oaks + cherry blossoms
    var nT = 0;
    for (var tries = 0; tries < 500 && nT < 6; tries++) {
      x = 3 + (R() * (S - 6) | 0); z = 3 + (R() * (S - 6) | 0); th = T(x, z);
      if (th < 0 || tv[x + z * S] > 0.72 || g.get(x, th, z) !== 1 || !free(x, z, 2.8)) continue;
      if (nT % 3 === 1) { var ch = cherry(g, x, th + 1, z); petalsFrom.push(W(x + 0.5, th + 1 + ch, z + 0.5)); }
      else oak(g, x, th + 1, z);
      used.push([x, z, 2.8]); nT++;
    }

    meshGrid(g, -cx, -base, -cz, null, 0);

    // --- small decorations (free boxes)
    var fcols = [COL.fR, COL.fY, COL.fB, COL.fW, COL.pink];
    for (tries = 0, k = 0; tries < 200 && k < 30; tries++) {
      x = (R() * S) | 0; z = (R() * S) | 0; th = T(x, z);
      if (th < 0 || tv[x + z * S] > 0.9 || g.get(x, th, z) !== 1 || g.get(x, th + 1, z)) continue;
      var p = W(x + 0.3 + R() * 0.4, th + 1, z + 0.3 + R() * 0.4);
      box(p[0] - 0.03, p[1], p[2] - 0.03, p[0] + 0.03, p[1] + 0.3, p[2] + 0.03, COL.stem, [0, 0, 0, 1]);
      box(p[0] - 0.1, p[1] + 0.26, p[2] - 0.1, p[0] + 0.1, p[1] + 0.42, p[2] + 0.1, fcols[k % fcols.length], [0, 0, 0, 1]);
      k++;
    }

    function lantern(p) {
      var x = p[0], y = p[1], z = p[2];
      box(x - 0.2, y, z - 0.2, x + 0.2, y + 0.42, z + 0.2, COL.lantern, [6, 0, 0, 0]);
      box(x - 0.24, y + 0.42, z - 0.24, x + 0.24, y + 0.5, z + 0.24, COL.dark);
      box(x - 0.24, y - 0.06, z - 0.24, x + 0.24, y, z + 0.24, COL.dark);
      glows.push([x, y + 0.21, z]);
    }
    posts.forEach(lantern);
    var hang = W(scx + 1, h0 + 3.1, scz + 0.5);
    box(hang[0] - 0.02, hang[1] + 0.5, hang[2] - 0.02, hang[0] + 0.02, hang[1] + 0.9, hang[2] + 0.02, COL.dark);
    lantern(hang);

    // goods on the counter: gold ingots + emeralds (it's a barter server, after all)
    var ct = W(scx, h0 + 2, scz - 1);
    box(ct[0] + 0.2, ct[1], ct[2] + 0.35, ct[0] + 0.7, ct[1] + 0.14, ct[2] + 0.62, COL.gold);
    box(ct[0] + 0.3, ct[1] + 0.14, ct[2] + 0.4, ct[0] + 0.62, ct[1] + 0.26, ct[2] + 0.58, COL.gold);
    box(ct[0] + 1.25, ct[1], ct[2] + 0.35, ct[0] + 1.5, ct[1] + 0.3, ct[2] + 0.6, COL.emerald);
    box(ct[0] + 1.58, ct[1], ct[2] + 0.4, ct[0] + 1.78, ct[1] + 0.22, ct[2] + 0.6, COL.diamond);

    // --- papel picado strings from the pole to each post
    function seg(p, q) {
      var d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
      var u = norm(d), w = norm(cross(u, Y)), v = cross(w, u);
      obox((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2, u, v, w, l / 2, 0.03, 0.03, COL.string, [0, 0, 0, 0]);
    }
    function string(a, b, si) {
      var dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
      var len = Math.sqrt(dx * dx + dy * dy + dz * dz), n = Math.max(4, Math.round(len / 0.62));
      var hl = Math.sqrt(dx * dx + dz * dz) || 1, u = [dx / hl, 0, dz / hl], wv = [-u[2], 0, u[0]];
      var sag = len * 0.08, prev = null;
      for (var i = 0; i <= n; i++) {
        var t = i / n, p = [a[0] + dx * t, a[1] + dy * t - sag * 4 * t * (1 - t), a[2] + dz * t];
        if (prev) seg(prev, p);
        if (i > 0 && i < n) obox(p[0], p[1] - 0.3, p[2], u, Y, wv, 0.2, 0.28, 0.025, FLAGS[(i + si) % FLAGS.length], [0, (i * 37 + si * 91) & 255, 0, 2], true);
        prev = p;
      }
    }
    posts.forEach(function (p, i) { string([pole[0], pole[1] - 0.1, pole[2]], [p[0], p[1] - 0.1, p[2]], i * 2); });

    // --- the mascot: a dancing pig in a party hat
    var pigAt = null;
    for (tries = 0; tries < 60 && !pigAt; tries++) {
      x = scx - 1 + (R() * 4 | 0); z = scz - 4 - (R() * 3 | 0); th = T(x, z);
      if (th >= 0 && g.get(x, th, z) === 1 && !g.get(x, th + 1, z) && !g.get(x, th + 2, z) && free(x, z, 0.6)) pigAt = [x, th, z];
    }
    if (pigAt) {
      var pp = W(pigAt[0] + 0.5, pigAt[1] + 1, pigAt[2] + 0.5);
      var th0 = Math.atan2((scz - 1) - pigAt[2], (scx + 0.5) - pigAt[0]) + 0.5;
      var pu = [Math.cos(th0), 0, Math.sin(th0)], pw = [-pu[2], 0, pu[0]], sc = 1.25, dance = [0, 0, 0, 5];
      var pbox = function (x0, y0, z0, x1, y1, z1, col) {
        var lx = (x0 + x1) / 2 * sc, ly = (y0 + y1) / 2 * sc, lz = (z0 + z1) / 2 * sc;
        obox(pp[0] + pu[0] * lx + pw[0] * lz, pp[1] + ly, pp[2] + pu[2] * lx + pw[2] * lz, pu, Y, pw,
          (x1 - x0) / 2 * sc, (y1 - y0) / 2 * sc, (z1 - z0) / 2 * sc, col, dance);
      };
      pbox(-0.42, 0, -0.32, -0.16, 0.36, -0.08, COL.pig); pbox(0.16, 0, -0.32, 0.42, 0.36, -0.08, COL.pig);
      pbox(-0.42, 0, 0.08, -0.16, 0.36, 0.32, COL.pig); pbox(0.16, 0, 0.08, 0.42, 0.36, 0.32, COL.pig);
      pbox(-0.55, 0.34, -0.36, 0.55, 0.92, 0.36, COL.pig);
      pbox(0.5, 0.5, -0.29, 1.06, 1.06, 0.29, COL.pig);
      pbox(1.06, 0.6, -0.14, 1.14, 0.8, 0.14, COL.snout);
      pbox(1.06, 0.86, 0.12, 1.08, 0.96, 0.24, COL.dark); pbox(1.06, 0.86, -0.24, 1.08, 0.96, -0.12, COL.dark);
      pbox(0.62, 1.06, -0.17, 0.94, 1.2, 0.17, COL.pink);
      pbox(0.68, 1.2, -0.11, 0.88, 1.33, 0.11, COL.gold);
      pbox(0.73, 1.33, -0.06, 0.83, 1.44, 0.06, COL.aqua);
      pbox(0.74, 1.44, -0.05, 0.82, 1.52, 0.05, COL.white);
    }

    // --- satellite mini islands (bob gently)
    function mini(seed, rad, wx, wy, wz, ph, deco) {
      var MS = 20, MH = 26, mc = 10, mb = 18, m = new Grid(MS, MH, MS), topc = mb;
      for (var x = 0; x < MS; x++) for (var z = 0; z < MS; z++) {
        var dx = x + 0.5 - mc, dz = z + 0.5 - mc, r = Math.sqrt(dx * dx + dz * dz), a = Math.atan2(dz, dx);
        var t = r / (rad * (0.78 + 0.4 * fbm(Math.cos(a) * 1.4 + seed, Math.sin(a) * 1.4 + seed, seed)));
        if (t >= 1) continue;
        var h = mb + Math.round((1 - t * t) * 1.4);
        var depth = Math.round(Math.pow(1 - t, 0.8) * rad * 1.7 + fbm(x * 0.3, z * 0.3, seed + 3) * 2) + 1;
        for (var y = Math.max(0, h - depth); y <= h; y++) m.set(x, y, z, y === h ? 1 : y >= h - 1 ? 2 : 3);
        if (x === mc && z === mc) topc = h;
      }
      if (deco === 'oak') oak(m, mc, topc + 1, mc);
      if (deco === 'cherry') cherry(m, mc, topc + 1, mc);
      if (deco === 'gold') { m.set(mc, topc + 1, mc, 14); m.set(mc - 2, topc + 1, mc + 1, 15); }
      meshGrid(m, wx - mc, wy - mb, wz - mc, 3, ph);
    }
    mini(5, 3.9, -22, 4, -12, 10, 'oak');
    mini(9, 3.1, 21, -8, 13, 120, 'gold');
    mini(13, 3.5, 7, 11, -24, 200, 'cherry');
    if (!lite) mini(17, 2.6, -16, -11, 19, 60, null);

    solidCount = I.length;

    // --- clouds (drawn last, blended so they can fade at the wrap edges)
    var NC = lite ? 10 : 18;
    for (i = 0; i < NC; i++) {
      var low = i % 3 !== 0;
      var cy = low ? -28 - R() * 7 : 22 + R() * 8;
      var czz = (R() * 2 - 1) * 72, ph = R() * 255 | 0;
      var bw = 7 + R() * 10, bd = 4 + R() * 7, bh = low ? 2.2 : 1.5, mi = [5, ph, 0, 4];
      box(-bw / 2, cy, czz - bd / 2, bw / 2, cy + bh, czz + bd / 2, COL.cloud, mi);
      var nb = 1 + (R() * 3 | 0);
      for (k = 0; k < nb; k++) {
        var ox = (R() * 2 - 1) * bw * 0.55, oz = (R() * 2 - 1) * bd * 0.55, w2 = 3 + R() * 6, d2 = 3 + R() * 5;
        var y0 = cy + (R() < 0.5 ? 0 : bh * 0.4);
        box(ox - w2 / 2, y0, czz + oz - d2 / 2, ox + w2 / 2, y0 + bh * (R() < 0.5 ? 1 : 1.5), czz + oz + d2 / 2, COL.cloud, mi);
      }
    }
    cloudCount = I.length - solidCount;

    // --- particles: fireflies, falling petals, lantern glow, waterfall mist
    var parts = [];
    function pt(p, c, kind, size) { parts.push(p[0], p[1], p[2], R(), c[0], c[1], c[2], kind, size); }
    var fc = [[1, 0.84, 0.42], [1, 0.84, 0.42], [1, 0.56, 0.72], [0.5, 0.92, 1]];
    var NF = lite ? 22 : 56;
    for (i = 0; i < NF; i++) {
      var rr = Math.sqrt(R()) * 16, aa = R() * 6.2832;
      pt([Math.cos(aa) * rr, 2 + R() * 10, Math.sin(aa) * rr], fc[i % fc.length], 0, 0.34);
    }
    petalsFrom.forEach(function (c) {
      for (var j = 0; j < (lite ? 6 : 14); j++) pt([c[0] + (R() * 2 - 1) * 3, c[1] + R() * 1.5, c[2] + (R() * 2 - 1) * 3], R() < 0.5 ? [1, 0.7, 0.84] : [1, 0.86, 0.93], 1, 0.16);
    });
    glows.forEach(function (p) { pt(p, [1, 0.7, 0.36], 2, 3.4); });
    if (fall) for (i = 0; i < 7; i++) pt([fall[0] + (R() - 0.5) * 2, fall[1] + R() * 2, fall[2] + (R() - 0.5) * 2], [0.7, 0.78, 1], 3, 1.7);
    partData = new Float32Array(parts);
    partCount = parts.length / 9;
  }

  /* ---------------------------------------------------------------- shaders */
  var VS = [
    'attribute vec3 aPos;attribute vec3 aNrm;attribute vec4 aCol;attribute vec4 aMisc;',
    'uniform mat4 uVP;uniform vec3 uCam;uniform vec3 uSun;uniform float uTime;uniform vec2 uFog;',
    'varying vec3 vAlb;varying vec3 vLight;varying vec3 vPos;varying vec3 vNrm;varying float vMat;varying float vAlpha;',
    'void main(){',
    ' vec3 p=aPos;float mo=aMisc.w;float ph=aMisc.y*0.024639;float fade=1.0;',
    ' if(mo>0.5&&mo<1.5){p.x+=sin(uTime*1.7+aPos.x*0.9+aPos.y*0.5+aPos.z*0.7)*0.05;p.z+=cos(uTime*1.3+aPos.x*0.6+aPos.z*0.8)*0.04;}',
    ' else if(mo>1.5&&mo<2.5){float w=aMisc.z/255.0;p.x+=sin(uTime*2.6+ph)*0.16*w;p.z+=cos(uTime*2.1+ph)*0.16*w;}',
    ' else if(mo>2.5&&mo<3.5){p.y+=sin(uTime*0.7+ph)*0.8;}',
    ' else if(mo>3.5&&mo<4.5){float cx=mod(uTime*1.1+aMisc.y*0.9412,240.0)-120.0;p.x+=cx;fade=(1.0-smoothstep(78.0,118.0,abs(cx)))*smoothstep(26.0,52.0,distance(p,uCam));}',
    ' else if(mo>4.5){p.y+=abs(sin(uTime*3.4+ph))*0.3;}',
    ' vec3 n=aNrm;float diff=max(dot(n,uSun),0.0);',
    ' vec3 hemi=mix(vec3(0.5,0.28,0.4),vec3(0.58,0.54,0.92),n.y*0.5+0.5);',
    ' vLight=(hemi*0.86+vec3(1.0,0.76,0.52)*diff*0.95)*aCol.a;',
    ' vAlb=aCol.rgb;vPos=aPos;vNrm=n;vMat=aMisc.x;',
    ' vAlpha=(1.0-smoothstep(uFog.x,uFog.y,distance(p,uCam)))*fade;',
    ' gl_Position=uVP*vec4(p,1.0);',
    '}'
  ].join('\n');

  var FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform float uTime;uniform vec3 uGrass;uniform vec3 uStone;',
    'varying vec3 vAlb;varying vec3 vLight;varying vec3 vPos;varying vec3 vNrm;varying float vMat;varying float vAlpha;',
    'float hash(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
    'void main(){',
    ' vec3 q=vPos-vNrm*0.02;float m=vMat;',
    ' if(abs(m-1.0)<0.5){if(abs(vNrm.y)<0.5)q.y+=uTime*2.2;else q.x+=uTime*0.4;}',
    ' float px=hash(floor(q*8.0));vec3 alb=vAlb;',
    ' if(abs(m-8.0)<0.5){float c=hash(vec3(floor(q.x*8.0),3.0,floor(q.z*8.0)));if(fract(q.y)>0.8-step(0.6,c)*0.125)alb=uGrass;}',
    ' else if(abs(m-9.0)<0.5){alb=px>0.8?vAlb:uStone;}',
    ' vec3 c;',
    ' if(abs(m-6.0)<0.5)c=alb*(1.15+0.2*px);',
    ' else if(abs(m-5.0)<0.5)c=alb*vLight;',
    ' else if(abs(m-1.0)<0.5)c=alb*vLight*(0.8+0.34*px);',
    ' else c=alb*vLight*(0.88+0.16*px);',
    ' gl_FragColor=vec4(c*vAlpha,vAlpha);',
    '}'
  ].join('\n');

  var PVS = [
    'attribute vec4 aP;attribute vec4 aC;attribute float aSz;',
    'uniform mat4 uVP;uniform float uTime;uniform float uPx;uniform float uMaxPt;',
    'varying vec3 vC;varying float vA;varying float vK;',
    'void main(){',
    ' vec3 p=aP.xyz;float s=aP.w;float k=aC.w;float a=1.0;',
    ' if(k<0.5){p+=vec3(sin(uTime*0.45+s*17.0)*1.6,sin(uTime*0.6+s*29.0)*0.9,cos(uTime*0.4+s*23.0)*1.6);a=0.55+0.45*sin(uTime*2.3+s*40.0);}',
    ' else if(k<1.5){float f=fract(uTime*0.08+s);p.y-=f*7.0;p.x+=sin(uTime*1.3+s*30.0)*0.5+f*2.0;p.z+=cos(uTime*1.1+s*20.0)*0.5;a=smoothstep(0.0,0.1,f)*(1.0-smoothstep(0.8,1.0,f));}',
    ' else if(k<2.5){a=0.75+0.25*sin(uTime*3.0+s*12.0);}',
    ' else{float f=fract(uTime*0.15+s);p+=vec3(sin(s*50.0)*f*2.5,f*2.5-1.0,cos(s*50.0)*f*2.5);a=sin(f*3.14159)*0.35;}',
    ' vec4 c=uVP*vec4(p,1.0);gl_Position=c;',
    ' gl_PointSize=clamp(aSz*uPx/max(c.w,0.1),1.0,uMaxPt);',
    ' vC=aC.rgb;vA=a;vK=k;',
    '}'
  ].join('\n');

  var PFS = [
    'precision mediump float;',
    'varying vec3 vC;varying float vA;varying float vK;',
    'void main(){',
    ' vec2 d=gl_PointCoord-0.5;float a;',
    ' if(vK>0.5&&vK<1.5){a=vA;gl_FragColor=vec4(vC*a,a);return;}',
    ' float r=dot(d,d)*4.0;a=max(0.0,1.0-r);a*=a*vA;',
    ' gl_FragColor=vec4(vC*a,a*(vK>1.5?0.3:0.75));',
    '}'
  ].join('\n');

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(vs, fs, attrs) {
    var p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    attrs.forEach(function (a, i) { gl.bindAttribLocation(p, i, a); });
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
    return { p: p, u: u };
  }

  /* ------------------------------------------------------------------ maths */
  var VP = new Float32Array(16), PM = new Float32Array(16), VM = new Float32Array(16);
  function perspective(o, fovy, asp, n, f, ox, oy) {
    var t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f);
    o[0] = t / asp; o[1] = 0; o[2] = 0; o[3] = 0;
    o[4] = 0; o[5] = t; o[6] = 0; o[7] = 0;
    o[8] = -ox; o[9] = -oy; o[10] = (f + n) * nf; o[11] = -1;
    o[12] = 0; o[13] = 0; o[14] = 2 * f * n * nf; o[15] = 0;
  }
  function lookAt(o, e, c) {
    var zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = 1 / Math.sqrt(zx * zx + zy * zy + zz * zz);
    zx *= l; zy *= l; zz *= l;
    var xx = zz, xy = 0, xz = -zx; // cross(up=(0,1,0), z)
    l = 1 / Math.sqrt(xx * xx + xz * xz); xx *= l; xz *= l;
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    o[0] = xx; o[1] = yx; o[2] = zx; o[3] = 0;
    o[4] = xy; o[5] = yy; o[6] = zy; o[7] = 0;
    o[8] = xz; o[9] = yz; o[10] = zz; o[11] = 0;
    o[12] = -(xx * e[0] + xy * e[1] + xz * e[2]);
    o[13] = -(yx * e[0] + yy * e[1] + yz * e[2]);
    o[14] = -(zx * e[0] + zy * e[1] + zz * e[2]);
    o[15] = 1;
    return [xx, xy, xz, yx, yy, yz, zx, zy, zz];
  }
  function mul(o, a, b) {
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
      o[j * 4 + i] = a[i] * b[j * 4] + a[4 + i] * b[j * 4 + 1] + a[8 + i] * b[j * 4 + 2] + a[12 + i] * b[j * 4 + 3];
    }
  }

  /* --------------------------------------------------------------- runtime */
  var FOV = 0.66; // ~38deg vertical
  var wp, pp, vbo, ibo, pbo, idxType, idxBytes, maxPt = 64;
  var scale = 1, dist = 70, offX = 0, offY = 0;
  var simT = 0, running = false, inView = true, raf = 0, last = 0;
  var ptx = 0, pty = 0, px = 0, py = 0, scrollP = 0;
  var acc = 0, cnt = 0;
  var eye = [0, 0, 0], sun = [0, 0, 0];

  function init() {
    try {
      build();
      wp = program(VS, FS, ['aPos', 'aNrm', 'aCol', 'aMisc']);
      pp = program(PVS, PFS, ['aP', 'aC', 'aSz']);
    } catch (err) {
      if (window.console) console.warn('[fiesta] 3D disabled:', err);
      root.classList.add('no-gl');
      return;
    }

    var nv = P.length / 3, buf = new ArrayBuffer(nv * 24);
    var f32 = new Float32Array(buf), i8 = new Int8Array(buf), u8 = new Uint8Array(buf);
    for (var i = 0; i < nv; i++) {
      var o = i * 6, b = i * 24, i3 = i * 3, i4 = i * 4;
      f32[o] = P[i3]; f32[o + 1] = P[i3 + 1]; f32[o + 2] = P[i3 + 2];
      i8[b + 12] = Math.round(N[i3] * 127); i8[b + 13] = Math.round(N[i3 + 1] * 127); i8[b + 14] = Math.round(N[i3 + 2] * 127);
      u8[b + 16] = Math.min(255, C[i4] * 255); u8[b + 17] = Math.min(255, C[i4 + 1] * 255);
      u8[b + 18] = Math.min(255, C[i4 + 2] * 255); u8[b + 19] = Math.min(255, C[i4 + 3] * 255);
      u8[b + 20] = M[i4]; u8[b + 21] = M[i4 + 1]; u8[b + 22] = M[i4 + 2]; u8[b + 23] = M[i4 + 3];
    }
    var big = nv > 65535;
    if (big && !gl.getExtension('OES_element_index_uint')) { root.classList.add('no-gl'); return; }
    idxType = big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT; idxBytes = big ? 4 : 2;

    vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
    ibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, big ? new Uint32Array(I) : new Uint16Array(I), gl.STATIC_DRAW);
    pbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pbo); gl.bufferData(gl.ARRAY_BUFFER, partData, gl.STATIC_DRAW);
    P = N = C = M = I = null; // free build memory

    var range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
    if (range && range[1]) maxPt = Math.min(256, range[1]);

    gl.useProgram(wp.p);
    gl.uniform3f(wp.u.uGrass, 0.42, 0.76, 0.3);
    gl.uniform3f(wp.u.uStone, 0.5, 0.5, 0.56);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.cullFace(gl.BACK);

    resize();
    bind();
    if (reduce) { simT = 9; draw(simT); root.classList.add('gl-ready'); return; }
    start();
  }

  function layout() {
    var Wd = canvas.clientWidth, Ht = canvas.clientHeight;
    if (!Wd || !Ht) return;
    var x0 = 0, y0 = 0, x1 = Wd, y1 = Ht;
    if (copy) {
      var ox = 0, oy = 0, el = copy;
      while (el && el !== hero) { ox += el.offsetLeft; oy += el.offsetTop; el = el.offsetParent; }
      var wide = Wd >= 900 && Wd / Ht > 1.05;
      if (wide) { x0 = Math.min(Wd * 0.6, ox + copy.offsetWidth - Wd * 0.03); x1 = Wd * 0.985; }
      else { y0 = Math.min(Ht * 0.7, oy + copy.offsetHeight + 4); y1 = Ht * 0.99; }
    }
    var asp = Wd / Ht, rw = (x1 - x0) / Wd, rh = (y1 - y0) / Ht;
    // keep the camera close (so clouds stay around the island, not in front of it):
    // narrow/portrait screens get a wider lens instead of a more distant camera
    var MAXD = 92, t = Math.tan(0.33);
    var need = Math.max(19.5 / (MAXD * asp * rw * 0.94), 18 / (MAXD * rh * 0.94));
    if (need > t) t = Math.min(need, Math.tan(0.7));
    FOV = 2 * Math.atan(t);
    dist = Math.max(56, 19.5 / (t * asp * rw * 0.94), 18 / (t * rh * 0.94));
    offX = ((x0 + x1) / 2) / Wd * 2 - 1;
    offY = 1 - ((y0 + y1) / 2) / Ht * 2;
  }

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    var Wd = Math.max(1, Math.round(w * DPR * scale)), Ht = Math.max(1, Math.round(h * DPR * scale));
    if (canvas.width !== Wd || canvas.height !== Ht) { canvas.width = Wd; canvas.height = Ht; }
    layout();
    if (!running && wp) draw(simT);
  }

  function bind() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  }

  function ease(t) { t = Math.min(1, Math.max(0, t)); return 1 - Math.pow(1 - t, 3); }

  function draw(time) {
    var Wd = canvas.width, Ht = canvas.height, asp = Wd / Ht;
    var k = ease(time / 3);
    px += (ptx - px) * 0.05; py += (pty - py) * 0.05;
    var yaw = 0.55 + time * 0.055 - (1 - k) * 1.1 + px * 0.22;
    var pitch = 0.27 + py * 0.06 + scrollP * 0.32 + (1 - k) * 0.12;
    var d = dist * (1 + (1 - k) * 0.75) * (1 - scrollP * 0.12);
    var ty = -5 - (1 - k) * 7;
    eye[0] = d * Math.cos(pitch) * Math.sin(yaw);
    eye[1] = ty + d * Math.sin(pitch);
    eye[2] = d * Math.cos(pitch) * Math.cos(yaw);

    perspective(PM, FOV, asp, 0.5, 700, offX, offY);
    var basis = lookAt(VM, eye, [0, ty, 0]);
    mul(VP, PM, VM);
    // key light comes from the upper-left of the screen (matches the CSS sun)
    sun[0] = basis[0] * -0.62 + basis[3] * 0.62 + basis[6] * 0.48;
    sun[1] = basis[1] * -0.62 + basis[4] * 0.62 + basis[7] * 0.48;
    sun[2] = basis[2] * -0.62 + basis[5] * 0.62 + basis[8] * 0.48;
    var sl = 1 / Math.sqrt(sun[0] * sun[0] + sun[1] * sun[1] + sun[2] * sun[2]);

    gl.viewport(0, 0, Wd, Ht);
    gl.clearColor(0, 0, 0, 0);
    gl.depthMask(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // world
    gl.useProgram(wp.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1); gl.enableVertexAttribArray(2); gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(1, 3, gl.BYTE, true, 24, 12);
    gl.vertexAttribPointer(2, 4, gl.UNSIGNED_BYTE, true, 24, 16);
    gl.vertexAttribPointer(3, 4, gl.UNSIGNED_BYTE, false, 24, 20);
    gl.uniformMatrix4fv(wp.u.uVP, false, VP);
    gl.uniform3f(wp.u.uCam, eye[0], eye[1], eye[2]);
    gl.uniform3f(wp.u.uSun, sun[0] * sl, sun[1] * sl, sun[2] * sl);
    gl.uniform1f(wp.u.uTime, time);
    gl.uniform2f(wp.u.uFog, d + 30, d + 125);
    gl.enable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.drawElements(gl.TRIANGLES, solidCount, idxType, 0);

    // clouds
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    if (cloudCount) gl.drawElements(gl.TRIANGLES, cloudCount, idxType, solidCount * idxBytes);

    // particles
    gl.useProgram(pp.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, pbo);
    gl.disableVertexAttribArray(3);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 36, 0);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 36, 16);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 36, 32);
    gl.uniformMatrix4fv(pp.u.uVP, false, VP);
    gl.uniform1f(pp.u.uTime, time);
    gl.uniform1f(pp.u.uPx, Ht / (2 * Math.tan(FOV / 2)));
    gl.uniform1f(pp.u.uMaxPt, maxPt);
    gl.disable(gl.CULL_FACE);
    gl.depthMask(false);
    gl.drawArrays(gl.POINTS, 0, partCount);
    gl.depthMask(true);
  }

  function frame(now) {
    raf = 0;
    if (!inView || document.hidden) { running = false; return; }
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    simT += dt;
    // adaptive resolution: if we can't hold ~40fps, render fewer pixels
    if (simT > 3.2) {
      acc += dt; cnt++;
      if (cnt >= 90) {
        var avg = acc / cnt; acc = 0; cnt = 0;
        if (avg > 0.025 && scale > 0.5) { scale = Math.max(0.5, scale * 0.78); resize(); }
      }
    }
    draw(simT);
    if (!root.classList.contains('gl-ready')) root.classList.add('gl-ready');
  }

  function start() {
    if (running || reduce || !wp) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------- events */
  var rt = 0;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 120); });
  window.addEventListener('scroll', function () {
    var h = hero.offsetHeight || 1;
    scrollP = Math.min(1, Math.max(0, (window.pageYOffset || 0) / h));
  }, { passive: true });
  if (fine && !reduce) {
    window.addEventListener('pointermove', function (e) {
      ptx = e.clientX / window.innerWidth * 2 - 1;
      pty = e.clientY / window.innerHeight * 2 - 1;
    }, { passive: true });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
      if (inView) start();
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && inView) start(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); if (!running && wp) draw(simT); });
  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    running = false; cancelAnimationFrame(raf);
    root.classList.remove('gl-ready'); root.classList.add('no-gl');
  }, false);

  // build after first paint so text + layout land first
  var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 16); };
  idle(init, { timeout: 500 });
})();
