import { useState } from 'react';

function Banner() {
  const images = [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1493558103817-58b2924bce98',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'
  ];

  const [index, setIndex] = useState(0);

  const prevBanner = () => {
    setIndex((index - 1 + images.length) % images.length);
  };

  const nextBanner = () => {
    setIndex((index + 1) % images.length);
  };

  return (
    <div className="banner-container">
      <div
        className="banner"
        style={{ backgroundImage: `url(${images[index]})` }}
      >
        <p>Welcome to My App</p>
      </div>
      <button className="banner-btn left" onClick={prevBanner}>&lt;</button>
      <button className="banner-btn right" onClick={nextBanner}>&gt;</button>
    </div>
  );
}

export default Banner;
