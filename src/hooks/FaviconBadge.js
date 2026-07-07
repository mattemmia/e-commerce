import { useEffect } from "react";

export default function FaviconBadge({ count }) {
  useEffect(() => {
    const updateFavicon = (count) => {
      const canvas = document.createElement('canvas');
      canvas.width = 32; 
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      
      // Load your base favicon
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = '/favicon.ico'; // make sure favicon.ico is in public folder
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 32, 32);
        
        if (count > 0) {
          // Red ping circle with animation effect
          ctx.fillStyle = '#ff3b30'; // iPhone red
          ctx.beginPath();
          ctx.arc(24, 8, 9, 0, 2 * Math.PI); // bigger circle
          ctx.fill();
          
          // White border for the ping
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Number inside
          ctx.fillStyle = 'white';
          ctx.font = 'bold 11px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const text = count > 99? '99+' : count.toString();
          ctx.fillText(text, 24, 8.5);
        }
        
        // Update favicon in tab
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = canvas.toDataURL();
        document.head.appendChild(link);
      }
    };

    // Also do the title ping
    const originalTitle = "E-commerce";
    if (count > 0) {
      document.title = `(${count}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }

    updateFavicon(count);
    
  }, [count]);

  return null; // this component renders nothing
}