
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Film, Clock, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Project } from './Dashboard';

interface DashboardSummaryProps {
  projects: Project[];
}

// Mock data for charts
const lineData = [
  { name: 'Mon', processing: 2, completed: 1 },
  { name: 'Tue', processing: 3, completed: 2 },
  { name: 'Wed', processing: 4, completed: 3 },
  { name: 'Thu', processing: 2, completed: 2 },
  { name: 'Fri', processing: 5, completed: 4 },
  { name: 'Sat', processing: 3, completed: 3 },
  { name: 'Sun', processing: 2, completed: 2 },
];

export function DashboardSummary({ projects = [] }: DashboardSummaryProps) {
  const navigate = useNavigate();
  
  // Calculate stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const processingProjects = projects.filter(p => p.status === 'processing').length;
  const failedProjects = projects.filter(p => p.status === 'failed').length;
  
  // Create pie data
  const pieData = [
    { name: 'Completed', value: completedProjects, color: '#6246EA' },
    { name: 'In Progress', value: processingProjects, color: '#9B87F5' },
    { name: 'Failed', value: failedProjects, color: '#EF4444' },
  ].filter(item => item.value > 0);
  
  // If no projects, add a placeholder
  if (pieData.length === 0) {
    pieData.push({ name: 'No Projects', value: 1, color: '#E5E7EB' });
  }
  
  const stats = [
    { title: "Total Projects", value: totalProjects.toString(), icon: <Film className="h-5 w-5" />, color: "bg-blue-100 text-blue-700" },
    { title: "In Progress", value: processingProjects.toString(), icon: <Activity className="h-5 w-5" />, color: "bg-amber-100 text-amber-700" },
    { title: "Processing Time", value: totalProjects > 0 ? "8.2h" : "0h", icon: <Clock className="h-5 w-5" />, color: "bg-purple-100 text-purple-700" },
    { title: "Completed", value: completedProjects.toString(), icon: <CheckCircle className="h-5 w-5" />, color: "bg-green-100 text-green-700" },
  ];

  // Show most recent projects
  const recentProjects = [...projects].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 4);

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
      
      {projects.length > 0 ? (
        <>
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
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentProjects.length > 0 ? (
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
                          <h4 className="font-medium">{project.title}</h4>
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
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent projects</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="animate-fade-in py-10">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Film className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6">Upload your first video to start dubbing</p>
            <Button onClick={() => navigate('/upload')}>Upload Video</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
