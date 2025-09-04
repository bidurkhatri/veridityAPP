// Third-party integration platform
export class IntegrationPlatform {
  private static instance: IntegrationPlatform;
  private connectors: Map<string, IntegrationConnector> = new Map();
  private workflows: Map<string, IntegrationWorkflow> = new Map();
  private transformers: Map<string, DataTransformer> = new Map();
  private eventBus: EventBus;

  static getInstance(): IntegrationPlatform {
    if (!IntegrationPlatform.instance) {
      IntegrationPlatform.instance = new IntegrationPlatform();
    }
    return IntegrationPlatform.instance;
  }

  async initializeIntegrations(): Promise<void> {
    this.eventBus = new EventBus();
    await this.setupConnectors();
    this.createWorkflows();
    this.setupTransformers();
    this.startEventProcessing();
    console.log('🔗 Third-party integration platform initialized');
  }

  // Setup popular service connectors
  private async setupConnectors(): Promise<void> {
    // Salesforce CRM connector
    this.connectors.set('salesforce', {
      id: 'salesforce',
      name: 'Salesforce CRM',
      type: 'crm',
      authType: 'oauth2',
      endpoints: {
        auth: 'https://login.salesforce.com/services/oauth2/token',
        api: 'https://api.salesforce.com/v1',
        webhook: '/webhooks/salesforce'
      },
      capabilities: ['read_contacts', 'write_contacts', 'read_leads', 'write_leads'],
      rateLimit: { requests: 1000, window: 3600 }
    });

    // HubSpot connector
    this.connectors.set('hubspot', {
      id: 'hubspot',
      name: 'HubSpot',
      type: 'marketing',
      authType: 'api_key',
      endpoints: {
        api: 'https://api.hubapi.com/v3',
        webhook: '/webhooks/hubspot'
      },
      capabilities: ['read_contacts', 'write_contacts', 'email_campaigns', 'analytics'],
      rateLimit: { requests: 1000, window: 600 }
    });

    // Slack connector
    this.connectors.set('slack', {
      id: 'slack',
      name: 'Slack',
      type: 'communication',
      authType: 'oauth2',
      endpoints: {
        auth: 'https://slack.com/api/oauth.v2.access',
        api: 'https://slack.com/api',
        webhook: '/webhooks/slack'
      },
      capabilities: ['send_messages', 'read_messages', 'file_upload', 'user_management'],
      rateLimit: { requests: 1000, window: 60 }
    });

    // Stripe payment connector
    this.connectors.set('stripe', {
      id: 'stripe',
      name: 'Stripe',
      type: 'payment',
      authType: 'api_key',
      endpoints: {
        api: 'https://api.stripe.com/v1',
        webhook: '/webhooks/stripe'
      },
      capabilities: ['process_payments', 'manage_subscriptions', 'refunds', 'analytics'],
      rateLimit: { requests: 1000, window: 3600 }
    });

    // Twilio SMS connector
    this.connectors.set('twilio', {
      id: 'twilio',
      name: 'Twilio',
      type: 'communication',
      authType: 'basic',
      endpoints: {
        api: 'https://api.twilio.com/2010-04-01',
        webhook: '/webhooks/twilio'
      },
      capabilities: ['send_sms', 'send_voice', 'phone_verification', 'call_tracking'],
      rateLimit: { requests: 1000, window: 3600 }
    });

    // SendGrid email connector
    this.connectors.set('sendgrid', {
      id: 'sendgrid',
      name: 'SendGrid',
      type: 'email',
      authType: 'api_key',
      endpoints: {
        api: 'https://api.sendgrid.com/v3',
        webhook: '/webhooks/sendgrid'
      },
      capabilities: ['send_email', 'email_templates', 'analytics', 'list_management'],
      rateLimit: { requests: 1000, window: 3600 }
    });

    // Google Analytics connector
    this.connectors.set('google_analytics', {
      id: 'google_analytics',
      name: 'Google Analytics',
      type: 'analytics',
      authType: 'oauth2',
      endpoints: {
        auth: 'https://accounts.google.com/oauth2/token',
        api: 'https://analyticsreporting.googleapis.com/v4',
        webhook: '/webhooks/google_analytics'
      },
      capabilities: ['read_analytics', 'custom_events', 'goal_tracking', 'audience_data'],
      rateLimit: { requests: 1000, window: 3600 }
    });

    console.log(`🔌 Setup ${this.connectors.size} integration connectors`);
  }

  // Execute integration workflow
  async executeWorkflow(workflowId: string, inputData: any): Promise<WorkflowExecutionResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const execution: WorkflowExecutionResult = {
      workflowId,
      executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'running',
      startTime: new Date(),
      endTime: null,
      steps: [],
      inputData,
      outputData: null,
      errors: []
    };

    try {
      let currentData = inputData;

      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        const stepResult = await this.executeWorkflowStep(step, currentData, execution);
        
        execution.steps.push(stepResult);

        if (!stepResult.success) {
          if (step.continueOnError) {
            console.warn(`Step ${step.name} failed but continuing: ${stepResult.error}`);
          } else {
            throw new Error(`Step ${step.name} failed: ${stepResult.error}`);
          }
        } else {
          currentData = stepResult.outputData || currentData;
        }

        // Apply step delay if specified
        if (step.delayMs && i < workflow.steps.length - 1) {
          await new Promise(resolve => setTimeout(resolve, step.delayMs));
        }
      }

      execution.status = 'completed';
      execution.outputData = currentData;
      execution.endTime = new Date();

      console.log(`✅ Workflow ${workflowId} completed successfully`);
      return execution;

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      console.error(`❌ Workflow ${workflowId} failed:`, error);
      throw error;
    }
  }

  // Data transformation pipeline
  async transformData(transformerId: string, inputData: any): Promise<TransformationResult> {
    const transformer = this.transformers.get(transformerId);
    if (!transformer) {
      throw new Error(`Transformer not found: ${transformerId}`);
    }

    const result: TransformationResult = {
      transformerId,
      inputData,
      outputData: null,
      transformationsApplied: [],
      executionTime: 0
    };

    const startTime = Date.now();

    try {
      let currentData = inputData;

      for (const transformation of transformer.transformations) {
        currentData = await this.applyTransformation(currentData, transformation);
        result.transformationsApplied.push(transformation.name);
      }

      result.outputData = currentData;
      result.executionTime = Date.now() - startTime;

      return result;

    } catch (error) {
      result.executionTime = Date.now() - startTime;
      throw error;
    }
  }

  // Real-time event processing
  async processEvent(event: IntegrationEvent): Promise<void> {
    try {
      // Validate event
      if (!this.validateEvent(event)) {
        throw new Error('Invalid event structure');
      }

      // Find workflows triggered by this event
      const triggeredWorkflows = this.findTriggeredWorkflows(event);

      // Execute workflows asynchronously
      const executions = triggeredWorkflows.map(workflowId => 
        this.executeWorkflow(workflowId, event.data).catch(error => {
          console.error(`Workflow ${workflowId} failed for event ${event.id}:`, error);
        })
      );

      await Promise.all(executions);

      // Publish to event bus for other listeners
      this.eventBus.publish(event);

    } catch (error) {
      console.error(`Error processing event ${event.id}:`, error);
    }
  }

  // API endpoint management
  async callExternalAPI(connectorId: string, endpoint: string, data?: any, method: string = 'GET'): Promise<APICallResult> {
    const connector = this.connectors.get(connectorId);
    if (!connector) {
      throw new Error(`Connector not found: ${connectorId}`);
    }

    const result: APICallResult = {
      connectorId,
      endpoint,
      method,
      status: 0,
      data: null,
      headers: {},
      executionTime: 0,
      error: null
    };

    const startTime = Date.now();

    try {
      // Check rate limits
      await this.checkRateLimit(connector);

      // Prepare authentication
      const authHeaders = await this.prepareAuthentication(connector);

      // Make API call
      const response = await this.makeAPICall(connector, endpoint, {
        method,
        data,
        headers: authHeaders
      });

      result.status = response.status;
      result.data = response.data;
      result.headers = response.headers;
      result.executionTime = Date.now() - startTime;

      return result;

    } catch (error) {
      result.executionTime = Date.now() - startTime;
      result.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  // Webhook endpoint handling
  async handleWebhook(connectorId: string, payload: any, headers: Record<string, string>): Promise<void> {
    const connector = this.connectors.get(connectorId);
    if (!connector) {
      throw new Error(`Connector not found: ${connectorId}`);
    }

    try {
      // Verify webhook signature
      const isValid = await this.verifyWebhookSignature(connector, payload, headers);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      // Transform webhook payload to internal event format
      const event = await this.transformWebhookToEvent(connectorId, payload);

      // Process the event
      await this.processEvent(event);

      console.log(`📥 Processed webhook from ${connectorId}`);

    } catch (error) {
      console.error(`Error handling webhook from ${connectorId}:`, error);
      throw error;
    }
  }

  // Create integration workflows
  private createWorkflows(): void {
    // Lead processing workflow
    this.workflows.set('lead_processing', {
      id: 'lead_processing',
      name: 'Lead Processing Workflow',
      trigger: {
        type: 'event',
        eventType: 'user_verification_completed'
      },
      steps: [
        {
          id: 'extract_lead_data',
          name: 'Extract Lead Data',
          type: 'data_transformation',
          config: { transformerId: 'user_to_lead' },
          continueOnError: false
        },
        {
          id: 'enrich_lead',
          name: 'Enrich Lead Data',
          type: 'api_call',
          config: { 
            connectorId: 'clearbit',
            endpoint: '/enrichment/person',
            method: 'POST'
          },
          continueOnError: true
        },
        {
          id: 'create_crm_lead',
          name: 'Create CRM Lead',
          type: 'api_call',
          config: {
            connectorId: 'salesforce',
            endpoint: '/sobjects/Lead',
            method: 'POST'
          },
          continueOnError: false
        },
        {
          id: 'send_notification',
          name: 'Send Slack Notification',
          type: 'api_call',
          config: {
            connectorId: 'slack',
            endpoint: '/chat.postMessage',
            method: 'POST'
          },
          continueOnError: true,
          delayMs: 1000
        }
      ]
    });

    // User onboarding workflow
    this.workflows.set('user_onboarding', {
      id: 'user_onboarding',
      name: 'User Onboarding Workflow',
      trigger: {
        type: 'event',
        eventType: 'user_registered'
      },
      steps: [
        {
          id: 'send_welcome_email',
          name: 'Send Welcome Email',
          type: 'api_call',
          config: {
            connectorId: 'sendgrid',
            endpoint: '/mail/send',
            method: 'POST'
          },
          continueOnError: false
        },
        {
          id: 'create_hubspot_contact',
          name: 'Create HubSpot Contact',
          type: 'api_call',
          config: {
            connectorId: 'hubspot',
            endpoint: '/crm/v3/objects/contacts',
            method: 'POST'
          },
          continueOnError: true
        },
        {
          id: 'send_sms_welcome',
          name: 'Send Welcome SMS',
          type: 'api_call',
          config: {
            connectorId: 'twilio',
            endpoint: '/Messages.json',
            method: 'POST'
          },
          continueOnError: true,
          delayMs: 2000
        }
      ]
    });

    // Payment processing workflow
    this.workflows.set('payment_processing', {
      id: 'payment_processing',
      name: 'Payment Processing Workflow',
      trigger: {
        type: 'event',
        eventType: 'payment_initiated'
      },
      steps: [
        {
          id: 'validate_payment',
          name: 'Validate Payment Data',
          type: 'data_validation',
          config: { schema: 'payment_schema' },
          continueOnError: false
        },
        {
          id: 'process_stripe_payment',
          name: 'Process Stripe Payment',
          type: 'api_call',
          config: {
            connectorId: 'stripe',
            endpoint: '/payment_intents',
            method: 'POST'
          },
          continueOnError: false
        },
        {
          id: 'update_analytics',
          name: 'Update Analytics',
          type: 'api_call',
          config: {
            connectorId: 'google_analytics',
            endpoint: '/collect',
            method: 'POST'
          },
          continueOnError: true
        },
        {
          id: 'send_receipt',
          name: 'Send Receipt Email',
          type: 'api_call',
          config: {
            connectorId: 'sendgrid',
            endpoint: '/mail/send',
            method: 'POST'
          },
          continueOnError: true
        }
      ]
    });

    console.log(`🔄 Created ${this.workflows.size} integration workflows`);
  }

  // Setup data transformers
  private setupTransformers(): void {
    // User to lead transformer
    this.transformers.set('user_to_lead', {
      id: 'user_to_lead',
      name: 'User to Lead Transformer',
      description: 'Transform user data to CRM lead format',
      transformations: [
        {
          name: 'extract_contact_info',
          type: 'field_mapping',
          config: {
            mappings: {
              'firstName': 'user.profile.firstName',
              'lastName': 'user.profile.lastName',
              'email': 'user.email',
              'phone': 'user.profile.phone'
            }
          }
        },
        {
          name: 'add_lead_source',
          type: 'field_addition',
          config: {
            fields: {
              'leadSource': 'Veridity Platform',
              'leadStatus': 'New',
              'leadScore': 50
            }
          }
        },
        {
          name: 'format_dates',
          type: 'date_formatting',
          config: {
            dateFields: ['createdDate', 'lastActivityDate'],
            format: 'ISO8601'
          }
        }
      ]
    });

    // Payment data transformer
    this.transformers.set('payment_transformer', {
      id: 'payment_transformer',
      name: 'Payment Data Transformer',
      description: 'Transform payment data for external services',
      transformations: [
        {
          name: 'currency_conversion',
          type: 'currency_conversion',
          config: {
            fromCurrency: 'USD',
            toCurrency: 'EUR',
            rateSource: 'ecb'
          }
        },
        {
          name: 'amount_formatting',
          type: 'number_formatting',
          config: {
            fields: ['amount', 'tax', 'total'],
            decimals: 2,
            stripZeros: false
          }
        }
      ]
    });

    console.log(`🔄 Setup ${this.transformers.size} data transformers`);
  }

  // Start event processing
  private startEventProcessing(): void {
    this.eventBus.subscribe('*', async (event: IntegrationEvent) => {
      try {
        await this.processEvent(event);
      } catch (error) {
        console.error('Error in event processing:', error);
      }
    });

    console.log('📡 Started real-time event processing');
  }

  // Private helper methods
  private async executeWorkflowStep(step: WorkflowStep, inputData: any, execution: WorkflowExecutionResult): Promise<StepExecutionResult> {
    const stepResult: StepExecutionResult = {
      stepId: step.id,
      stepName: step.name,
      success: false,
      startTime: new Date(),
      endTime: null,
      inputData,
      outputData: null,
      error: null
    };

    try {
      switch (step.type) {
        case 'api_call':
          stepResult.outputData = await this.executeAPICallStep(step, inputData);
          break;
        case 'data_transformation':
          stepResult.outputData = await this.executeTransformationStep(step, inputData);
          break;
        case 'data_validation':
          stepResult.outputData = await this.executeValidationStep(step, inputData);
          break;
        case 'condition':
          stepResult.outputData = await this.executeConditionStep(step, inputData);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      stepResult.success = true;
      stepResult.endTime = new Date();

      console.log(`✅ Step ${step.name} completed successfully`);
      return stepResult;

    } catch (error) {
      stepResult.success = false;
      stepResult.endTime = new Date();
      stepResult.error = error instanceof Error ? error.message : 'Unknown error';

      console.error(`❌ Step ${step.name} failed:`, error);
      return stepResult;
    }
  }

  private async executeAPICallStep(step: WorkflowStep, inputData: any): Promise<any> {
    const { connectorId, endpoint, method } = step.config;
    const result = await this.callExternalAPI(connectorId, endpoint, inputData, method);
    return result.data;
  }

  private async executeTransformationStep(step: WorkflowStep, inputData: any): Promise<any> {
    const { transformerId } = step.config;
    const result = await this.transformData(transformerId, inputData);
    return result.outputData;
  }

  private async executeValidationStep(step: WorkflowStep, inputData: any): Promise<any> {
    // Simplified validation
    return inputData;
  }

  private async executeConditionStep(step: WorkflowStep, inputData: any): Promise<any> {
    // Simplified condition evaluation
    return inputData;
  }

  private async applyTransformation(data: any, transformation: DataTransformation): Promise<any> {
    switch (transformation.type) {
      case 'field_mapping':
        return this.applyFieldMapping(data, transformation.config);
      case 'field_addition':
        return this.applyFieldAddition(data, transformation.config);
      case 'date_formatting':
        return this.applyDateFormatting(data, transformation.config);
      case 'currency_conversion':
        return this.applyCurrencyConversion(data, transformation.config);
      case 'number_formatting':
        return this.applyNumberFormatting(data, transformation.config);
      default:
        return data;
    }
  }

  private applyFieldMapping(data: any, config: any): any {
    const result = { ...data };
    
    for (const [targetField, sourcePath] of Object.entries(config.mappings)) {
      const value = this.getNestedValue(data, sourcePath as string);
      this.setNestedValue(result, targetField, value);
    }
    
    return result;
  }

  private applyFieldAddition(data: any, config: any): any {
    return { ...data, ...config.fields };
  }

  private applyDateFormatting(data: any, config: any): any {
    const result = { ...data };
    
    for (const field of config.dateFields) {
      if (result[field]) {
        const date = new Date(result[field]);
        result[field] = date.toISOString();
      }
    }
    
    return result;
  }

  private applyCurrencyConversion(data: any, config: any): any {
    // Simplified currency conversion
    return data;
  }

  private applyNumberFormatting(data: any, config: any): any {
    const result = { ...data };
    
    for (const field of config.fields) {
      if (typeof result[field] === 'number') {
        result[field] = Number(result[field].toFixed(config.decimals));
      }
    }
    
    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private validateEvent(event: IntegrationEvent): boolean {
    return !!(event.id && event.type && event.source && event.timestamp);
  }

  private findTriggeredWorkflows(event: IntegrationEvent): string[] {
    const triggered: string[] = [];
    
    for (const [workflowId, workflow] of this.workflows) {
      if (workflow.trigger.type === 'event' && workflow.trigger.eventType === event.type) {
        triggered.push(workflowId);
      }
    }
    
    return triggered;
  }

  private async checkRateLimit(connector: IntegrationConnector): Promise<void> {
    // Simplified rate limit check
    // Implementation would track API calls per connector
  }

  private async prepareAuthentication(connector: IntegrationConnector): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    
    switch (connector.authType) {
      case 'api_key':
        headers['Authorization'] = `Bearer ${process.env[`${connector.id.toUpperCase()}_API_KEY`]}`;
        break;
      case 'oauth2':
        headers['Authorization'] = `Bearer ${await this.getOAuthToken(connector.id)}`;
        break;
      case 'basic':
        const credentials = Buffer.from(`${process.env[`${connector.id.toUpperCase()}_USERNAME`]}:${process.env[`${connector.id.toUpperCase()}_PASSWORD`]}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
        break;
    }
    
    return headers;
  }

  private async getOAuthToken(connectorId: string): Promise<string> {
    // Implementation would manage OAuth token refresh
    return 'oauth_token_placeholder';
  }

  private async makeAPICall(connector: IntegrationConnector, endpoint: string, options: any): Promise<any> {
    // Simplified API call implementation
    return {
      status: 200,
      data: { success: true, message: `API call to ${connector.name} successful` },
      headers: {}
    };
  }

  private async verifyWebhookSignature(connector: IntegrationConnector, payload: any, headers: Record<string, string>): Promise<boolean> {
    // Implementation would verify webhook signatures based on connector type
    return true; // Simplified
  }

  private async transformWebhookToEvent(connectorId: string, payload: any): Promise<IntegrationEvent> {
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: `${connectorId}_webhook`,
      source: connectorId,
      timestamp: new Date(),
      data: payload
    };
  }

  // Get integration statistics
  getIntegrationStats(): IntegrationStats {
    return {
      connectors: this.connectors.size,
      workflows: this.workflows.size,
      transformers: this.transformers.size,
      activeConnections: Array.from(this.connectors.values()).filter(c => c.authType).length
    };
  }
}

// Event Bus implementation
class EventBus {
  private listeners: Map<string, Array<(event: IntegrationEvent) => void>> = new Map();

  subscribe(eventType: string, callback: (event: IntegrationEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  publish(event: IntegrationEvent): void {
    // Notify specific event type listeners
    const typeListeners = this.listeners.get(event.type) || [];
    typeListeners.forEach(callback => callback(event));

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*') || [];
    wildcardListeners.forEach(callback => callback(event));
  }
}

// Type definitions
interface IntegrationConnector {
  id: string;
  name: string;
  type: string;
  authType: 'api_key' | 'oauth2' | 'basic' | 'custom';
  endpoints: {
    auth?: string;
    api: string;
    webhook?: string;
  };
  capabilities: string[];
  rateLimit: {
    requests: number;
    window: number; // seconds
  };
}

interface IntegrationWorkflow {
  id: string;
  name: string;
  trigger: {
    type: 'event' | 'schedule' | 'manual';
    eventType?: string;
    schedule?: string;
  };
  steps: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'api_call' | 'data_transformation' | 'data_validation' | 'condition' | 'delay';
  config: any;
  continueOnError: boolean;
  delayMs?: number;
}

interface DataTransformer {
  id: string;
  name: string;
  description: string;
  transformations: DataTransformation[];
}

interface DataTransformation {
  name: string;
  type: 'field_mapping' | 'field_addition' | 'date_formatting' | 'currency_conversion' | 'number_formatting';
  config: any;
}

interface IntegrationEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: any;
}

interface WorkflowExecutionResult {
  workflowId: string;
  executionId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime: Date | null;
  steps: StepExecutionResult[];
  inputData: any;
  outputData: any;
  errors: string[];
}

interface StepExecutionResult {
  stepId: string;
  stepName: string;
  success: boolean;
  startTime: Date;
  endTime: Date | null;
  inputData: any;
  outputData: any;
  error: string | null;
}

interface TransformationResult {
  transformerId: string;
  inputData: any;
  outputData: any;
  transformationsApplied: string[];
  executionTime: number;
}

interface APICallResult {
  connectorId: string;
  endpoint: string;
  method: string;
  status: number;
  data: any;
  headers: Record<string, string>;
  executionTime: number;
  error: string | null;
}

interface IntegrationStats {
  connectors: number;
  workflows: number;
  transformers: number;
  activeConnections: number;
}

export const integrationPlatform = IntegrationPlatform.getInstance();