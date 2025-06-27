import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import peekAnimationData from '../assets/animations/Peek_Animation.json';
import { useAnimation } from '../context/AnimationContext';
import './PeekAnimation.css';

const PeekAnimation = () => {
  const { animationSettings } = useAnimation();
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [horizontalPosition, setHorizontalPosition] = useState(20);

  // Function to get random delay between 10 seconds (10000ms) and 2 minutes (120000ms)
  const getRandomDelay = () => {
    const minDelay = 10000; // 10 seconds
    const maxDelay = 120000; // 2 minutes
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  };

  // Function to get random horizontal position
  const getRandomHorizontalPosition = () => {
    const windowWidth = window.innerWidth;
    let animationWidth = 80; // Base width of the animation
    let margin = 20; // Base minimum margin from edges
    
    // Adjust for responsive scaling
    if (windowWidth <= 480) {
      animationWidth = animationWidth * 0.7; // 70% scale on mobile
      margin = 10;
    } else if (windowWidth <= 768) {
      animationWidth = animationWidth * 0.8; // 80% scale on tablet
      margin = 15;
    }
    
    // Calculate available space for random positioning
    const availableWidth = windowWidth - animationWidth - (margin * 2);
    
    if (availableWidth <= 0) {
      return margin; // If screen is too small, use minimum margin
    }
    
    // Generate random position between left margin and available width
    const randomPosition = Math.floor(Math.random() * availableWidth) + margin;
    return randomPosition;
  };

  // Function to show the animation
  const showAnimation = () => {
    // Set random horizontal position before showing
    const newPosition = getRandomHorizontalPosition();
    setHorizontalPosition(newPosition);
    console.log(`🎭 Peek animation appearing at ${newPosition}px from left`);
    
    setIsVisible(true);
    
    // Hide animation after it completes (animation is about 1.33 seconds based on 80 frames at 60fps)
    setTimeout(() => {
      setIsVisible(false);
      scheduleNextAnimation();
    }, 2000); // Show for 2 seconds to ensure animation completes
  };

  // Function to schedule the next animation
  const scheduleNextAnimation = () => {
    // Don't schedule if animation is disabled
    if (!animationSettings.peekAnimationEnabled) {
      console.log('🎭 Peek animation is disabled, not scheduling next animation');
      return;
    }
    
    const delay = getRandomDelay();
    console.log(`🎭 Next peek animation scheduled in ${(delay / 1000).toFixed(1)} seconds`);
    
    const newTimeoutId = setTimeout(showAnimation, delay);
    setTimeoutId(newTimeoutId);
  };

  // Test function to manually trigger peek animation
  const testPeekAnimation = () => {
    console.log('🎬 Manually triggering peek animation test');
    
    // Clear any existing timeout to avoid conflicts
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Show animation immediately
    showAnimation();
  };

  // Expose test function globally for AppBar access
  useEffect(() => {
    window.testPeekAnimation = testPeekAnimation;
    return () => {
      delete window.testPeekAnimation;
    };
  }, []);

  // Initialize the first animation schedule
  useEffect(() => {
    if (animationSettings.peekAnimationEnabled) {
      scheduleNextAnimation();
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [animationSettings.peekAnimationEnabled]);

  // Clear timeout when animation is disabled
  useEffect(() => {
    if (!animationSettings.peekAnimationEnabled && timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
      setIsVisible(false);
      console.log('🎭 Peek animation disabled, clearing timeouts');
    }
  }, [animationSettings.peekAnimationEnabled, timeoutId]);

  // Cleanup timeout when component updates
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Don't render if animation is disabled or not visible
  if (!animationSettings.peekAnimationEnabled || !isVisible) {
    return null;
  }

  return (
    <div 
      className="peek-animation-container"
      style={{ left: `${horizontalPosition}px` }}
    >
      <div className="peek-animation">
        <Lottie
          animationData={peekAnimationData}
          loop={false}
          autoplay={true}
          style={{
            width: 80,
            height: 80,
          }}
        />
      </div>
    </div>
  );
};

export default PeekAnimation;   