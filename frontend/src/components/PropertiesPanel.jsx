import React, { useRef } from 'react';
import { CONNECTOR_TYPES } from '../hooks/useCanvas';

const CONTAINER_TYPES = new Set(['rectangle', 'ellipse', 'rect-1partition', 'rect-2partition', 'rect-1row', 'rect-2rows', 'imagebox']);

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-gray-500 text-xs">{label}</label>
    {children}
  </div>
);

const NumberInput = ({ value, onChange, min, max }) => (
  <input type="number" value={value ?? ''} min={min} max={max}
    onChange={e => onChange(Number(e.target.value))}
    className="bg-bc border border-sc rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-pm w-full" />
);

const ColorInput = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <input type="color"
      value={value === 'transparent' ? '#000000' : (value ?? '#ffffff')}
      onChange={e => onChange(e.target.value)}
      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent flex-shrink-0" />
    <input type="text" value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      className="bg-bc border border-sc rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-pm flex-1 min-w-0" />
  </div>
);

const SelectInput = ({ value, onChange, options }) => (
  <select value={value ?? ''} onChange={e => onChange(e.target.value)}
    className="bg-bc border border-sc rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-pm w-full">
    {options.map(o => (
      <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
    ))}
  </select>
);

const PropertiesPanel = ({ element, onUpdate, onDelete }) => {
  const fileInputRef = useRef(null);
  if (!element) return null;

  const p = element.props;
  const set = (key) => (val) => onUpdate(element.id, { [key]: val });
  const type = element.type;

  const isContainer = CONTAINER_TYPES.has(type);
  const isConnector = CONNECTOR_TYPES.has(type);
  const isText = type === 'textbox';
  const isImage = type === 'imagebox';

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onUpdate(element.id, { imageData: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4 px-3 pt-3 pb-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-300 text-xs uppercase tracking-widest font-semibold">Properties</p>
        <button onClick={() => onDelete(element.id)}
          className="text-gray-600 hover:text-red-400 text-xs transition">
          Delete
        </button>
      </div>

      <div className="border-t border-sc" />

      {/* Container props (non-image) */}
      {isContainer && !isImage && (<>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Width"><NumberInput value={p.width} onChange={set('width')} min={10} /></Field>
          <Field label="Height"><NumberInput value={p.height} onChange={set('height')} min={10} /></Field>
        </div>
        {type !== 'ellipse' && (
          <Field label="Radius"><NumberInput value={p.radius} onChange={set('radius')} min={0} max={200} /></Field>
        )}
        <Field label="Fill"><ColorInput value={p.fill} onChange={set('fill')} /></Field>
        <Field label="Border Color"><ColorInput value={p.borderColor} onChange={set('borderColor')} /></Field>
        <Field label="Border Width"><NumberInput value={p.borderWidth} onChange={set('borderWidth')} min={0} max={20} /></Field>
      </>)}

      {/* Image box props */}
      {isImage && (<>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Width"><NumberInput value={p.width} onChange={set('width')} min={10} /></Field>
          <Field label="Height"><NumberInput value={p.height} onChange={set('height')} min={10} /></Field>
        </div>
        <Field label="Border Color"><ColorInput value={p.borderColor} onChange={set('borderColor')} /></Field>
        <Field label="Border Width"><NumberInput value={p.borderWidth} onChange={set('borderWidth')} min={0} max={20} /></Field>
        <Field label="Fit Mode">
          <SelectInput value={p.objectFit ?? 'contain'} onChange={set('objectFit')} options={[
            { value: 'contain',  label: 'Fit inside box' },
            { value: 'cover',    label: 'Fill & crop' },
            { value: 'fill',     label: 'Stretch to box' },
            { value: 'none',     label: 'Actual size' },
          ]} />
        </Field>
        <Field label="Image">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full bg-sc hover:opacity-80 transition text-white text-sm rounded-lg py-2">
            {p.imageData ? 'Replace image' : 'Upload image'}
          </button>
          {p.imageData && (
            <button onClick={() => onUpdate(element.id, { imageData: null })}
              className="w-full text-gray-600 hover:text-red-400 text-xs transition mt-1">
              Remove image
            </button>
          )}
        </Field>
      </>)}

      {/* Connector props */}
      {isConnector && (<>
        <Field label="Color"><ColorInput value={p.color} onChange={set('color')} /></Field>
        <Field label="Stroke Width"><NumberInput value={p.strokeWidth} onChange={set('strokeWidth')} min={1} max={20} /></Field>
      </>)}

      {/* Text props */}
      {isText && (<>
        <Field label="Text">
          <textarea value={p.text ?? ''} onChange={e => onUpdate(element.id, { text: e.target.value })}
            rows={2} className="bg-bc border border-sc rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-pm w-full resize-none" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Width"><NumberInput value={p.width} onChange={set('width')} min={20} /></Field>
          <Field label="Height"><NumberInput value={p.height} onChange={set('height')} min={16} /></Field>
        </div>
        <Field label="Color"><ColorInput value={p.color} onChange={set('color')} /></Field>
        <Field label="Font Size"><NumberInput value={p.fontSize} onChange={set('fontSize')} min={8} max={120} /></Field>
        <Field label="Font">
          <SelectInput value={p.fontFamily} onChange={set('fontFamily')} options={[
            { value: 'sans-serif', label: 'Sans-serif' },
            { value: 'serif', label: 'Serif' },
            { value: 'monospace', label: 'Monospace' },
            { value: 'Georgia, serif', label: 'Georgia' },
            { value: 'Courier New, monospace', label: 'Courier New' },
          ]} />
        </Field>
        <Field label="Alignment">
          <SelectInput value={p.align} onChange={set('align')} options={['left', 'center', 'right', 'justify']} />
        </Field>
      </>)}
    </div>
  );
};

export default PropertiesPanel;