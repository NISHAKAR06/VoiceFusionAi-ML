
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Film, Clock, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

// Mock data for charts
const pieData = [
  { name: 'Completed', value: 8, color: '#6246EA' },
  { name: 'In Progress', value: 3, color: '#9B87F5' },
  { name: 'Failed', value: 1, color: '#EF4444' },
];

const lineData = [
  { name: 'Mon', processing: 2, completed: 1 },
  { name: 'Tue', processing: 3, completed: 2 },
  { name: 'Wed', processing: 4, completed: 3 },
  { name: 'Thu', processing: 2, completed: 2 },
  { name: 'Fri', processing: 5, completed: 4 },
  { name: 'Sat', processing: 3, completed: 3 },
  { name: 'Sun', processing: 2, completed: 2 },
];

const recentProjects = [
  { id: 1, name: 'Avengers Endgame', progress: 100, status: 'completed', date: '2023-05-01' },
  { id: 2, name: 'The Dark Knight', progress: 72, status: 'processing', date: '2023-05-05' },
  { id: 3, name: 'Inception', progress: 100, status: 'completed', date: '2023-05-10' },
  { id: 4, name: 'Interstellar', progress: 45, status: 'processing', date: '2023-05-15' },
];

export function DashboardSummary() {
  const navigate = useNavigate();
  
  const stats = [
    { title: "Total Projects", value: "12", icon: <Film className="h-5 w-5" />, color: "bg-blue-100 text-blue-700" },
    { title: "In Progress", value: "3", icon: <Activity className="h-5 w-5" />, color: "bg-amber-100 text-amber-700" },
    { title: "Processing Time", value: "8.2h", icon: <Clock className="h-5 w-5" />, color: "bg-purple-100 text-purple-700" },
    { title: "Completed", value: "8", icon: <CheckCircle className="h-5 w-5" />, color: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Project Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" opacity={0.3} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="processing" 
                  stroke="#9B87F5" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#6246EA" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animate-in-delay-200">
          <CardHeader>
            <CardTitle>Projects Status</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex flex-col justify-center items-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="animate-fade-in animate-in-delay-300">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Projects</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentProjects.map((project, index) => (
              <div key={project.id} className="flex items-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="mr-4">
                  <div className="p-2 bg-tamil-light dark:bg-tamil-dark rounded-md">
                    <Film className="h-8 w-8 text-tamil-primary" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">{project.name}</h4>
                    <span className="text-xs text-muted-foreground">{project.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Progress value={project.progress} className="h-2 flex-grow" />
                    <span className="ml-4 text-sm text-muted-foreground">{project.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
