import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { clearAuthSession, fetchCurrentUser, getStoredToken } from "../lib/api";

function ProtectedRoute({ children }: { children: ReactElement }) {
  const token = getStoredToken();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setIsValid(false);
      setIsChecking(false);
      return;
    }

    const validateSession = async () => {
      try {
        await fetchCurrentUser();
        setIsValid(true);
      } catch (error) {
        clearAuthSession();
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    void validateSession();
  }, [token]);

  if (isChecking) {
    return <div className="page-state">Validating session...</div>;
  }

  if (!token || !isValid) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
