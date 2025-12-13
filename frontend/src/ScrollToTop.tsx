import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

export const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};
