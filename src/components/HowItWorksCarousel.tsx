import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

export const HowItWorksCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 2;

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative max-w-6xl mx-auto">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* Step 1 */}
          <div className="w-full flex-shrink-0 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center hover:bg-gray-900/70 transition-all duration-300">
                <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Smart Reading</h3>
                <p className="text-white/70">
                  Reads .docx reports from G3 and other systems automatically
                </p>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center hover:bg-gray-900/70 transition-all duration-300">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,11 12,14 22,4"></polyline>
                    <path d="m21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.73 0 3.34.49 4.71 1.34"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Key Value Extraction</h3>
                <p className="text-white/70">
                  Finds key values (AHI, sleep time, oxygen, arousals…) precisely
                </p>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center hover:bg-gray-900/70 transition-all duration-300">
                <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Professional Summary</h3>
                <p className="text-white/70">
                  Writes a professional summary based on study type
                </p>
              </div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="w-full flex-shrink-0 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center hover:bg-gray-900/70 transition-all duration-300">
                <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m16 3 4 4-4 4"></path>
                    <path d="M20 7H4"></path>
                    <path d="m8 21-4-4 4-4"></path>
                    <path d="M4 17h16"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Review & Edit</h3>
                <p className="text-white/70">
                  Lets users review and edit the final report before saving
                </p>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center hover:bg-gray-900/70 transition-all duration-300">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">PDF Generation</h3>
                <p className="text-white/70">
                  Generates a clean, ready-to-print PDF in seconds
                </p>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center hover:bg-gray-900/70 transition-all duration-300">
                <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Time Savings</h3>
                <p className="text-white/70">
                  Fast, consistent, professional reports with no manual work
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-center items-center mt-8 gap-4">
        <button 
          onClick={prevSlide}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
        
        <button 
          onClick={nextSlide}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};