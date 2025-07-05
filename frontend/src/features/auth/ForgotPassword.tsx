// src/features/auth/ForgotPassword.tsx
import React from "react";

const ForgotPassword = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Your Password</h2>
        <form>
          <input type="email" placeholder="Enter your email" required />
          <button type="submit">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
