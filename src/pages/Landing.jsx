import { useEffect } from "react";
import { setCookies } from "../axios/function";

const Landing = () => {
  useEffect(() => {
    setCookies();
  }, []);
  return (
    <div>
      <h1>Welcome to the Landing Page</h1>
      <p>This is the main entry point of the application.</p>
      <div className="">showcase of product</div>
    </div>
  );
};
export default Landing;
