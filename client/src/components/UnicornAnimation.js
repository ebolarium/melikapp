import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import unicornAnimationData from '../assets/animations/Unicorn_Animation.json';
import './UnicornAnimation.css';

const UnicornAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [verticalPosition, setVerticalPosition] = useState(20);
  const [timeoutId, setTimeoutId] = useState(null);

  // Function to get random delay between 1 minute (60000ms) and 3 minutes (180000ms)
  const getRandomDelay = () => {
    const minDelay = 60000; // 1 minute
    const maxDelay = 180000; // 3 minutes
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  };

  // Function to get random vertical position
  const getRandomVerticalPosition = () => {
    const windowHeight = window.innerHeight;
    const animationHeight = 180; // Height of the unicorn animation
    const margin = 50; // Minimum margin from top and bottom
    
    // Calculate available space for random positioning
    const availableHeight = windowHeight - animationHeight - (margin * 2);
    
    if (availableHeight <= 0) {
      return margin; // If screen is too small, use minimum margin
    }
    
    // Generate random position between top margin and available height
    const randomPosition = Math.floor(Math.random() * availableHeight) + margin;
    return randomPosition;
  };

  // Function to show the animation
  const showAnimation = () => {
    // Set random vertical position before showing
    const newPosition = getRandomVerticalPosition();
    setVerticalPosition(newPosition);
    console.log(`🦄 Unicorn automatically flying at ${newPosition}px from top`);
    
    setIsVisible(true);
    
    // Hide animation after it completes the flight across screen (5 seconds should be enough)
    setTimeout(() => {
      setIsVisible(false);
      scheduleNextAnimation();
    }, 5000);
  };

  // Function to schedule the next animation
  const scheduleNextAnimation = () => {
    const delay = getRandomDelay();
    console.log(`🦄 Next unicorn flight scheduled in ${(delay / 60000).toFixed(1)} minutes`);
    
    const newTimeoutId = setTimeout(showAnimation, delay);
    setTimeoutId(newTimeoutId);
  };

  // Test function to manually trigger unicorn animation
  const testUnicornAnimation = () => {
    console.log('🦄 Manually triggering unicorn animation test');
    
    // Clear any existing timeout to avoid conflicts
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Set random vertical position before showing
    const newPosition = getRandomVerticalPosition();
    setVerticalPosition(newPosition);
    console.log(`🦄 Unicorn flying at ${newPosition}px from top`);
    
    setIsVisible(true);
    
    // Hide animation after it completes the flight across screen (5 seconds should be enough)
    setTimeout(() => {
      setIsVisible(false);
      scheduleNextAnimation(); // Resume automatic scheduling after manual test
    }, 5000);
  };

  // Expose test function globally for AppBar access
  useEffect(() => {
    window.testUnicornAnimation = testUnicornAnimation;
    return () => {
      delete window.testUnicornAnimation;
    };
  }, []);

  // Initialize the first animation schedule
  useEffect(() => {
    scheduleNextAnimation();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Cleanup timeout when component updates
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="unicorn-animation-container"
      style={{ top: `${verticalPosition}px` }}
    >
      <div className="unicorn-animation">
        <Lottie
          animationData={unicornAnimationData}
          loop={true}
          autoplay={true}
          style={{
            width: 180,
            height: 180,
          }}
        />
      </div>
    </div>
  );
};

export default UnicornAnimation; 