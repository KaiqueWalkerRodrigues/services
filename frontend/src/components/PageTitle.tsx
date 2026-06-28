import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PageTitle({ title, children }) {
  const location = useLocation();

  useEffect(() => {
    document.title = title;
  }, [title, location]);

  return children;
}
