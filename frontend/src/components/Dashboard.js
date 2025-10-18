import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState('day');
  const [progressData, setProgressData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [range]);

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/get-progress?range=${range}`);
      const data = await response.json();
      setProgressData(data);
      
      // Calculate stats
      const totalMinutes = data.data.reduce((sum, item) => sum + item.total_minutes, 0);
      const totalSessions = data.data.reduce((sum, item) => sum + item.session_count, 0);
      const totalDistractions = data.data.reduce((sum, item) => sum + item.total_distractions, 0);
      const bestStreak = Math.max(...data.data.map(item => item.total_minutes), 0);
      
      setStats({
        totalMinutes,
        totalSessions,
        totalDistractions,
        bestStreak
      });
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!progressData) return null;

    const labels = progressData.data.map(item => item.period);
    const minutesData = progressData.data.map(item => item.total_minutes);
    const sessionsData = progressData.data.map(item => item.session_count);

    return {
      labels,
      datasets: [
        {
          label: 'Focus Minutes',
          data: minutesData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.1,
        },
        {
          label: 'Sessions',
          data: sessionsData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
      ],
    };
  };

  const getBarChartData = () => {
    if (!progressData) return null;

    const labels = progressData.data.map(item => item.period);
    const distractionsData = progressData.data.map(item => item.total_distractions);

    return {
      labels,
      datasets: [
        {
          label: 'Distractions',
          data: distractionsData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Focus Progress - ${range.charAt(0).toUpperCase() + range.slice(1)}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Distractions - ${range.charAt(0).toUpperCase() + range.slice(1)}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Progress Dashboard</h1>
              <p className="text-gray-600">Track your focus journey</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
            >
              Start New Session
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Range Selector */}
        <div className="mb-8">
          <div className="flex space-x-2">
            {['day', 'week', 'month'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  range === r
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">⏱️</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Focus Time</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMinutes} min</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">🎯</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">⚠️</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Distractions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDistractions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">🔥</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Best Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bestStreak} min</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Focus Progress Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Focus Progress</h3>
            {progressData && progressData.data.length > 0 ? (
              <Line data={getChartData()} options={chartOptions} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <p>No data available for this period</p>
                <p className="text-sm">Start a focus session to see your progress!</p>
              </div>
            )}
          </div>

          {/* Distractions Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Distractions</h3>
            {progressData && progressData.data.length > 0 ? (
              <Bar data={getBarChartData()} options={barChartOptions} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📈</div>
                <p>No distraction data available</p>
                <p className="text-sm">Complete sessions to track distractions</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
          {progressData && progressData.data.length > 0 ? (
            <div className="space-y-3">
              {progressData.data.slice(-5).reverse().map((session, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium">{session.period}</p>
                    <p className="text-sm text-gray-600">{session.session_count} sessions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{session.total_minutes} min</p>
                    <p className="text-sm text-red-600">{session.total_distractions} distractions</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p>No recent sessions</p>
              <p className="text-sm">Start your first focus session to see it here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
