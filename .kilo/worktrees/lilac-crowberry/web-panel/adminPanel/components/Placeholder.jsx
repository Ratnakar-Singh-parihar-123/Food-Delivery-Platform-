export default function Placeholder({ title }) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
        <p className="mt-2 text-gray-400">This page is under construction.</p>
      </div>
    </div>
  );
}
