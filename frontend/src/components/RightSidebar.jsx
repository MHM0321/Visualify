const tools = [
  {
    category: 'Containers',
    items: [
      {
        id: 'rectangle',
        label: 'Rectangle',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="4" y="9" width="28" height="18" rx="1.5" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
      },
      {
        id: 'ellipse',
        label: 'Ellipse',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <ellipse cx="18" cy="18" rx="14" ry="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
      },
      {
        id: 'rect-1partition',
        label: '1 Partition',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="4" y="9" width="28" height="18" rx="1.5" stroke="currentColor" strokeWidth="2"/>
            <line x1="18" y1="9" x2="18" y2="27" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
      },
      {
        id: 'rect-2partition',
        label: '2 Partitions',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="4" y="9" width="28" height="18" rx="1.5" stroke="currentColor" strokeWidth="2"/>
            <line x1="13.3" y1="9" x2="13.3" y2="27" stroke="currentColor" strokeWidth="2"/>
            <line x1="22.7" y1="9" x2="22.7" y2="27" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
      },
      {
        id: 'rect-1row',
        label: '1 Row',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="4" y="9" width="28" height="18" rx="1.5" stroke="currentColor" strokeWidth="2"/>
            <line x1="4" y1="18" x2="32" y2="18" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
      },
      {
        id: 'rect-2rows',
        label: '2 Rows',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="4" y="9" width="28" height="18" rx="1.5" stroke="currentColor" strokeWidth="2"/>
            <line x1="4" y1="15" x2="32" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="4" y1="21" x2="32" y2="21" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
      },
    ],
  },
  {
    category: 'Connectors',
    items: [
      {
        id: 'line',
        label: 'Line',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <line x1="5" y1="18" x2="31" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        id: 'arrow-one',
        label: 'Arrow →',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <line x1="5" y1="18" x2="28" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="21,11 31,18 21,25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        ),
      },
      {
        id: 'arrow-both',
        label: 'Arrow ↔',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <line x1="8" y1="18" x2="28" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="15,11 5,18 15,25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <polyline points="21,11 31,18 21,25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        ),
      },
      {
        id: 'dotted',
        label: 'Dotted',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <line x1="5" y1="18" x2="31" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
          </svg>
        ),
      },
    ],
  },
  {
    category: 'Misc',
    items: [
      {
        id: 'textbox',
        label: 'Text',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="4" y="9" width="28" height="18" rx="1.5" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"/>
            <text x="18" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" fontFamily="serif">T</text>
          </svg>
        ),
      },
      {
        id: 'imagebox',
        label: 'Image',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="4" y="8" width="28" height="20" rx="1.5" stroke="currentColor" strokeWidth="2"/>
            <circle cx="13" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            <polyline points="4,24 11,17 17,22 22,16 32,28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        ),
      },
      {
        id: 'pen',
        label: 'Pen',
        icon: (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M8 28 L12 24 L26 10 C27.1 8.9 28.9 8.9 30 10 C31.1 11.1 31.1 12.9 30 14 L16 28 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
            <line x1="8" y1="28" x2="6" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="23" y1="12" x2="26" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
    ],
  },
];

const RightSidebar = ({ selectedTool, onSelectTool, propertiesSlot }) => {
  return (
    <aside className="w-52 border-l border-sc flex flex-col flex-shrink-0 h-[calc(100vh-57px)] overflow-y-auto">
      <div className="flex flex-col gap-1 p-3">
        {tools.map((group) => (
          <div key={group.category} className="mb-2">
            {/* Category label */}
            <p className="text-gray-600 text-xs uppercase tracking-widest px-1 py-2">
              {group.category}
            </p>

            {/* Tool grid */}
            <div className="grid grid-cols-4 gap-1">
              {group.items.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  title={tool.label}
                  className={`
                    flex flex-col items-center justify-center rounded-lg p-1.5 aspect-square transition-all duration-150
                    ${selectedTool === tool.id
                      ? 'bg-pm text-white'
                      : 'text-gray-500 hover:bg-sc hover:text-white'
                    }
                  `}
                >
                  <div className="w-7 h-7">
                    {tool.icon}
                  </div>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-b border-sc mt-3" />
          </div>
        ))}
      </div>

      {/* Properties Panel - shown below tools when an element is selected */}
      {propertiesSlot && (
        <div className="border-t border-sc mt-1">
          {propertiesSlot}
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;