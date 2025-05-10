
import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
  mode: "signin" | "signup";
}

export function AuthLayout({ children, className, mode }: AuthLayoutProps) {
  return (
    <div className="flex w-full h-screen md:p-0 items-stretch">
      <div 
        className={cn(
          "w-full md:w-1/2 flex flex-col justify-center items-center p-8 transition-all duration-500 animate-fade-in",
          mode === "signin" ? "md:order-2" : "md:order-1",
          className
        )}
      >
        <Card className="w-full max-w-md p-8 shadow-lg animate-scale-in">
          {children}
        </Card>
      </div>
      
      <div 
        className={cn(
          "hidden md:flex md:w-1/2 gradient-primary flex-col justify-center items-center p-12 text-white transition-all duration-500",
          mode === "signin" ? "md:order-1 rounded-r-3xl" : "md:order-2 rounded-l-3xl"
        )}
      >
        {mode === "signin" ? (
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-lg opacity-90">
              Enter your personal details to use all of site features
            </p>
            <div className="mt-8">
              <button 
                onClick={() => window.location.href = '/signup'} 
                className="border-2 border-white text-white font-medium py-2 px-8 rounded-full hover:bg-white hover:text-tamil-primary transition-colors"
              >
                SIGN UP
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Hello Friend!</h2>
            <p className="text-lg opacity-90">
              Register with your personal details to use all of site features
            </p>
            <div className="mt-8">
              <button 
                onClick={() => window.location.href = '/signin'} 
                className="border-2 border-white text-white font-medium py-2 px-8 rounded-full hover:bg-white hover:text-tamil-primary transition-colors"
              >
                SIGN IN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
