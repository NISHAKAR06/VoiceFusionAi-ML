
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Film, Languages, Mic, MonitorSmartphone } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-primary text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">VOICEFUSIONAI</h1>
              <p className="text-xl opacity-90 mb-8">
                Transform English movie dialogues into Tamil while preserving the original actor's voice, emotion, and lip-sync for a seamless dubbing experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/signup')} 
                  size="lg"
                  className="bg-white text-tamil-primary hover:bg-tamil-light hover:text-tamil-primary"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => navigate('/signin')} 
                  //variant="outline" 
                  size="lg"
                  //className="border-white text-white hover:bg-white hover:text-tamil-primary"
                  className="bg-white text-tamil-primary hover:bg-tamil-light hover:text-tamil-primary"
                >
                  Sign In
                </Button>
              </div>
            </div>
            <div className="flex-1 animate-fade-in animate-in-delay-200">
              <div className="aspect-video bg-white/10 rounded-lg border border-white/20 flex items-center justify-center">
                <Film className="h-16 w-16" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Our advanced AI-powered platform handles the entire dubbing process from speech recognition to lip-sync.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Film className="h-8 w-8 mb-4" />,
                title: "Upload Movie",
                description: "Upload your English movie file in various formats including MP4, MKV or AVI.",
                delay: 0
              },
              {
                icon: <Mic className="h-8 w-8 mb-4" />,
                title: "Speech Recognition",
                description: "Our AI extracts spoken dialogues and converts speech to text with high accuracy.",
                delay: 100
              },
              {
                icon: <Languages className="h-8 w-8 mb-4" />,
                title: "Tamil Translation",
                description: "The extracted text is translated from English to Tamil preserving context and meaning.",
                delay: 200
              },
              {
                icon: <MonitorSmartphone className="h-8 w-8 mb-4" />,
                title: "Voice & Lip Sync",
                description: "Generate Tamil audio using the original actor's voice synced with lip movements.",
                delay: 300
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-card p-6 rounded-lg border shadow-sm text-center animate-fade-in"
                style={{ animationDelay: `${feature.delay}ms` }}
              >
                <div className="inline-flex items-center justify-center gradient-primary text-white rounded-full p-3">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mt-2 mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-tamil-light dark:bg-tamil-dark py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Movie Experience?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our platform and start creating seamless Tamil dubbed movies with preserved voice emotion and accurate lip-sync.
          </p>
          <Button 
            onClick={() => navigate('/signup')} 
            size="lg"
            className="gradient-primary text-white hover:opacity-90"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card py-8 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold">VoiceFusionAI</h3>
              <p className="text-muted-foreground">Transform movies with seamless Tamil dubbing</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                © 2025 Voice Fusion AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
