/**
 * TikTok SVG Icon Component
 * Precise SVG rendering of TikTok logo
 */
const TikTokIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* TikTok logo - precise path */}
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.67a2.4 2.4 0 1 1-4.77-2.3A2.4 2.4 0 0 1 9.1 13.66V9.58a6.05 6.05 0 0 0-6 6.05 6.05 6.05 0 0 0 6.05 6.05 6.05 6.05 0 0 0 6.05-6.05q-.5.038-1-.12V6.69z" />
    </svg>
  );
};

export default TikTokIcon;

