const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <a href="/">
                <img 
                  src="/assetworks-logo-white.png" 
                  alt="AssetWorks AI" 
                  className="h-8 w-auto"
                />
              </a>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              Get smarter using AI investment intelligence powered by collective wisdom.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">COMPANY</h4>
            <ul className="space-y-2 text-xs md:text-sm text-gray-400">
              <li><a href="/about-us" className="hover:text-white">About</a></li>
              {/*<li><a href="#" className="hover:text-white">Careers</a></li>*/}
              <li><a href="/#get-started" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">RESOURCES</h4>
            <ul className="space-y-2 text-xs md:text-sm text-gray-400">
              <li><a href="/faqs" className="hover:text-white">FAQs</a></li>
              {/*<li><a href="#" className="hover:text-white">API</a></li>*/}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">LEGAL</h4>
            <ul className="space-y-2 text-xs md:text-sm text-gray-400">
              <li><a href="/terms-and-conditions" className="hover:text-white">Terms</a></li>
              <li><a href="/privacy-and-policies" className="hover:text-white">Privacy</a></li>
              <li><a href="/disclaimers" className="hover:text-white">Disclaimers</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <p className="text-xs md:text-sm text-gray-400 text-center md:text-left">
            © 2024 AssetWorks AI. All rights reserved.
          </p>
          <p className="text-xs md:text-sm text-gray-400 text-center md:text-right">
            Designed and built by the AssetWorks AI team.
          </p>
        </div>
      </div>
    </footer>
    )
};

export default Footer;


