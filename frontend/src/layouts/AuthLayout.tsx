import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-backgroundDark text-white px-4">
      <div className="w-full max-w-md bg-white/5 p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-white/10">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
