import NavBar from '../components/ui/NavBar';
import { useNavigate } from 'react-router-dom';
import productImage from '/product-image.png';

const HomePage = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavBar />
      
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Welcome to <span className="text-[#2697e9]">SyncTalk</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              Connect and chat with people in real-time
            </p>

            <button
              onClick={handleGetStarted}
              className="bg-gray-500 hover:bg-sky-600 px-8 py-3 cursor-pointer rounded-full text-lg font-semibold mb-12 transition-colors"
            >
              Get Started →
            </button>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="bg-white/20 p-4 rounded-lg text-center">
                👋 Hey there!
              </div>
              <div className="bg-white/20 p-4 rounded-lg text-center">
                ⚡ Real-time sync
              </div>
              <div 
                className="bg-white/20 hover:bg-white/30 p-4 rounded-lg text-center cursor-pointer transition-colors"
                onClick={handleGetStarted}
              >
                🌐 Get Connected
              </div>
              <div className="bg-white/20 p-4 rounded-lg text-center">
                💬 SyncTalk
              </div>
            </div>
          </div>

          <div className="flex-1">
            <img
              src={productImage}
              alt="SyncTalk App"
              className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl 
             transition-transform duration-300 ease-in-out hover:scale-150"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;