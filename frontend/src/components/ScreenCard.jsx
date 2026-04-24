const ScreenCard = ({ screen, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-xl overflow-hidden border-2 transition-all duration-200
        ${isSelected
          ? 'border-pm shadow-[0_0_12px_rgba(0,0,0,0.4)]'
          : 'border-sc hover:border-gray-500'
        }
      `}
    >
      {/* Thumbnail preview area */}
      <div className={`w-full h-20 transition-colors duration-200 ${isSelected ? 'bg-pm opacity-20' : 'bg-sc'}`} />

      {/* Label */}
      <div className={`px-3 py-2 transition-colors duration-200 ${isSelected ? 'bg-pm bg-opacity-10' : 'bg-bc'}`}>
        <p className={`text-sm font-medium truncate transition-colors duration-200 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
          {screen.name}
        </p>
      </div>
    </button>
  );
};

export default ScreenCard;