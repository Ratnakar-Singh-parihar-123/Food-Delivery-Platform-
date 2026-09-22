export default function PhoneMockup({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto w-[280px] md:w-[320px] h-[560px] md:h-[640px] bg-black rounded-[3rem] shadow-2xl">
        <div className="absolute top-0 z-10 w-1/3 -translate-x-1/2 bg-black left-1/2 h-7 rounded-b-2xl"></div>
        <div className="absolute inset-[5px] rounded-[2.8rem] bg-white overflow-hidden">
          <div className="w-full h-full p-4 overflow-y-auto bg-gray-50">
            {children || (
              <div className="flex items-center justify-center h-full text-gray-400">
                App Screen
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
