import React, { useRef, useCallback, useState, useEffect } from 'react';
import { CONNECTOR_TYPES, CONTAINER_TYPES } from '../hooks/useCanvas';

// ── Constants ──────────────────────────────────────────────────────────────────
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// ── Anchor helpers ─────────────────────────────────────────────────────────────
function getAnchors(el) {
  const { width, height } = el.props;
  if (el.type === 'ellipse') return [
    { id: 'top',    x: width / 2, y: 0          },
    { id: 'right',  x: width,     y: height / 2 },
    { id: 'bottom', x: width / 2, y: height     },
    { id: 'left',   x: 0,         y: height / 2 },
  ];
  return [
    { id: 'tl', x: 0,         y: 0          },
    { id: 'tc', x: width / 2, y: 0          },
    { id: 'tr', x: width,     y: 0          },
    { id: 'ml', x: 0,         y: height / 2 },
    { id: 'mr', x: width,     y: height / 2 },
    { id: 'bl', x: 0,         y: height     },
    { id: 'bc', x: width / 2, y: height     },
    { id: 'br', x: width,     y: height     },
  ];
}

function anchorAbsPos(el, anchorId) {
  const a = getAnchors(el).find(a => a.id === anchorId);
  if (!a) return { x: el.x, y: el.y };
  return { x: el.x + a.x, y: el.y + a.y };
}

// ── Element renderers ──────────────────────────────────────────────────────────
function RectEl({ el, isSelected }) {
  const { width, height, fill, borderColor, borderWidth, radius } = el.props;
  return <div style={{
    width, height,
    background: fill === 'transparent' ? 'transparent' : fill,
    border: `${borderWidth}px solid ${borderColor}`,
    borderRadius: radius,
    outline: isSelected ? '2px solid #6366f1' : 'none',
    outlineOffset: 2, boxSizing: 'border-box',
  }} />;
}

function SvgContainerEl({ el, isSelected, renderInner }) {
  const { width, height, fill, borderColor, borderWidth, radius } = el.props;
  return (
    <div style={{ width, height, position: 'relative', outline: isSelected ? '2px solid #6366f1' : 'none', outlineOffset: 2 }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <rect x={borderWidth/2} y={borderWidth/2} width={width-borderWidth} height={height-borderWidth}
          rx={radius ?? 4} fill={fill === 'transparent' ? 'none' : fill} stroke={borderColor} strokeWidth={borderWidth} />
        {renderInner({ width, height, borderColor, borderWidth })}
      </svg>
    </div>
  );
}

function EllipseEl({ el, isSelected }) {
  const { width, height, fill, borderColor, borderWidth } = el.props;
  return (
    <div style={{ width, height, outline: isSelected ? '2px solid #6366f1' : 'none', outlineOffset: 2, borderRadius: '50%' }}>
      <svg width={width} height={height}>
        <ellipse cx={width/2} cy={height/2} rx={width/2-borderWidth/2} ry={height/2-borderWidth/2}
          fill={fill === 'transparent' ? 'none' : fill} stroke={borderColor} strokeWidth={borderWidth} />
      </svg>
    </div>
  );
}

function TextBoxEl({ el, isSelected }) {
  const { width, height, text, color, fontSize, fontFamily, align } = el.props;
  return (
    <div style={{
      width, height: height ?? 'auto', minHeight: 28, color, fontSize, fontFamily, textAlign: align,
      outline: isSelected ? '2px solid #6366f1' : '1px dashed rgba(255,255,255,0.18)',
      outlineOffset: isSelected ? 2 : 0,
      padding: '4px 6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      boxSizing: 'border-box', userSelect: 'none',
    }}>
      {text || 'Text'}
    </div>
  );
}

function ImageBoxEl({ el, isSelected }) {
  const { width, height, fill, borderColor, borderWidth, imageData, objectFit } = el.props;
  const bw = borderWidth ?? 2;
  return (
    <div style={{ width, height, position: 'relative', outline: isSelected ? '2px solid #6366f1' : 'none', outlineOffset: 2 }}>
      {imageData ? (
        <img src={imageData} alt="" draggable={false}
          style={{ width: '100%', height: '100%', objectFit: objectFit ?? 'contain', display: 'block', borderRadius: 4 }} />
      ) : (
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
          <rect x={bw/2} y={bw/2} width={width-bw} height={height-bw} rx={4}
            fill={fill === 'transparent' ? 'none' : fill} stroke={borderColor} strokeWidth={bw} />
          <circle cx={width*0.3} cy={height*0.38} r={height*0.1} stroke={borderColor} strokeWidth={1.5} fill="none" />
          <polyline points={`${bw},${height-bw} ${width*0.25},${height*0.55} ${width*0.45},${height*0.7} ${width*0.65},${height*0.45} ${width-bw},${height-bw}`}
            stroke={borderColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      )}
    </div>
  );
}

function PenEl({ el, isSelected }) {
  const { points = [], color, strokeWidth } = el.props;
  if (points.length < 2) return null;
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const maxX = Math.max(...xs), maxY = Math.max(...ys);
  const pad = (strokeWidth ?? 2) + 4;
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;
  const pts = points.map(p => `${p.x - minX + pad},${p.y - minY + pad}`).join(' ');
  return (
    <div style={{ width: w, height: h, outline: isSelected ? '2px solid #6366f1' : 'none', outlineOffset: 2 }}>
      <svg width={w} height={h}>
        <polyline points={pts} stroke={color ?? '#ffffff'} strokeWidth={strokeWidth ?? 2}
          strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
}

function renderElement(el, isSelected) {
  switch (el.type) {
    case 'rectangle':       return <RectEl el={el} isSelected={isSelected} />;
    case 'ellipse':         return <EllipseEl el={el} isSelected={isSelected} />;
    case 'rect-1partition': return <SvgContainerEl el={el} isSelected={isSelected} renderInner={({width,height,borderColor,borderWidth}) => (
      <line x1={width/2} y1={0} x2={width/2} y2={height} stroke={borderColor} strokeWidth={borderWidth} />
    )} />;
    case 'rect-2partition': return <SvgContainerEl el={el} isSelected={isSelected} renderInner={({width,height,borderColor,borderWidth}) => (<>
      <line x1={width/3} y1={0} x2={width/3} y2={height} stroke={borderColor} strokeWidth={borderWidth} />
      <line x1={2*width/3} y1={0} x2={2*width/3} y2={height} stroke={borderColor} strokeWidth={borderWidth} />
    </>)} />;
    case 'rect-1row':       return <SvgContainerEl el={el} isSelected={isSelected} renderInner={({width,height,borderColor,borderWidth}) => (
      <line x1={0} y1={height/2} x2={width} y2={height/2} stroke={borderColor} strokeWidth={borderWidth} />
    )} />;
    case 'rect-2rows':      return <SvgContainerEl el={el} isSelected={isSelected} renderInner={({width,height,borderColor,borderWidth}) => (<>
      <line x1={0} y1={height/3} x2={width} y2={height/3} stroke={borderColor} strokeWidth={borderWidth} />
      <line x1={0} y1={2*height/3} x2={width} y2={2*height/3} stroke={borderColor} strokeWidth={borderWidth} />
    </>)} />;
    case 'textbox':  return <TextBoxEl el={el} isSelected={isSelected} />;
    case 'imagebox': return <ImageBoxEl el={el} isSelected={isSelected} />;
    case 'pen':      return <PenEl el={el} isSelected={isSelected} />;
    default:         return null;
  }
}

// ── Anchor dots ────────────────────────────────────────────────────────────────
function AnchorDots({ el, onAnchorClick, pendingFrom, anchorClickedRef }) {
  return (
    <>
      {getAnchors(el).map(a => {
        const isPending = pendingFrom?.elId === el.id && pendingFrom?.anchorId === a.id;
        return (
          <div key={a.id}
            onMouseDown={e => {
              e.stopPropagation();
              if (anchorClickedRef) anchorClickedRef.current = true; // flag BEFORE canvas sees it
              onAnchorClick(el.id, a.id);
            }}
            style={{
              position: 'absolute', left: a.x - 5, top: a.y - 5,
              width: 10, height: 10, borderRadius: '50%',
              background: isPending ? '#f59e0b' : '#6366f1',
              border: '2px solid #fff', cursor: 'crosshair', zIndex: 10, transition: 'transform 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        );
      })}
    </>
  );
}

// ── SVG connector layer ────────────────────────────────────────────────────────
function ConnectorLayer({ connectors, elements, selectedId, onSelect }) {
  const elMap = Object.fromEntries(elements.map(e => [e.id, e]));
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
      {connectors.map(conn => {
        const from = elMap[conn.fromId], to = elMap[conn.toId];
        if (!from || !to) return null;
        const p1 = anchorAbsPos(from, conn.fromAnchor);
        const p2 = anchorAbsPos(to, conn.toAnchor);
        const { color, strokeWidth } = conn.props;
        const sel = selectedId === conn.id;
        const as = 9;
        const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const a1x = p2.x - as*Math.cos(ang-Math.PI/7), a1y = p2.y - as*Math.sin(ang-Math.PI/7);
        const a2x = p2.x - as*Math.cos(ang+Math.PI/7), a2y = p2.y - as*Math.sin(ang+Math.PI/7);
        const b1x = p1.x + as*Math.cos(ang-Math.PI/7), b1y = p1.y + as*Math.sin(ang-Math.PI/7);
        const b2x = p1.x + as*Math.cos(ang+Math.PI/7), b2y = p1.y + as*Math.sin(ang+Math.PI/7);
        return (
          <g key={conn.id} style={{ pointerEvents: 'stroke', cursor: 'pointer' }} onClick={() => onSelect(conn.id)}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth={14} />
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={sel ? '#6366f1' : color} strokeWidth={strokeWidth}
              strokeDasharray={conn.type === 'dotted' ? '6 5' : undefined} strokeLinecap="round" />
            {(conn.type === 'arrow-one' || conn.type === 'arrow-both') && (
              <polyline points={`${a1x},${a1y} ${p2.x},${p2.y} ${a2x},${a2y}`}
                stroke={sel ? '#6366f1' : color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            )}
            {conn.type === 'arrow-both' && (
              <polyline points={`${b1x},${b1y} ${p1.x},${p1.y} ${b2x},${b2y}`}
                stroke={sel ? '#6366f1' : color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Placed element (draggable) ─────────────────────────────────────────────────
function PlacedElement({ el, isSelected, isConnectorMode, onSelect, onMove, pendingFrom, onAnchorClick, showAnchors, onSignalTouch, anchorClickedRef }) {
  const didDrag = useRef(false);
  const divRef = useRef(null);
  const touchDrag = useRef(null);

  // Register touch listeners as native+non-passive on the element div
  // This ensures they fire in the same event pass as the canvas native listeners
  // and onSignalTouch is called BEFORE the canvas touchstart handler checks the flag
  useEffect(() => {
    const div = divRef.current;
    if (!div) return;

    const onTouchStart = (e) => {
      // Set flag FIRST — canvas native listener bubbles up after this
      if (onSignalTouch) onSignalTouch();
      if (isConnectorMode || e.touches.length !== 1) return;
      const t = e.touches[0];
      touchDrag.current = { tx: t.clientX, ty: t.clientY, ox: el.x, oy: el.y, moved: false };
    };

    const onTouchMove = (e) => {
      if (!touchDrag.current || e.touches.length !== 1) return;
      e.stopPropagation();
      const t = e.touches[0];
      const dx = t.clientX - touchDrag.current.tx;
      const dy = t.clientY - touchDrag.current.ty;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        touchDrag.current.moved = true;
        onMove(el.id, touchDrag.current.ox + dx, touchDrag.current.oy + dy);
      }
    };

    const onTouchEnd = (e) => {
      if (!touchDrag.current) return;
      if (!touchDrag.current.moved) onSelect(el.id);
      touchDrag.current = null;
    };

    div.addEventListener('touchstart', onTouchStart, { passive: true });
    div.addEventListener('touchmove',  onTouchMove,  { passive: true });
    div.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      div.removeEventListener('touchstart', onTouchStart);
      div.removeEventListener('touchmove',  onTouchMove);
      div.removeEventListener('touchend',   onTouchEnd);
    };
  // Re-register when these change so closures stay fresh
  }, [isConnectorMode, onSignalTouch, onSelect, onMove, el.id, el.x, el.y]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    didDrag.current = false;
    if (isConnectorMode) { onSelect(el.id); return; }

    const startMx = e.clientX, startMy = e.clientY;
    const startOx = el.x, startOy = el.y;

    const onMouseMove = (me) => {
      if (Math.abs(me.clientX - startMx) > 3 || Math.abs(me.clientY - startMy) > 3) {
        didDrag.current = true;
        onMove(el.id, startOx + me.clientX - startMx, startOy + me.clientY - startMy);
      }
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (!didDrag.current) onSelect(el.id);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      ref={divRef}
      onMouseDown={handleMouseDown}
      style={{ position: 'absolute', left: el.x, top: el.y, cursor: isConnectorMode ? 'default' : 'move', userSelect: 'none', touchAction: 'none' }}
    >
      {renderElement(el, isSelected)}
      {showAnchors && <AnchorDots el={el} onAnchorClick={onAnchorClick} pendingFrom={pendingFrom} anchorClickedRef={anchorClickedRef} />}
    </div>
  );
}

// ── Pen preview overlay ────────────────────────────────────────────────────────
function PenPreviewOverlay({ penDrawing, penPoints, isPenMode, zoomRef, panRef }) {
  const overlayRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isPenMode) return;
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (penDrawing.current && penPoints.current.length > 1) {
        const zoom = zoomRef.current;
        const pan  = panRef.current;
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const pts = penPoints.current;
        ctx.moveTo(pts[0].x * zoom + pan.x, pts[0].y * zoom + pan.y);
        pts.forEach(p => ctx.lineTo(p.x * zoom + pan.x, p.y * zoom + pan.y));
        ctx.stroke();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPenMode]);  // only zoom/pan refs used — no re-subscribe needed

  if (!isPenMode) return null;
  return (
    <canvas ref={overlayRef}
      width={typeof window !== 'undefined' ? window.innerWidth * 2 : 800}
      height={typeof window !== 'undefined' ? window.innerHeight * 2 : 600}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }}
    />
  );
}

// ── Canvas ─────────────────────────────────────────────────────────────────────
const Canvas = ({ elements, selectedId, selectedTool, onPlace, onSelect, onMove, onConnectorComplete, onPenStroke, readOnly }) => {
  const outerRef = useRef(null);
  const canvasRef = useRef(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [zoom, setZoom] = useState(isMobile ? 0.5 : 1);
  const [pan, setPan]   = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [pendingFrom, setPendingFrom] = useState(null);

  // Refs that mirror zoom/pan for use inside rAF callbacks (avoid stale closures)
  const zoomRef = useRef(zoom);
  const panRef  = useRef(pan);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current  = pan;  }, [pan]);

  // Pen drawing state
  const penDrawing = useRef(false);
  const penPoints  = useRef([]);

  // Pan state (ref-based so mouse/touch handlers don't go stale)
  const isPanningRef = useRef(false);
  const panStartRef  = useRef(null);  // { mx, my, px, py }
  const anchorClickedRef = useRef(false); // set by anchor dot before canvas mousedown fires
  const spaceDown    = useRef(false);

  const isConnectorMode = CONNECTOR_TYPES.has(selectedTool);
  const isPenMode       = selectedTool === 'pen';
  const containers = elements.filter(el => CONTAINER_TYPES.has(el.type));
  const connectors = elements.filter(el => CONNECTOR_TYPES.has(el.type));
  const pens       = elements.filter(el => el.type === 'pen');

  // Convert screen coords → canvas coords
  const toCanvasPos = useCallback((clientX, clientY) => {
    const rect = outerRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - panRef.current.x) / zoomRef.current,
      y: (clientY - rect.top  - panRef.current.y) / zoomRef.current,
    };
  }, []);

  const startPan = useCallback((mx, my) => {
    isPanningRef.current = true;
    setIsPanning(true);
    panStartRef.current = { mx, my, px: panRef.current.x, py: panRef.current.y };
  }, []);

  const stopPan = useCallback(() => {
    isPanningRef.current = false;
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  const applyPan = useCallback((clientX, clientY) => {
    if (!panStartRef.current) return;
    setPan({
      x: panStartRef.current.px + clientX - panStartRef.current.mx,
      y: panStartRef.current.py + clientY - panStartRef.current.my,
    });
  }, []);

  // ── Keyboard space = pan mode ──
  useEffect(() => {
    const down = (e) => { if (e.code === 'Space') { e.preventDefault(); spaceDown.current = true; } };
    const up   = (e) => { if (e.code === 'Space') { spaceDown.current = false; } };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // ── Wheel zoom ──
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = outerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = -e.deltaY * 0.001;
    setZoom(z => {
      const next = clamp(z * (1 + delta), MIN_ZOOM, MAX_ZOOM);
      setPan(p => ({
        x: mx - (mx - p.x) * (next / z),
        y: my - (my - p.y) * (next / z),
      }));
      return next;
    });
  }, []);

  // ── Touch handlers ──
  // All stored in refs so the non-passive addEventListener doesn't go stale
  const lastTouchDist   = useRef(null);
  const lastTouchMid    = useRef(null);
  const touchPanRef     = useRef(null); // { tx, ty, px, py } for single-finger pan
  const touchOnElement  = useRef(false); // set by PlacedElement before canvas native listener fires

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      // Two-finger: prepare for pinch + pan; cancel any single-finger pan
      touchPanRef.current = null;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
      lastTouchMid.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1) {
      if (touchOnElement.current) {
        // Touch started on an element — don't pan
        touchOnElement.current = false;
        touchPanRef.current = null;
        return;
      }
      touchPanRef.current = {
        tx: e.touches[0].clientX,
        ty: e.touches[0].clientY,
        px: panRef.current.x,
        py: panRef.current.y,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const mid = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      const rect = outerRef.current.getBoundingClientRect();
      const mx = mid.x - rect.left;
      const my = mid.y - rect.top;

      if (lastTouchDist.current) {
        const scale = dist / lastTouchDist.current;
        setZoom(z => {
          const next = clamp(z * scale, MIN_ZOOM, MAX_ZOOM);
          setPan(p => ({
            x: mx - (mx - p.x) * (next / z),
            y: my - (my - p.y) * (next / z),
          }));
          return next;
        });
      }
      if (lastTouchMid.current) {
        setPan(p => ({
          x: p.x + mid.x - lastTouchMid.current.x,
          y: p.y + mid.y - lastTouchMid.current.y,
        }));
      }
      lastTouchDist.current = dist;
      lastTouchMid.current = mid;

    } else if (e.touches.length === 1 && touchPanRef.current) {
      e.preventDefault();
      const tp = touchPanRef.current;
      setPan({
        x: tp.px + e.touches[0].clientX - tp.tx,
        y: tp.py + e.touches[0].clientY - tp.ty,
      });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
    lastTouchMid.current  = null;
    touchPanRef.current   = null;
  }, []);

  // Register wheel + touch non-passively (must be after handler definitions)
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    el.addEventListener('wheel',      handleWheel,      { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove',  handleTouchMove,  { passive: false });
    el.addEventListener('touchend',   handleTouchEnd,   { passive: false });
    return () => {
      el.removeEventListener('wheel',      handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove',  handleTouchMove);
      el.removeEventListener('touchend',   handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // ── Connector anchor click ──
  const handleAnchorClick = useCallback((elId, anchorId) => {
    if (!pendingFrom) {
      setPendingFrom({ elId, anchorId });
    } else {
      if (pendingFrom.elId === elId && pendingFrom.anchorId === anchorId) { setPendingFrom(null); return; }
      onConnectorComplete(selectedTool, pendingFrom.elId, pendingFrom.anchorId, elId, anchorId);
      setPendingFrom(null);
    }
  }, [pendingFrom, selectedTool, onConnectorComplete]);

  // ── Mouse handlers ──
  const handleMouseDown = useCallback((e) => {
    // If an anchor dot was just clicked, don't pan or deselect — let handleAnchorClick handle it
    if (anchorClickedRef.current) {
      anchorClickedRef.current = false;
      return;
    }

    if (e.button === 1 || (e.button === 0 && spaceDown.current)) {
      startPan(e.clientX, e.clientY);
      e.preventDefault();
      return;
    }
    if (e.button !== 0) return;

    if (!readOnly && isPenMode) {
      penDrawing.current = true;
      penPoints.current = [toCanvasPos(e.clientX, e.clientY)];
      return;
    }

    // Click on empty canvas: pan + deselect
    if (!isPenMode) startPan(e.clientX, e.clientY);
    onSelect(null);
    if (pendingFrom) setPendingFrom(null);
  }, [isPenMode, readOnly, startPan, toCanvasPos, onSelect, pendingFrom]);

  const handleMouseMove = useCallback((e) => {
    if (isPanningRef.current) { applyPan(e.clientX, e.clientY); return; }
    if (penDrawing.current) penPoints.current = [...penPoints.current, toCanvasPos(e.clientX, e.clientY)];
  }, [applyPan, toCanvasPos]);

  const handleMouseUp = useCallback((e) => {
    if (isPanningRef.current) { stopPan(); return; }
    if (penDrawing.current) {
      penDrawing.current = false;
      if (penPoints.current.length > 1) onPenStroke(penPoints.current);
      penPoints.current = [];
    }
  }, [stopPan, onPenStroke]);

  // Click = place element (only fires if not dragging)
  const handleClick = useCallback((e) => {
    if (readOnly || isConnectorMode || isPenMode) return;
    if (!selectedTool) return;
    if (e.target !== outerRef.current && e.target !== canvasRef.current) return;
    onPlace(selectedTool, ...Object.values(toCanvasPos(e.clientX, e.clientY)));
  }, [selectedTool, isConnectorMode, isPenMode, onPlace, readOnly, toCanvasPos]);

  const cursor = isPanning || spaceDown.current
    ? 'grabbing'
    : !isPenMode && !selectedTool && !isConnectorMode ? 'grab'
    : isPenMode || (selectedTool && !isConnectorMode) ? 'crosshair'
    : 'default';

  return (
    <div
      ref={outerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onContextMenu={e => e.preventDefault()}
      style={{
        position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
        cursor,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,${0.18 * Math.min(zoom, 1)}) 1px, transparent 1px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        userSelect: 'none', touchAction: 'none',
      }}
    >
      {/* Zoom controls */}
      <div style={{ position: 'absolute', bottom: 24, right: 16, zIndex: 50, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setZoom(z => clamp(z / 1.25, MIN_ZOOM, MAX_ZOOM))}
          style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          style={{ color: '#9ca3af', fontSize: 12, cursor: 'pointer', minWidth: 44, textAlign: 'center', padding: '4px 0' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={() => setZoom(z => clamp(z * 1.25, MIN_ZOOM, MAX_ZOOM))}
          style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>

      {/* Transformed canvas surface */}
      <div
        ref={canvasRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: 0, height: 0,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <ConnectorLayer connectors={connectors} elements={containers} selectedId={selectedId} onSelect={onSelect} />

        {containers.map(el => (
          <PlacedElement key={el.id} el={el}
            isSelected={selectedId === el.id}
            isConnectorMode={isConnectorMode}
            showAnchors={isConnectorMode}
            pendingFrom={pendingFrom}
            onSelect={onSelect}
            onMove={readOnly ? () => {} : onMove}
            onAnchorClick={handleAnchorClick}
            anchorClickedRef={anchorClickedRef}
            onSignalTouch={() => { touchOnElement.current = true; }}
          />
        ))}

        {pens.map(el => (
          <PlacedElement key={el.id} el={el}
            isSelected={selectedId === el.id}
            isConnectorMode={false} showAnchors={false}
            onSelect={onSelect}
            onMove={readOnly ? () => {} : onMove}
            onAnchorClick={() => {}}
            onSignalTouch={() => { touchOnElement.current = true; }}
          />
        ))}
      </div>

      <PenPreviewOverlay
        penDrawing={penDrawing} penPoints={penPoints}
        isPenMode={isPenMode} zoomRef={zoomRef} panRef={panRef}
      />
    </div>
  );
};

export default Canvas;