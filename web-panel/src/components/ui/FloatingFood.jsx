export default function FloatingFood({ icon, label, className = "" }) {
  return (
    <div
      className={`absolute bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-2 flex items-center gap-2 border border-gray-100/50 ${className}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </div>
  );
}
