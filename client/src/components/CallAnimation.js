import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import heartAnimationData from '../assets/animations/heart-animation.json';
import crownAnimationData from '../assets/animations/crown-animation.json';
import './CallAnimation.css';

const CallAnimation = ({ isVisible, onComplete, animationType = 'points', isSequence = false, targetReached = false }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(animationType);
  const [showingSecondAnimation, setShowingSecondAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsActive(true);
      setCurrentAnimation(animationType);
      setShowingSecondAnimation(false);
      
      // Determine animation duration based on type
      let duration = animationType === 'crown' ? 3000 : 2000; // Crown is 3 seconds, others 2 seconds
      
      // If this is a sequence (heart + crown), handle the sequence
      if (isSequence && targetReached && animationType === 'heart') {
        // First play heart animation (2 seconds)
        const heartTimer = setTimeout(() => {
          setCurrentAnimation('crown');
          setShowingSecondAnimation(true);
          
          // Then play crown animation (3 seconds) 
          const crownTimer = setTimeout(() => {
            setIsActive(false);
            if (onComplete) {
              onComplete();
            }
          }, 3000);
          
          return () => clearTimeout(crownTimer);
        }, 2000);
        
        return () => clearTimeout(heartTimer);
      } else {
        // Single animation
        const timer = setTimeout(() => {
          setIsActive(false);
          if (onComplete) {
            onComplete();
          }
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, onComplete, animationType, isSequence, targetReached]);

  if (!isActive) return null;

  const renderAnimation = () => {
    switch (currentAnimation) {
      case 'points':
        return (
          <div className="call-animation points-animation">
            <div className="points-popup">
              <span className="points-text">+1</span>
              <span className="points-icon">⭐</span>
            </div>
          </div>
        );
      
      case 'confetti':
        return (
          <div className="call-animation confetti-animation">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className={`confetti confetti-${i}`}>🎉</div>
            ))}
            <div className="success-message">Arama Kaydedildi!</div>
          </div>
        );
      
      case 'celebration':
        return (
          <div className="call-animation celebration-animation">
            <div className="celebration-content">
              <div className="star-burst">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className={`star star-${i}`}>⭐</div>
                ))}
              </div>
              <div className="success-text">
                <div className="main-text">Başarılı!</div>
                <div className="sub-text">+1 Puan Kazandınız</div>
              </div>
            </div>
          </div>
        );
      
      case 'simple':
        return (
          <div className="call-animation simple-animation">
            <div className="checkmark">✓</div>
            <div className="simple-text">Kaydedildi</div>
          </div>
        );
      
      case 'heart':
        return (
          <div className="call-animation heart-animation">
            <div className="heart-lottie-container">
              <Lottie 
                animationData={heartAnimationData}
                loop={false}
                autoplay={true}
                style={{ width: 300, height: 300 }}
              />
            </div>
            <div className="heart-text">
              <div className="heart-main-text">💝 Arama Kaydedildi!</div>
              <div className="heart-sub-text">+1 Puan</div>
            </div>
          </div>
        );
      
      case 'crown':
        return (
          <div className="call-animation crown-animation">
            <div className="crown-lottie-container">
              <Lottie 
                animationData={crownAnimationData}
                loop={false}
                autoplay={true}
                style={{ width: 400, height: 400 }}
              />
            </div>
            <div className="crown-text">
              <div className="crown-main-text">👑 HEDEF TAMAMLANDI!</div>
              <div className="crown-sub-text">Günlük Hedefinize Ulaştınız!</div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="call-animation-overlay">
      {renderAnimation()}
    </div>
  );
};

export default CallAnimation; 