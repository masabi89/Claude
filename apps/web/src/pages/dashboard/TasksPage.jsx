import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Calendar, User, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, assigned, created

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      setTasks([
        {
          id: '1',
          title: 'Design homepage mockup',
          description: 'Create wireframes and high-fidelity mockups for the new homepage',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          dueDate: '2024-11-20',
          assignee: {
            name: 'Sarah Johnson',
            avatar: null,
            initials: 'SJ',
          },
          project: 'Website Redesign',
          createdAt: '2024-11-10',
        },
        {
          id: '2',
          title: 'Set up CI/CD pipeline',
          description: 'Configure automated testing and deployment pipeline',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: '2024-11-25',
          assignee: {
            name: 'Mike Chen',
            avatar: null,
            initials: 'MC',
          },
          project: 'Mobile App Development',
          createdAt: '2024-11-08',
        },
        {
          id: '3',
          title: 'Database schema review',
          description: 'Review and optimize database schema for performance',
          status: 'IN_REVIEW',
          priority: 'URGENT',
          dueDate: '2024-11-18',
          assignee: {
            name: 'Alex Rodriguez',
            avatar: null,
            initials: 'AR',
          },
          project: 'Database Migration',
          createdAt: '2024-11-05',
        },
        {
          id: '4',
          title: 'Write API documentation',
          description: 'Document all REST API endpoints with examples',
          status: 'DONE',
          priority: 'LOW',
          dueDate: '2024-11-15',
          assignee: {
            name: 'Emma Wilson',
            avatar: null,
            initials: 'EW',
          },
          project: 'Website Redesign',
          createdAt: '2024-11-01',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'assigned') {
      return task.assignee.name === user?.name;
    }
    if (filter === 'created') {
      return true; // In real app, filter by creator
    }
    return true;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your tasks across all projects
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Tasks
        </Button>
        <Button
          variant={filter === 'assigned' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('assigned')}
        >
          Assigned to Me
        </Button>
        <Button
          variant={filter === 'created' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('created')}
        >
          Created by Me
        </Button>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={task.assignee.avatar} />
                        <AvatarFallback className="text-xs">
                          {task.assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span>{task.assignee.name}</span>
                    </div>
                    
                    <div className="text-blue-600 font-medium">
                      {task.project}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {task.status === 'DONE' && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? 'Get started by creating your first task'
              : `No tasks found for the selected filter`
            }
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>
      )}
    </div>
  );
};

export default TasksPage;

