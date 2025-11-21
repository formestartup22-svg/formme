
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-gray-600">
          Oops! We couldn't find the page you're looking for.
        </p>
        <div className="pt-4">
          <Button asChild>
            <a href="/">Return to T-Shirt Designer</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
