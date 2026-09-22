export default function SectionHeading({ title, subtitle, className = "" }) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl text-brand-dark">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}
