import React, { useState, useEffect } from 'react';
import { X, Clock, Target, TrendingUp, Calendar, Play, Pause, Trash2 } from 'lucide-react';

const PomodoroStatsModal = ({ isOpen, onClose, currentProject }) => {
  const [pomodoroData, setPomodoroData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen && currentProject) {
      loadPomodoroHistory();
    }
  }, [isOpen, currentProject]);

  const loadPomodoroHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/load-pomodoro-history/${currentProject.folderName || currentProject.name}`);
      const data = await response.json();
      
      if (data.success) {
        setPomodoroData(data);
      } else {
        setPomodoroData({
          sessions: [],
          dailyStats: {},
          todayStats: {
            workSessions: 0,
            breakSessions: 0,
            totalFocusTime: 0,
            completionRate: 0
          },
          totalSessions: 0
        });
      }
    } catch (error) {
      console.error('Failed to load pomodoro history:', error);
      setPomodoroData(null);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm('이 세션을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/delete-pomodoro-session', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: currentProject.folderName || currentProject.name,
          sessionId: sessionId
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('✅ Session deleted successfully!');
        // 데이터 재로드
        loadPomodoroHistory();
      } else {
        console.error('❌ Failed to delete session:', result.error);
        alert('세션 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ Error deleting session:', error);
      alert('세션 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getDateSessions = (date) => {
    if (!pomodoroData) return [];
    return pomodoroData.sessions?.filter(session => 
      session.startTime.split('T')[0] === date
    ) || [];
  };

  const getDateStats = (date) => {
    return pomodoroData?.dailyStats?.[date] || {
      workSessions: 0,
      breakSessions: 0,
      totalFocusTime: 0,
      completionRate: 0
    };
  };

  const getWeeklyStats = () => {
    if (!pomodoroData?.dailyStats) return [];
    
    const today = new Date();
    const weeklyStats = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stats = pomodoroData.dailyStats[dateStr] || {
        workSessions: 0,
        breakSessions: 0,
        totalFocusTime: 0,
        completionRate: 0
      };
      
      weeklyStats.push({
        date: dateStr,
        dayName: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
        ...stats
      });
    }
    
    return weeklyStats;
  };

  const getTaskStats = () => {
    if (!pomodoroData?.sessions) return [];
    
    const taskStats = {};
    
    pomodoroData.sessions
      .filter(session => session.type === 'work' && session.taskId)
      .forEach(session => {
        if (!taskStats[session.taskId]) {
          taskStats[session.taskId] = {
            taskId: session.taskId,
            taskTitle: session.taskTitle,
            sessions: 0,
            totalTime: 0,
            completedSessions: 0
          };
        }
        
        taskStats[session.taskId].sessions++;
        taskStats[session.taskId].totalTime += session.duration;
        if (session.completed) {
          taskStats[session.taskId].completedSessions++;
        }
      });
    
    return Object.values(taskStats).sort((a, b) => b.totalTime - a.totalTime);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">뽀모도로 통계</h2>
            {currentProject && (
              <span className="text-sm text-gray-500">- {currentProject.name}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">데이터를 불러오는 중...</div>
            </div>
          ) : pomodoroData ? (
            <div className="space-y-8">
              {/* 오늘의 통계 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">오늘 작업</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {pomodoroData.todayStats.workSessions}
                  </div>
                  <div className="text-xs text-red-600">
                    {formatTime(pomodoroData.todayStats.totalFocusTime)}
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Pause className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">오늘 휴식</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {pomodoroData.todayStats.breakSessions}
                  </div>
                  <div className="text-xs text-green-600">세션</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">완료율</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {pomodoroData.todayStats.completionRate}%
                  </div>
                  <div className="text-xs text-blue-600">오늘</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-700">총 세션</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {pomodoroData.totalSessions}
                  </div>
                  <div className="text-xs text-purple-600">전체</div>
                </div>
              </div>

              {/* 주간 트렌드 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  주간 트렌드
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {getWeeklyStats().map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-500 mb-2">{day.dayName}</div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-900">
                          {day.workSessions}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(day.totalFocusTime)}
                        </div>
                        <div className={`w-full h-2 rounded-full mt-2 ${
                          day.workSessions > 0 ? 'bg-red-200' : 'bg-gray-200'
                        }`}>
                          <div 
                            className="h-full bg-red-500 rounded-full"
                            style={{ 
                              width: `${Math.min((day.workSessions / 8) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 작업별 통계 */}
              {getTaskStats().length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">작업별 시간 투입</h3>
                  <div className="space-y-3">
                    {getTaskStats().slice(0, 10).map((task, index) => (
                      <div key={task.taskId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            #{task.taskId} {task.taskTitle}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.sessions}회 세션 • {task.completedSessions}회 완료
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-red-600">
                            {formatTime(task.totalTime)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round((task.completedSessions / task.sessions) * 100)}% 완료
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 날짜별 세션 기록 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">세션 기록</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-3 py-1"
                  />
                </div>
                
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {getDateStats(selectedDate).workSessions}
                      </div>
                      <div className="text-xs text-gray-600">작업 세션</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {getDateStats(selectedDate).breakSessions}
                      </div>
                      <div className="text-xs text-gray-600">휴식 세션</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatTime(getDateStats(selectedDate).totalFocusTime)}
                      </div>
                      <div className="text-xs text-gray-600">총 집중시간</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {getDateSessions(selectedDate).length > 0 ? (
                    getDateSessions(selectedDate).map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded group">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            session.type === 'work' ? 'bg-red-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <div className="text-sm font-medium">
                              {session.type === 'work' ? '작업' : '휴식'} ({formatTime(session.duration)})
                              {session.skipped && (
                                <span className="ml-2 text-orange-600 text-xs">(건너뛰기)</span>
                              )}
                            </div>
                            {session.taskTitle && (
                              <div className="text-xs text-gray-500">{session.taskTitle}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500">
                            {new Date(session.startTime).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {session.completed ? (
                              <span className="ml-2 text-green-600">✓</span>
                            ) : (
                              <span className="ml-2 text-red-600">✗</span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteSession(session.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all"
                            title="세션 삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      선택한 날짜에 기록된 세션이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              뽀모도로 기록을 불러올 수 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PomodoroStatsModal;