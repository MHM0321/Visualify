import React, { useRef, useCallback, useState } from 'react';
import { CONNECTOR_TYPES, CONTAINER_TYPES } from '../hooks/useCanvas';

// ── Anchor helpers ─────────────────────────────────────────────────────────────

function getAnchors(el) {
  const { width, height } = el.props;
  if (el.type === 'ellipse') {
    return [
      { id: 'top',    x: width / 2, y: 0 },
      { id: 'right',  x: width,     y: height / 2 },
      { id: 'bottom', x: width / 2, y: height },
      { id: 'left',   x: 0,         y: height / 2 },
    ];
  }
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
    case 'textbox':         return <TextBoxEl el={el} isSelected={isSelected} />;
    case 'imagebox':        return <ImageBoxEl el={el} isSelected={isSelected} />;
    case 'pen':             return <PenEl el={el} isSelected={isSelected} />;
    default:                return null;
  }
}

// ── Anchor dots ────────────────────────────────────────────────────────────────

function AnchorDots({ el, onAnchorClick, pendingFrom }) {
  return (
    <>
      {getAnchors(el).map(a => {
        const isPending = pendingFrom?.elId === el.id && pendingFrom?.anchorId === a.id;
        return (
          <div key={a.id}
            onMouseDown={e => { e.stopPropagation(); onAnchorClick(el.id, a.id); }}
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
        const a1x = p2.x - as * Math.cos(ang - Math.PI/7), a1y = p2.y - as * Math.sin(ang - Math.PI/7);
        const a2x = p2.x - as * Math.cos(ang + Math.PI/7), a2y = p2.y - as * Math.sin(ang + Math.PI/7);
        const b1x = p1.x + as * Math.cos(ang - Math.PI/7), b1y = p1.y + as * Math.sin(ang - Math.PI/7);
        const b2x = p1.x + as * Math.cos(ang + Math.PI/7), b2y = p1.y + as * Math.sin(ang + Math.PI/7);
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

// ── Draggable placed element ───────────────────────────────────────────────────

function PlacedElement({ el, isSelected, isConnectorMode, onSelect, onMove, pendingFrom, onAnchorClick, showAnchors }) {
  const didDrag = useRef(false);

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
    <div onMouseDown={handleMouseDown}
      style={{ position: 'absolute', left: el.x, top: el.y, cursor: isConnectorMode ? 'default' : 'move', userSelect: 'none' }}>
      {renderElement(el, isSelected)}
      {showAnchors && <AnchorDots el={el} onAnchorClick={onAnchorClick} pendingFrom={pendingFrom} />}
    </div>
  );
}

// ── Canvas ─────────────────────────────────────────────────────────────────────

const Canvas = ({ elements, selectedId, selectedTool, onPlace, onSelect, onMove, onConnectorComplete, onPenStroke, readOnly }) => {
  const canvasRef = useRef(null);
  const [pendingFrom, setPendingFrom] = useState(null);
  // pen drawing state
  const penDrawing = useRef(false);
  const penPoints = useRef([]);

  const isConnectorMode = CONNECTOR_TYPES.has(selectedTool);
  const isPenMode = selectedTool === 'pen';
  const containers = elements.filter(el => CONTAINER_TYPES.has(el.type));
  const connectors = elements.filter(el => CONNECTOR_TYPES.has(el.type));
  const pens = elements.filter(el => el.type === 'pen');

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleAnchorClick = useCallback((elId, anchorId) => {
    if (!pendingFrom) {
      setPendingFrom({ elId, anchorId });
    } else {
      if (pendingFrom.elId === elId && pendingFrom.anchorId === anchorId) { setPendingFrom(null); return; }
      onConnectorComplete(selectedTool, pendingFrom.elId, pendingFrom.anchorId, elId, anchorId);
      setPendingFrom(null);
    }
  }, [pendingFrom, selectedTool, onConnectorComplete]);

  // ── Pen mouse events ──
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    if (readOnly) return;

    if (isPenMode) {
      const pos = getCanvasPos(e);
      penDrawing.current = true;
      penPoints.current = [pos];
      return;
    }

    if (e.target === canvasRef.current) {
      onSelect(null);
      if (pendingFrom) setPendingFrom(null);
    }
  }, [isPenMode, onSelect, pendingFrom, readOnly]);

  const handleMouseMove = useCallback((e) => {
    if (!penDrawing.current) return;
    const pos = getCanvasPos(e);
    penPoints.current = [...penPoints.current, pos];
    // Force re-render for live preview — we'll use a state trick
    // Actually we use an overlayCanvas for live preview
  }, []);

  const handleMouseUp = useCallback((e) => {
    if (!penDrawing.current) return;
    penDrawing.current = false;
    if (penPoints.current.length > 1) {
      onPenStroke(penPoints.current);
    }
    penPoints.current = [];
  }, [onPenStroke]);

  const handleClick = useCallback((e) => {
    if (readOnly) return;
    if (isConnectorMode || isPenMode) return;
    if (!selectedTool) return;
    if (e.target !== canvasRef.current) return;
    const pos = getCanvasPos(e);
    onPlace(selectedTool, pos.x, pos.y);
  }, [selectedTool, isConnectorMode, isPenMode, onPlace, readOnly]);

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onContextMenu={e => e.preventDefault()}
      style={{
        position: 'relative', width: '100%', height: '100%',
        cursor: isPenMode ? 'crosshair' : (selectedTool && !isConnectorMode ? 'crosshair' : 'default'),
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <ConnectorLayer connectors={connectors} elements={containers} selectedId={selectedId} onSelect={onSelect} />

      {containers.map(el => (
        <PlacedElement key={el.id} el={el}
          isSelected={selectedId === el.id}
          isConnectorMode={isConnectorMode}
          showAnchors={isConnectorMode}
          pendingFrom={pendingFrom}
          onSelect={onSelect} onMove={readOnly ? () => {} : onMove}
          onAnchorClick={handleAnchorClick}
        />
      ))}

      {pens.map(el => (
        <PlacedElement key={el.id} el={el}
          isSelected={selectedId === el.id}
          isConnectorMode={false} showAnchors={false}
          onSelect={onSelect} onMove={readOnly ? () => {} : onMove}
          onAnchorClick={() => {}}
        />
      ))}

      {/* Live pen preview overlay */}
      <PenPreviewOverlay penDrawing={penDrawing} penPoints={penPoints} isPenMode={isPenMode} />
    </div>
  );
};

// Live pen preview using a canvas element
function PenPreviewOverlay({ penDrawing, penPoints, isPenMode }) {
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
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(penPoints.current[0].x, penPoints.current[0].y);
        penPoints.current.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPenMode]);

  if (!isPenMode) return null;
  return (
    <canvas ref={overlayRef} width={window.innerWidth} height={window.innerHeight}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }} />
  );
}

import { useEffect } from 'react';
export default Canvas;