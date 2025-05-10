
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { FaGoogle, FaFacebook, FaGithub, FaLinkedin } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface AuthFormProps {
  type: 'signin' | 'signup';
  onSubmit?: (data: any) => void;
}

export function AuthForm({ type, onSubmit }: AuthFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (type === 'signup' && !formData.name) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.email) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.password) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }
    
    // Handle authentication (this would connect to your backend)
    toast({
      title: type === 'signin' ? "Signed In!" : "Account Created!",
      description: "Welcome to Tamil Dub Cinema",
    });
    
    // Forward to dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
    
    // Call onSubmit if provided
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} login coming soon!`,
      description: "This feature will be available in a future update.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">
          {type === 'signin' ? 'Sign In' : 'Create Account'}
        </h1>
      </div>
      
      <div className="flex justify-center space-x-4 mb-4">
        {[
          { icon: <FaGoogle size={20} />, name: 'Google' },
          { icon: <FaFacebook size={20} />, name: 'Facebook' },
          { icon: <FaGithub size={20} />, name: 'Github' },
          { icon: <FaLinkedin size={20} />, name: 'LinkedIn' }
        ].map((social, index) => (
          <Button
            key={index}
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleSocialLogin(social.name)}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {social.icon}
          </Button>
        ))}
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or use your email {type === 'signin' ? 'password' : 'for registration'}
          </span>
        </div>
      </div>

      {type === 'signup' && (
        <div className="space-y-2 animate-fade-in animate-in-delay-100">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
      )}

      <div className="space-y-2 animate-fade-in animate-in-delay-200">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          //placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2 animate-fade-in animate-in-delay-300">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          //placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <Button
        type="submit"
        className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
      >
        {type === 'signin' ? 'SIGN IN' : 'SIGN UP'}
      </Button>

      <div className="text-center text-sm text-muted-foreground mt-6">
        {type === 'signin' ? (
          <p>
            Don't have an account?{' '}
            <a href="/signup" className="text-tamil-primary hover:underline">
              Sign up
            </a>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <a href="/signin" className="text-tamil-primary hover:underline">
              Sign in
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
