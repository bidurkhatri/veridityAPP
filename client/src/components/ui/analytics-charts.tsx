import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface ChartDataPoint {
  timestamp: Date;
  value: number;
  category?: string;
}

interface AnalyticsChartsProps {
  proofData: ChartDataPoint[];
  latencyData: ChartDataPoint[];
  className?: string;
}

export function AnalyticsCharts({ proofData, latencyData, className }: AnalyticsChartsProps) {
  // Generate SVG path for area chart
  const generateAreaPath = (data: ChartDataPoint[], width: number, height: number) => {
    if (data.length === 0) return '';
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.value - minValue) / range) * height;
      return `${x},${y}`;
    });
    
    const pathData = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
    return pathData;
  };

  // Generate SVG path for line chart
  const generateLinePath = (data: ChartDataPoint[], width: number, height: number) => {
    if (data.length === 0) return '';
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.value - minValue) / range) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Calculate trends
  const getProofTrend = () => {
    if (proofData.length < 2) return { direction: 'stable', percentage: 0 };
    const recent = proofData.slice(-7).reduce((sum, d) => sum + d.value, 0);
    const previous = proofData.slice(-14, -7).reduce((sum, d) => sum + d.value, 0);
    const change = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    return {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      percentage: Math.abs(change)
    };
  };

  const getLatencyTrend = () => {
    if (latencyData.length < 2) return { direction: 'stable', percentage: 0 };
    const recent = latencyData.slice(-7).reduce((sum, d) => sum + d.value, 0) / 7;
    const previous = latencyData.slice(-14, -7).reduce((sum, d) => sum + d.value, 0) / 7;
    const change = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    return {
      direction: change > 10 ? 'up' : change < -10 ? 'down' : 'stable',
      percentage: Math.abs(change)
    };
  };

  const proofTrend = getProofTrend();
  const latencyTrend = getLatencyTrend();

  const chartWidth = 300;
  const chartHeight = 120;

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      {/* Proof Volume Chart (Stacked Area) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Proof Volume</CardTitle>
            <div className="flex items-center gap-2">
              {proofTrend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4 text-success-text" />
              ) : proofTrend.direction === 'down' ? (
                <TrendingDown className="h-4 w-4 text-danger-text" />
              ) : (
                <Activity className="h-4 w-4 text-text-tertiary" />
              )}
              <Badge 
                className={cn(
                  "text-xs",
                  proofTrend.direction === 'up' ? "text-success-text bg-success-bg border-success-border" :
                  proofTrend.direction === 'down' ? "text-danger-text bg-danger-bg border-danger-border" :
                  "text-text-tertiary bg-surface-secondary border-border-default"
                )}
              >
                {proofTrend.percentage > 0 ? `${proofTrend.percentage.toFixed(1)}%` : 'Stable'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart */}
            <div className="relative">
              <svg width={chartWidth} height={chartHeight} className="w-full">
                {/* Background gradient */}
                <defs>
                  <linearGradient id="proofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * (chartHeight / 4)}
                    x2={chartWidth}
                    y2={i * (chartHeight / 4)}
                    stroke="rgb(var(--border-default))"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                ))}
                
                {/* Area chart */}
                {proofData.length > 0 && (
                  <path
                    d={generateAreaPath(proofData, chartWidth, chartHeight)}
                    fill="url(#proofGradient)"
                    stroke="rgb(var(--primary))"
                    strokeWidth="2"
                  />
                )}
                
                {/* Data points */}
                {proofData.map((point, index) => {
                  const maxValue = Math.max(...proofData.map(d => d.value));
                  const minValue = Math.min(...proofData.map(d => d.value));
                  const range = maxValue - minValue || 1;
                  const x = (index / (proofData.length - 1)) * chartWidth;
                  const y = chartHeight - ((point.value - minValue) / range) * chartHeight;
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="rgb(var(--primary))"
                      className="hover:r-4 transition-all cursor-pointer"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-text-primary">
                  {proofData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
                </div>
                <div className="text-xs text-text-tertiary">Total Proofs</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-text-primary">
                  {proofData.length > 0 ? Math.round(proofData.reduce((sum, d) => sum + d.value, 0) / proofData.length) : 0}
                </div>
                <div className="text-xs text-text-tertiary">Daily Average</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-text-primary">
                  {proofData.length > 0 ? Math.max(...proofData.map(d => d.value)) : 0}
                </div>
                <div className="text-xs text-text-tertiary">Peak Day</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latency Chart (Line Chart) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Response Latency</CardTitle>
            <div className="flex items-center gap-2">
              {latencyTrend.direction === 'down' ? (
                <TrendingDown className="h-4 w-4 text-success-text" />
              ) : latencyTrend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4 text-danger-text" />
              ) : (
                <Activity className="h-4 w-4 text-text-tertiary" />
              )}
              <Badge 
                className={cn(
                  "text-xs",
                  latencyTrend.direction === 'down' ? "text-success-text bg-success-bg border-success-border" :
                  latencyTrend.direction === 'up' ? "text-danger-text bg-danger-bg border-danger-border" :
                  "text-text-tertiary bg-surface-secondary border-border-default"
                )}
              >
                {latencyTrend.percentage > 0 ? `${latencyTrend.percentage.toFixed(1)}%` : 'Stable'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart */}
            <div className="relative">
              <svg width={chartWidth} height={chartHeight} className="w-full">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * (chartHeight / 4)}
                    x2={chartWidth}
                    y2={i * (chartHeight / 4)}
                    stroke="rgb(var(--border-default))"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                ))}
                
                {/* Line chart */}
                {latencyData.length > 0 && (
                  <path
                    d={generateLinePath(latencyData, chartWidth, chartHeight)}
                    fill="none"
                    stroke="rgb(var(--warning-text))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                
                {/* Data points */}
                {latencyData.map((point, index) => {
                  const maxValue = Math.max(...latencyData.map(d => d.value));
                  const minValue = Math.min(...latencyData.map(d => d.value));
                  const range = maxValue - minValue || 1;
                  const x = (index / (latencyData.length - 1)) * chartWidth;
                  const y = chartHeight - ((point.value - minValue) / range) * chartHeight;
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="rgb(var(--warning-text))"
                      className="hover:r-4 transition-all cursor-pointer"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-text-primary">
                  {latencyData.length > 0 ? Math.round(latencyData.reduce((sum, d) => sum + d.value, 0) / latencyData.length) : 0}ms
                </div>
                <div className="text-xs text-text-tertiary">Average</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-text-primary">
                  {latencyData.length > 0 ? Math.min(...latencyData.map(d => d.value)) : 0}ms
                </div>
                <div className="text-xs text-text-tertiary">Best</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-text-primary">
                  {latencyData.length > 0 ? Math.max(...latencyData.map(d => d.value)) : 0}ms
                </div>
                <div className="text-xs text-text-tertiary">Peak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}