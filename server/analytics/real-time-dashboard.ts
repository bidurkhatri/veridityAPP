/**
 * Real-Time Analytics Dashboard
 * Live metrics, monitoring, and business intelligence
 */

export interface DashboardMetric {
  id: string;
  name: string;
  category: 'performance' | 'business' | 'security' | 'user' | 'system';
  type: 'gauge' | 'counter' | 'histogram' | 'rate' | 'percentage';
  value: number;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  timestamp: Date;
  target?: number;
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  userRole: 'admin' | 'client' | 'analyst' | 'executive';
  widgets: DashboardWidget[];
  layout: LayoutConfig;
  refreshInterval: number; // seconds
  permissions: string[];
  lastUpdated: Date;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'map' | 'gauge' | 'alert' | 'text';
  position: WidgetPosition;
  size: WidgetSize;
  configuration: WidgetConfig;
  dataSource: DataSource;
  filters: WidgetFilter[];
  refreshRate: number; // seconds
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number; // width in grid units
  h: number; // height in grid units
}

export interface WidgetSize {
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';
  timeRange?: 'realtime' | '1h' | '6h' | '24h' | '7d' | '30d';
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  displayOptions?: {
    showLegend: boolean;
    showGrid: boolean;
    showTooltip: boolean;
    theme: 'light' | 'dark';
    colors: string[];
  };
  alerts?: AlertConfig[];
}

export interface DataSource {
  id: string;
  type: 'metrics' | 'events' | 'logs' | 'database' | 'api';
  query: string;
  parameters?: Record<string, any>;
  cacheTimeout?: number; // seconds
}

export interface WidgetFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'between';
  value: any;
  enabled: boolean;
}

export interface AlertConfig {
  id: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  notification: NotificationConfig;
}

export interface NotificationConfig {
  channels: ('email' | 'slack' | 'webhook' | 'sms')[];
  recipients: string[];
  message: string;
  cooldown: number; // minutes
}

export interface LayoutConfig {
  cols: number;
  rows: number;
  margin: [number, number];
  padding: [number, number];
  breakpoints: Record<string, number>;
}

export interface MetricSeries {
  metricId: string;
  dataPoints: DataPoint[];
  metadata: SeriesMetadata;
}

export interface DataPoint {
  timestamp: Date;
  value: number;
  tags?: Record<string, string>;
}

export interface SeriesMetadata {
  name: string;
  unit: string;
  description: string;
  color: string;
  aggregation: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  assignee?: string;
  tags: string[];
  metadata: Record<string, any>;
}

class RealTimeAnalyticsService {
  private dashboards: Map<string, Dashboard> = new Map();
  private metrics: Map<string, DashboardMetric> = new Map();
  private metricSeries: Map<string, MetricSeries> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private subscribers: Map<string, Set<WebSocketConnection>> = new Map();

  constructor() {
    this.initializeDashboards();
    this.initializeMetrics();
    this.startMetricCollection();
    this.startAlertMonitoring();
  }

  private initializeDashboards() {
    const dashboards: Dashboard[] = [
      {
        id: 'admin-overview',
        name: 'Admin Overview Dashboard',
        description: 'Comprehensive system monitoring and management dashboard',
        userRole: 'admin',
        widgets: [
          {
            id: 'system-health',
            title: 'System Health',
            type: 'gauge',
            position: { x: 0, y: 0, w: 3, h: 2 },
            size: { minW: 2, minH: 2, maxW: 4, maxH: 3 },
            configuration: {
              displayOptions: {
                showLegend: false,
                showGrid: false,
                showTooltip: true,
                theme: 'light',
                colors: ['#10b981', '#f59e0b', '#ef4444']
              }
            },
            dataSource: {
              id: 'system-health-metric',
              type: 'metrics',
              query: 'system.health.overall'
            },
            filters: [],
            refreshRate: 30
          },
          {
            id: 'verification-rate',
            title: 'Verification Success Rate',
            type: 'chart',
            position: { x: 3, y: 0, w: 6, h: 3 },
            size: { minW: 4, minH: 2, maxW: 8, maxH: 4 },
            configuration: {
              chartType: 'line',
              timeRange: '24h',
              aggregation: 'avg',
              displayOptions: {
                showLegend: true,
                showGrid: true,
                showTooltip: true,
                theme: 'light',
                colors: ['#3b82f6', '#10b981']
              }
            },
            dataSource: {
              id: 'verification-success',
              type: 'metrics',
              query: 'verification.success_rate'
            },
            filters: [],
            refreshRate: 60
          },
          {
            id: 'active-users',
            title: 'Active Users',
            type: 'metric',
            position: { x: 9, y: 0, w: 3, h: 2 },
            size: { minW: 2, minH: 2, maxW: 4, maxH: 3 },
            configuration: {
              displayOptions: {
                showLegend: false,
                showGrid: false,
                showTooltip: true,
                theme: 'light',
                colors: ['#8b5cf6']
              }
            },
            dataSource: {
              id: 'active-users-count',
              type: 'metrics',
              query: 'users.active.count'
            },
            filters: [],
            refreshRate: 120
          },
          {
            id: 'fraud-detection',
            title: 'Fraud Detection Alerts',
            type: 'table',
            position: { x: 0, y: 3, w: 6, h: 4 },
            size: { minW: 4, minH: 3, maxW: 8, maxH: 6 },
            configuration: {
              timeRange: '24h',
              displayOptions: {
                showLegend: false,
                showGrid: true,
                showTooltip: false,
                theme: 'light',
                colors: ['#ef4444', '#f59e0b', '#10b981']
              }
            },
            dataSource: {
              id: 'fraud-alerts',
              type: 'events',
              query: 'fraud.alerts.recent'
            },
            filters: [
              {
                field: 'severity',
                operator: 'in',
                value: ['warning', 'critical'],
                enabled: true
              }
            ],
            refreshRate: 30
          },
          {
            id: 'geographic-distribution',
            title: 'User Geographic Distribution',
            type: 'map',
            position: { x: 6, y: 3, w: 6, h: 4 },
            size: { minW: 4, minH: 3, maxW: 8, maxH: 6 },
            configuration: {
              timeRange: '7d',
              aggregation: 'count',
              displayOptions: {
                showLegend: true,
                showGrid: false,
                showTooltip: true,
                theme: 'light',
                colors: ['#dbeafe', '#3b82f6', '#1d4ed8']
              }
            },
            dataSource: {
              id: 'user-geography',
              type: 'database',
              query: 'SELECT country, COUNT(*) FROM users GROUP BY country'
            },
            filters: [],
            refreshRate: 300
          }
        ],
        layout: {
          cols: 12,
          rows: 8,
          margin: [10, 10],
          padding: [20, 20],
          breakpoints: {
            lg: 1200,
            md: 996,
            sm: 768,
            xs: 480
          }
        },
        refreshInterval: 30,
        permissions: ['admin:read', 'admin:write'],
        lastUpdated: new Date()
      },
      {
        id: 'client-analytics',
        name: 'Client Analytics Dashboard',
        description: 'Client-focused verification and usage analytics',
        userRole: 'client',
        widgets: [
          {
            id: 'client-usage',
            title: 'API Usage This Month',
            type: 'chart',
            position: { x: 0, y: 0, w: 6, h: 3 },
            size: { minW: 4, minH: 2, maxW: 8, maxH: 4 },
            configuration: {
              chartType: 'area',
              timeRange: '30d',
              aggregation: 'sum',
              displayOptions: {
                showLegend: true,
                showGrid: true,
                showTooltip: true,
                theme: 'light',
                colors: ['#06b6d4', '#8b5cf6']
              }
            },
            dataSource: {
              id: 'client-api-usage',
              type: 'metrics',
              query: 'api.usage.by_client'
            },
            filters: [],
            refreshRate: 300
          },
          {
            id: 'verification-breakdown',
            title: 'Verification Type Breakdown',
            type: 'chart',
            position: { x: 6, y: 0, w: 6, h: 3 },
            size: { minW: 4, minH: 2, maxW: 8, maxH: 4 },
            configuration: {
              chartType: 'pie',
              timeRange: '7d',
              aggregation: 'count',
              displayOptions: {
                showLegend: true,
                showGrid: false,
                showTooltip: true,
                theme: 'light',
                colors: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444']
              }
            },
            dataSource: {
              id: 'verification-types',
              type: 'database',
              query: 'SELECT type, COUNT(*) FROM verifications WHERE created_at >= NOW() - INTERVAL 7 DAY GROUP BY type'
            },
            filters: [],
            refreshRate: 600
          }
        ],
        layout: {
          cols: 12,
          rows: 6,
          margin: [10, 10],
          padding: [20, 20],
          breakpoints: {
            lg: 1200,
            md: 996,
            sm: 768,
            xs: 480
          }
        },
        refreshInterval: 300,
        permissions: ['client:read'],
        lastUpdated: new Date()
      }
    ];

    dashboards.forEach(dashboard => this.dashboards.set(dashboard.id, dashboard));
    console.log(`📊 Initialized ${dashboards.length} analytics dashboards`);
  }

  private initializeMetrics() {
    const metrics: DashboardMetric[] = [
      {
        id: 'system-health-overall',
        name: 'System Health Overall',
        category: 'system',
        type: 'percentage',
        value: 99.2,
        previousValue: 99.1,
        trend: 'up',
        unit: '%',
        timestamp: new Date(),
        target: 99.5,
        threshold: {
          warning: 95,
          critical: 90
        }
      },
      {
        id: 'verification-success-rate',
        name: 'Verification Success Rate',
        category: 'business',
        type: 'percentage',
        value: 98.7,
        previousValue: 98.5,
        trend: 'up',
        unit: '%',
        timestamp: new Date(),
        target: 99.0,
        threshold: {
          warning: 95,
          critical: 90
        }
      },
      {
        id: 'active-users-count',
        name: 'Active Users',
        category: 'user',
        type: 'gauge',
        value: 1247,
        previousValue: 1198,
        trend: 'up',
        unit: 'users',
        timestamp: new Date(),
        target: 1500
      },
      {
        id: 'api-requests-per-minute',
        name: 'API Requests Per Minute',
        category: 'performance',
        type: 'rate',
        value: 850,
        previousValue: 823,
        trend: 'up',
        unit: 'req/min',
        timestamp: new Date(),
        threshold: {
          warning: 1000,
          critical: 1200
        }
      },
      {
        id: 'fraud-detection-rate',
        name: 'Fraud Detection Rate',
        category: 'security',
        type: 'percentage',
        value: 1.3,
        previousValue: 1.1,
        trend: 'up',
        unit: '%',
        timestamp: new Date(),
        threshold: {
          warning: 2.0,
          critical: 5.0
        }
      },
      {
        id: 'response-time-p95',
        name: 'Response Time 95th Percentile',
        category: 'performance',
        type: 'histogram',
        value: 245,
        previousValue: 267,
        trend: 'down',
        unit: 'ms',
        timestamp: new Date(),
        target: 200,
        threshold: {
          warning: 500,
          critical: 1000
        }
      },
      {
        id: 'monthly-revenue',
        name: 'Monthly Recurring Revenue',
        category: 'business',
        type: 'counter',
        value: 245000,
        previousValue: 238000,
        trend: 'up',
        unit: 'USD',
        timestamp: new Date(),
        target: 300000
      },
      {
        id: 'storage-utilization',
        name: 'Storage Utilization',
        category: 'system',
        type: 'percentage',
        value: 67.8,
        previousValue: 65.2,
        trend: 'up',
        unit: '%',
        timestamp: new Date(),
        threshold: {
          warning: 80,
          critical: 90
        }
      }
    ];

    metrics.forEach(metric => this.metrics.set(metric.id, metric));
    console.log(`📈 Initialized ${metrics.length} real-time metrics`);
  }

  // Real-time data collection
  private startMetricCollection(): void {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 30000);

    // Generate metric series data
    setInterval(() => {
      this.generateMetricSeries();
    }, 60000);
  }

  private async collectMetrics(): Promise<void> {
    for (const metric of this.metrics.values()) {
      const newValue = this.simulateMetricValue(metric);
      metric.previousValue = metric.value;
      metric.value = newValue;
      metric.timestamp = new Date();
      metric.trend = this.calculateTrend(metric.value, metric.previousValue);

      // Check for threshold violations
      if (metric.threshold) {
        await this.checkMetricThresholds(metric);
      }
    }

    // Notify subscribers of metric updates
    this.notifySubscribers('metrics-update', Array.from(this.metrics.values()));
  }

  private simulateMetricValue(metric: DashboardMetric): number {
    const variation = 0.05; // 5% variation
    const baseValue = metric.value;
    const randomFactor = 1 + (Math.random() - 0.5) * variation * 2;
    
    let newValue = baseValue * randomFactor;

    // Apply specific logic for different metric types
    switch (metric.id) {
      case 'active-users-count':
        // Simulate user growth with some daily patterns
        const hour = new Date().getHours();
        const dailyFactor = hour > 8 && hour < 22 ? 1.2 : 0.8; // Higher during business hours
        newValue = Math.round(baseValue * dailyFactor * randomFactor);
        break;

      case 'api-requests-per-minute':
        // Simulate load patterns
        newValue = Math.round(baseValue * randomFactor);
        break;

      case 'response-time-p95':
        // Response time tends to increase with load
        const loadFactor = this.metrics.get('api-requests-per-minute')?.value || 850;
        const loadMultiplier = 1 + Math.max(0, (loadFactor - 800) / 1000);
        newValue = Math.round(baseValue * loadMultiplier * randomFactor);
        break;

      case 'fraud-detection-rate':
        // Fraud rate should stay low but can spike
        if (Math.random() < 0.05) { // 5% chance of spike
          newValue = baseValue * (1.5 + Math.random());
        } else {
          newValue = Math.max(0.1, baseValue * randomFactor);
        }
        break;

      default:
        newValue = baseValue * randomFactor;
    }

    // Ensure values stay within reasonable bounds
    if (metric.type === 'percentage') {
      newValue = Math.max(0, Math.min(100, newValue));
    } else if (metric.type === 'counter' || metric.type === 'gauge') {
      newValue = Math.max(0, newValue);
    }

    return parseFloat(newValue.toFixed(2));
  }

  private calculateTrend(current: number, previous?: number): 'up' | 'down' | 'stable' {
    if (!previous) return 'stable';
    
    const change = (current - previous) / previous;
    const threshold = 0.01; // 1% threshold for stability

    if (change > threshold) return 'up';
    if (change < -threshold) return 'down';
    return 'stable';
  }

  private async checkMetricThresholds(metric: DashboardMetric): Promise<void> {
    if (!metric.threshold) return;

    let severity: Alert['severity'] | null = null;
    let title = '';
    let description = '';

    if (metric.value >= metric.threshold.critical) {
      severity = 'critical';
      title = `Critical: ${metric.name}`;
      description = `${metric.name} has exceeded critical threshold: ${metric.value}${metric.unit} >= ${metric.threshold.critical}${metric.unit}`;
    } else if (metric.value >= metric.threshold.warning) {
      severity = 'warning';
      title = `Warning: ${metric.name}`;
      description = `${metric.name} has exceeded warning threshold: ${metric.value}${metric.unit} >= ${metric.threshold.warning}${metric.unit}`;
    }

    if (severity) {
      await this.createAlert({
        id: `alert-${metric.id}-${Date.now()}`,
        title,
        description,
        severity,
        status: 'active',
        source: metric.id,
        triggeredAt: new Date(),
        tags: ['threshold', 'automatic', metric.category],
        metadata: {
          metricId: metric.id,
          value: metric.value,
          threshold: severity === 'critical' ? metric.threshold.critical : metric.threshold.warning,
          unit: metric.unit
        }
      });
    }
  }

  private generateMetricSeries(): void {
    for (const metric of this.metrics.values()) {
      const seriesId = `series-${metric.id}`;
      let series = this.metricSeries.get(seriesId);

      if (!series) {
        series = {
          metricId: metric.id,
          dataPoints: [],
          metadata: {
            name: metric.name,
            unit: metric.unit,
            description: `Time series data for ${metric.name}`,
            color: this.getMetricColor(metric.category),
            aggregation: 'avg'
          }
        };
        this.metricSeries.set(seriesId, series);
      }

      // Add new data point
      series.dataPoints.push({
        timestamp: new Date(),
        value: metric.value,
        tags: {
          category: metric.category,
          type: metric.type
        }
      });

      // Keep only last 24 hours of data (1440 minutes)
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      series.dataPoints = series.dataPoints.filter(point => point.timestamp > cutoff);
    }
  }

  private getMetricColor(category: string): string {
    const colors = {
      performance: '#3b82f6',
      business: '#10b981',
      security: '#ef4444',
      user: '#8b5cf6',
      system: '#f59e0b'
    };
    return colors[category] || '#6b7280';
  }

  // Alert management
  private startAlertMonitoring(): void {
    setInterval(() => {
      this.processAlerts();
    }, 60000); // Check alerts every minute
  }

  private async createAlert(alertData: Omit<Alert, 'id'>): Promise<string> {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...alertData
    };

    this.alerts.set(alert.id, alert);
    
    // Notify subscribers of new alert
    this.notifySubscribers('alert-created', alert);
    
    console.log(`🚨 Alert created: ${alert.title} (${alert.severity})`);
    return alert.id;
  }

  private async processAlerts(): void {
    const activeAlerts = Array.from(this.alerts.values()).filter(alert => alert.status === 'active');
    
    for (const alert of activeAlerts) {
      // Auto-resolve alerts that are no longer relevant
      if (await this.shouldAutoResolveAlert(alert)) {
        alert.status = 'resolved';
        alert.resolvedAt = new Date();
        
        this.notifySubscribers('alert-resolved', alert);
        console.log(`✅ Auto-resolved alert: ${alert.id}`);
      }
    }
  }

  private async shouldAutoResolveAlert(alert: Alert): Promise<boolean> {
    if (alert.source && alert.metadata?.metricId) {
      const metric = this.metrics.get(alert.metadata.metricId);
      if (metric && metric.threshold) {
        // Resolve if metric is back below warning threshold
        return metric.value < metric.threshold.warning;
      }
    }
    return false;
  }

  // WebSocket subscription management
  async subscribeToMetrics(connectionId: string, connection: WebSocketConnection): Promise<void> {
    if (!this.subscribers.has('metrics')) {
      this.subscribers.set('metrics', new Set());
    }
    this.subscribers.get('metrics')!.add(connection);
    
    // Send current metrics to new subscriber
    connection.send(JSON.stringify({
      type: 'metrics-snapshot',
      data: Array.from(this.metrics.values())
    }));
  }

  async subscribeToAlerts(connectionId: string, connection: WebSocketConnection): Promise<void> {
    if (!this.subscribers.has('alerts')) {
      this.subscribers.set('alerts', new Set());
    }
    this.subscribers.get('alerts')!.add(connection);
    
    // Send active alerts to new subscriber
    const activeAlerts = Array.from(this.alerts.values()).filter(alert => alert.status === 'active');
    connection.send(JSON.stringify({
      type: 'alerts-snapshot',
      data: activeAlerts
    }));
  }

  private notifySubscribers(eventType: string, data: any): void {
    for (const [subscriptionType, connections] of this.subscribers.entries()) {
      if (eventType.startsWith(subscriptionType.replace('s', ''))) {
        for (const connection of connections) {
          try {
            connection.send(JSON.stringify({
              type: eventType,
              data,
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            // Remove dead connections
            connections.delete(connection);
          }
        }
      }
    }
  }

  // Dashboard management
  async createDashboard(dashboardData: Omit<Dashboard, 'id' | 'lastUpdated'>): Promise<string> {
    const dashboardId = `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const dashboard: Dashboard = {
      id: dashboardId,
      ...dashboardData,
      lastUpdated: new Date()
    };

    this.dashboards.set(dashboardId, dashboard);
    
    console.log(`📊 Created dashboard: ${dashboard.name}`);
    return dashboardId;
  }

  async updateDashboardWidget(dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>): Promise<boolean> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const widgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) return false;

    dashboard.widgets[widgetIndex] = { ...dashboard.widgets[widgetIndex], ...updates };
    dashboard.lastUpdated = new Date();

    return true;
  }

  // Analytics queries
  async getMetricSeries(metricId: string, timeRange: string): Promise<MetricSeries | null> {
    const seriesId = `series-${metricId}`;
    const series = this.metricSeries.get(seriesId);
    
    if (!series) return null;

    // Filter data points based on time range
    let cutoff = new Date();
    switch (timeRange) {
      case '1h':
        cutoff = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '6h':
        cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return series; // Return all data for 'realtime'
    }

    return {
      ...series,
      dataPoints: series.dataPoints.filter(point => point.timestamp > cutoff)
    };
  }

  async getAnalyticsSummary(): Promise<{
    totalMetrics: number;
    activeAlerts: number;
    dashboards: number;
    systemHealth: number;
    topMetricsByCategory: Record<string, DashboardMetric[]>;
    alertsByseverity: Record<string, number>;
    recentTrends: Array<{
      metricId: string;
      name: string;
      trend: string;
      change: number;
    }>;
  }> {
    const metrics = Array.from(this.metrics.values());
    const alerts = Array.from(this.alerts.values());
    const activeAlerts = alerts.filter(alert => alert.status === 'active');

    const topMetricsByCategory = metrics.reduce((acc, metric) => {
      if (!acc[metric.category]) acc[metric.category] = [];
      acc[metric.category].push(metric);
      return acc;
    }, {} as Record<string, DashboardMetric[]>);

    // Sort by value within each category
    Object.values(topMetricsByCategory).forEach(categoryMetrics => {
      categoryMetrics.sort((a, b) => b.value - a.value);
    });

    const alertsByS

    const alertsBySeverity = activeAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const systemHealthMetric = this.metrics.get('system-health-overall');
    const systemHealth = systemHealthMetric?.value || 0;

    const recentTrends = metrics.map(metric => ({
      metricId: metric.id,
      name: metric.name,
      trend: metric.trend,
      change: metric.previousValue ? 
        ((metric.value - metric.previousValue) / metric.previousValue) * 100 : 0
    })).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    return {
      totalMetrics: metrics.length,
      activeAlerts: activeAlerts.length,
      dashboards: this.dashboards.size,
      systemHealth,
      topMetricsByCategory,
      alertsBySeverity,
      recentTrends: recentTrends.slice(0, 10) // Top 10 trending metrics
    };
  }

  // Public API methods
  getDashboards(userRole?: string): Dashboard[] {
    const dashboards = Array.from(this.dashboards.values());
    if (userRole) {
      return dashboards.filter(dashboard => dashboard.userRole === userRole);
    }
    return dashboards;
  }

  getDashboard(dashboardId: string): Dashboard | null {
    return this.dashboards.get(dashboardId) || null;
  }

  getMetrics(category?: string): DashboardMetric[] {
    const metrics = Array.from(this.metrics.values());
    if (category) {
      return metrics.filter(metric => metric.category === category);
    }
    return metrics;
  }

  getMetric(metricId: string): DashboardMetric | null {
    return this.metrics.get(metricId) || null;
  }

  getAlerts(status?: Alert['status']): Alert[] {
    const alerts = Array.from(this.alerts.values());
    if (status) {
      return alerts.filter(alert => alert.status === status);
    }
    return alerts;
  }

  async acknowledgeAlert(alertId: string, assignee: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.assignee = assignee;

    this.notifySubscribers('alert-acknowledged', alert);
    return true;
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.status = 'resolved';
    alert.resolvedAt = new Date();

    this.notifySubscribers('alert-resolved', alert);
    return true;
  }
}

interface WebSocketConnection {
  send(data: string): void;
}

export const realTimeAnalyticsService = new RealTimeAnalyticsService();