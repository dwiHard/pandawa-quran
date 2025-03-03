
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Juz30 page
    navigate("/juz30");
  }, [navigate]);

  return null;
};

export default Index;
