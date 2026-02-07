import { Link } from 'wouter';
import { Instagram } from 'lucide-react';

// Simplified footer without visitor counter
const Footer = () => {

  return (
    <footer className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-6 animate-gradient-x">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold font-heading">ProAce Predictions</h3>
            <p className="text-neutral-300 text-sm">Cricket match predictions platform</p>
          </div>

          <div className="flex space-x-8 mb-4 md:mb-0">
            <Link href="/" className="text-white/80 hover:text-yellow-300 text-sm font-medium">
              Home
            </Link>
            <Link href="/#leaderboard" className="text-white/80 hover:text-yellow-300 text-sm font-medium">
              Leaderboard
            </Link>
            <Link href="/profile" className="text-white/80 hover:text-yellow-300 text-sm font-medium">
              My Profile
            </Link>
            <Link href="/help" className="text-white/80 hover:text-yellow-300 text-sm font-medium">
              Help
            </Link>
            <a href="https://www.pro-ace-predictions.co.uk/contact/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-yellow-300 text-sm font-medium">
              Contact Us
            </a>
            <a href="https://www.pro-ace-predictions.co.uk/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-yellow-300 text-sm font-medium">
              Privacy Policy
            </a>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/proacepredictions/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-yellow-300">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-4 pt-4">
          <div className="text-center space-y-3">
            <p className="text-white/80 text-sm font-medium">
              Copyright @ 2025 || Pro-Ace-Predictions - Expertbox || Community Forum
            </p>
            <div className="text-white/70 text-xs leading-relaxed max-w-4xl mx-auto">
              <p className="mb-2">
                <strong>Disclaimer:</strong> Pro-Ace-Predictions is not a bookie neither have any ownership with any. 
                Pro-Ace-Predictions does not support any gambling whatsoever. The content of this site is not intended 
                to be a lure to gambling. Instead, the information we present is meant for nothing more than informational 
                and entertainment purposes. Our users provide free sports predictions according to their experience as 
                well as their opinion about any sports based on analytics, research done online.
              </p>
              <p>Server and registrant registered in North America & Europe</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;