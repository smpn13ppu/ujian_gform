import { useState, useEffect, useCallback } from 'react';
import {
  getActiveToken,
  getSecondsRemainingInBlock,
  formatTimeRemaining,
  validateSubmittedToken,
  incrementManualSalt,
} from '../lib/tokenEngine';

export function useDynamicToken(secretKey) {
  const [activeToken, setActiveToken] = useState(() => getActiveToken(secretKey));
  const [secondsRemaining, setSecondsRemaining] = useState(() => getSecondsRemainingInBlock());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getSecondsRemainingInBlock();
      setSecondsRemaining(remaining);
      setActiveToken(getActiveToken(secretKey));
    }, 1000);

    return () => clearInterval(timer);
  }, [secretKey]);

  const manualRefresh = useCallback(() => {
    incrementManualSalt();
    setActiveToken(getActiveToken(secretKey));
  }, [secretKey]);

  const validateToken = useCallback(
    (inputToken) => validateSubmittedToken(inputToken, secretKey),
    [secretKey]
  );

  return {
    activeToken,
    secondsRemaining,
    formattedTime: formatTimeRemaining(secondsRemaining),
    validateToken,
    manualRefresh,
  };
}
