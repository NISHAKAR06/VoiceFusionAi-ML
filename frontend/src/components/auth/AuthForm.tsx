
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { FaGoogle, FaFacebook, FaGithub, FaLinkedin } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

interface AuthFormProps {
  type: 'signin' | 'signup';
  onSubmit?: (data: any) => void;
}

export function AuthForm({ type, onSubmit }: AuthFormProps) {
  const navigate = useNavigate();
  const { setUser } = useUser();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = type === 'signin' ? 'http://localhost:8000/api/login/' : 'http://localhost:8000/api/signup/';
    const body = type === 'signin' 
      ? { username: formData.email, password: formData.password } 
      : { username: formData.name, password: formData.password, email: formData.email };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        const userData = {
          name: type === 'signin' ? formData.email.split('@')[0] : formData.name,
          email: formData.email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            type === 'signin' ? formData.email.split('@')[0] : formData.name
          )}&background=6246EA&color=fff`
        };
        setUser(userData);
        toast({
          title: type === 'signin' ? "Signed In!" : "Account Created!",
          description: "Welcome to Tamil Dub Cinema",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: data.error || "An error occurred.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred.",
        variant: "destructive"
      });
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
