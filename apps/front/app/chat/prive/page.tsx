import Navbar from '../navbar/page';
export default function PrivePage() {
    return (
        <div className="flex h-screen bg-[#0B1E27] font-sans text-white overflow-hidden">
           
            <Navbar />
      
            <div className="w-60 bg-[#0f2533] flex flex-col">
      
      
      
              <div className="flex-1 overflow-y-auto px-2 py-3">
      
                <div className="mb-4">
                  <div className="flex items-center justify-between px-2 mb-1 text-xs uppercase font-semibold text-gray-400 hover:text-gray-200">
                    <span>Message Privé</span>
                    <span className="text-lg leading-none"></span>
                  </div>
                  {['discussion privée 1', 'discussion privée 2', 'discussion privée 3'].map((channel, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#1a3544] cursor-pointer text-gray-400 hover:text-gray-100 transition-colors group"
                    >
      
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20L3 4m18 16l-4-16M9 4h10M5 20h10" />
                      </svg>
                      <span className="text-sm">{channel}</span>
                    </div>
                  ))}
                </div>
                <div>
                
                </div>
              </div>
              
                
            </div>
      
            <div className="flex-1 flex flex-col bg-[#132b3b]">
      
              <div className="h-12 px-4 flex items-center justify-between border-b border-[#1a2f3a] shadow-sm">
                <div className="flex items-center gap-2">
      
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}  />
                  </svg>
                  <span className="font-semibold">'discussion privée 1'</span>
                </div>
                <div className="flex items-center gap-4">
      
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-gray-400 text-center text-sm">
                  Les messages tomberont ici.
                </div>
              </div>
      
      
              <div className="px-4 pb-6">
                <div className="bg-[#1a3544] rounded-lg px-4 py-3">
                  <input
                    type="text"
                    placeholder="entrer un message dans le canal"
                    className="w-full bg-transparent outline-none text-white placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
      
           
                
            </div>
        );
}