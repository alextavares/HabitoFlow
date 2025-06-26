import { Platform } from 'react-native';
import { habitService } from './firebase';

interface ReportData {
  user: {
    name: string;
    email: string;
  };
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalHabits: number;
    completedTotal: number;
    completionRate: number;
    currentStreak: number;
    bestStreak: number;
  };
  habits: Array<{
    name: string;
    icon: string;
    color: string;
    totalDays: number;
    completedDays: number;
    completionRate: number;
    currentStreak: number;
    maxStreak: number;
    createdAt: Date;
  }>;
  dailyProgress: Array<{
    date: Date;
    completed: number;
    total: number;
    percentage: number;
  }>;
}

export class ReportService {
  static async generateReport(userId: string, startDate: Date, endDate: Date): Promise<ReportData> {
    try {
      // Fetch all necessary data
      const habits = await habitService.getHabits(userId);
      const logs = await habitService.getLogs(userId);
      
      // Filter logs by date range
      const filteredLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startDate && logDate <= endDate;
      });

      // Calculate summary metrics
      const totalHabits = habits.length;
      const completedTotal = filteredLogs.length;
      const daysInRange = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const possibleCompletions = totalHabits * daysInRange;
      const completionRate = possibleCompletions > 0 ? Math.round((completedTotal / possibleCompletions) * 100) : 0;
      
      const currentStreak = Math.max(...habits.map(h => h.currentStreak || 0), 0);
      const bestStreak = Math.max(...habits.map(h => h.maxStreak || 0), 0);

      // Calculate per-habit metrics
      const habitMetrics = habits.map(habit => {
        const habitLogs = filteredLogs.filter(log => log.habitId === habit.id);
        const habitCreatedDate = new Date(habit.createdAt);
        const effectiveStartDate = habitCreatedDate > startDate ? habitCreatedDate : startDate;
        const daysExisted = Math.ceil((endDate.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          totalDays: daysExisted,
          completedDays: habitLogs.length,
          completionRate: daysExisted > 0 ? Math.round((habitLogs.length / daysExisted) * 100) : 0,
          currentStreak: habit.currentStreak || 0,
          maxStreak: habit.maxStreak || 0,
          createdAt: habitCreatedDate,
        };
      });

      // Calculate daily progress
      const dailyProgress = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toDateString();
        const dayLogs = filteredLogs.filter(log => new Date(log.date).toDateString() === dateStr);
        const activeHabits = habits.filter(habit => new Date(habit.createdAt) <= d);
        
        dailyProgress.push({
          date: new Date(d),
          completed: dayLogs.length,
          total: activeHabits.length,
          percentage: activeHabits.length > 0 ? Math.round((dayLogs.length / activeHabits.length) * 100) : 0,
        });
      }

      return {
        user: {
          name: 'User', // This would come from user profile
          email: 'user@example.com',
        },
        period: {
          start: startDate,
          end: endDate,
        },
        summary: {
          totalHabits,
          completedTotal,
          completionRate,
          currentStreak,
          bestStreak,
        },
        habits: habitMetrics,
        dailyProgress,
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  static formatReportAsHTML(report: ReportData): string {
    const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório HabitoFlow - ${formatDate(report.period.start)} a ${formatDate(report.period.end)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #6366F1;
        }
        
        .logo {
            font-size: 48px;
            margin-bottom: 10px;
        }
        
        h1 {
            color: #6366F1;
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .period {
            color: #666;
            font-size: 18px;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .metric-card {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        
        .metric-value {
            font-size: 36px;
            font-weight: bold;
            color: #6366F1;
        }
        
        .metric-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        
        .section {
            margin: 40px 0;
        }
        
        .section-title {
            font-size: 24px;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .habit-list {
            display: grid;
            gap: 15px;
        }
        
        .habit-card {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .habit-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .habit-icon {
            font-size: 32px;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 10px;
        }
        
        .habit-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
        }
        
        .habit-stats {
            display: flex;
            gap: 30px;
            align-items: center;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #6366F1;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
        }
        
        .progress-chart {
            margin-top: 20px;
            overflow-x: auto;
        }
        
        .chart-container {
            min-width: 600px;
            height: 200px;
            display: flex;
            align-items: flex-end;
            gap: 5px;
            padding: 20px 0;
        }
        
        .chart-bar {
            flex: 1;
            background: #6366F1;
            border-radius: 4px 4px 0 0;
            position: relative;
            min-height: 5px;
        }
        
        .chart-label {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #666;
            white-space: nowrap;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎯</div>
            <h1>Relatório HabitoFlow</h1>
            <div class="period">${formatDate(report.period.start)} - ${formatDate(report.period.end)}</div>
        </div>
        
        <div class="summary">
            <div class="metric-card">
                <div class="metric-value">${report.summary.totalHabits}</div>
                <div class="metric-label">Total de Hábitos</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.completedTotal}</div>
                <div class="metric-label">Completados</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.completionRate}%</div>
                <div class="metric-label">Taxa de Conclusão</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.bestStreak}</div>
                <div class="metric-label">Melhor Sequência</div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">Desempenho por Hábito</h2>
            <div class="habit-list">
                ${report.habits.map(habit => `
                    <div class="habit-card" style="border-color: ${habit.color}">
                        <div class="habit-info">
                            <div class="habit-icon" style="background-color: ${habit.color}20">
                                ${habit.icon}
                            </div>
                            <div class="habit-name">${habit.name}</div>
                        </div>
                        <div class="habit-stats">
                            <div class="stat">
                                <div class="stat-value">${habit.completionRate}%</div>
                                <div class="stat-label">Conclusão</div>
                            </div>
                            <div class="stat">
                                <div class="stat-value">${habit.completedDays}/${habit.totalDays}</div>
                                <div class="stat-label">Dias</div>
                            </div>
                            <div class="stat">
                                <div class="stat-value">${habit.currentStreak}</div>
                                <div class="stat-label">Sequência</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">Progresso Diário</h2>
            <div class="progress-chart">
                <div class="chart-container">
                    ${report.dailyProgress.slice(-30).map(day => `
                        <div class="chart-bar" style="height: ${day.percentage}%">
                            <div class="chart-label">${day.date.getDate()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p>HabitoFlow - Transformando hábitos em conquistas</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  static formatReportAsCSV(report: ReportData): string {
    const lines = [];
    
    // Header
    lines.push('HabitoFlow - Relatório de Hábitos');
    lines.push(`Período: ${report.period.start.toLocaleDateString('pt-BR')} - ${report.period.end.toLocaleDateString('pt-BR')}`);
    lines.push('');
    
    // Summary
    lines.push('RESUMO GERAL');
    lines.push(`Total de Hábitos,${report.summary.totalHabits}`);
    lines.push(`Total Completado,${report.summary.completedTotal}`);
    lines.push(`Taxa de Conclusão,${report.summary.completionRate}%`);
    lines.push(`Sequência Atual,${report.summary.currentStreak}`);
    lines.push(`Melhor Sequência,${report.summary.bestStreak}`);
    lines.push('');
    
    // Habits
    lines.push('DESEMPENHO POR HÁBITO');
    lines.push('Nome,Dias Totais,Dias Completados,Taxa de Conclusão,Sequência Atual,Melhor Sequência');
    report.habits.forEach(habit => {
      lines.push(`${habit.name},${habit.totalDays},${habit.completedDays},${habit.completionRate}%,${habit.currentStreak},${habit.maxStreak}`);
    });
    lines.push('');
    
    // Daily Progress
    lines.push('PROGRESSO DIÁRIO');
    lines.push('Data,Completados,Total,Percentual');
    report.dailyProgress.forEach(day => {
      lines.push(`${day.date.toLocaleDateString('pt-BR')},${day.completed},${day.total},${day.percentage}%`);
    });
    
    return lines.join('\n');
  }

  static async exportReport(
    userId: string, 
    startDate: Date, 
    endDate: Date, 
    format: 'html' | 'csv' = 'html'
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const report = await this.generateReport(userId, startDate, endDate);
      
      let content: string;
      let filename: string;
      let mimeType: string;
      
      if (format === 'csv') {
        content = this.formatReportAsCSV(report);
        filename = `habitoflow_relatorio_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        content = this.formatReportAsHTML(report);
        filename = `habitoflow_relatorio_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.html`;
        mimeType = 'text/html';
      }
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return { success: true };
      } else {
        // For mobile, you would use react-native-fs or similar
        // This is a placeholder - actual implementation would depend on the library
        return { 
          success: true, 
          data: content 
        };
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export default ReportService;