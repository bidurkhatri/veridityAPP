/**
 * Multilingual AI Chatbot for Customer Support
 * Supports English, Nepali, Chinese, Korean, Japanese
 */

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId?: string;
  content: string;
  language: 'en' | 'ne' | 'zh' | 'ko' | 'ja';
  type: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
  confidence?: number;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'audio';
  url: string;
  name: string;
  size: number;
}

export interface ChatSession {
  id: string;
  userId?: string;
  language: string;
  status: 'active' | 'waiting' | 'resolved' | 'escalated';
  startTime: Date;
  endTime?: Date;
  messages: ChatMessage[];
  context: SessionContext;
  satisfaction?: number; // 1-5 rating
}

export interface SessionContext {
  userType: 'customer' | 'client' | 'enterprise' | 'guest';
  currentPage?: string;
  previousIssues: string[];
  accountStatus?: string;
  verificationLevel?: string;
  preferredLanguage: string;
}

export interface BotResponse {
  content: string;
  suggestions?: string[];
  quickActions?: QuickAction[];
  escalateToHuman?: boolean;
  attachments?: MessageAttachment[];
}

export interface QuickAction {
  id: string;
  label: string;
  action: 'navigate' | 'start_verification' | 'download' | 'contact_support' | 'faq';
  parameters?: Record<string, any>;
}

export interface IntentClassification {
  intent: string;
  confidence: number;
  entities: Entity[];
  language: string;
}

export interface Entity {
  type: 'verification_type' | 'document_type' | 'problem_category' | 'account_info';
  value: string;
  confidence: number;
}

class MultilingualChatbot {
  private sessions: Map<string, ChatSession> = new Map();
  private knowledgeBase: Map<string, Map<string, string>> = new Map(); // language -> intent -> response
  private intentClassifier: IntentClassifier;
  private languageDetector: LanguageDetector;

  constructor() {
    this.intentClassifier = new IntentClassifier();
    this.languageDetector = new LanguageDetector();
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase() {
    // English knowledge base
    const englishKB = new Map([
      ['greeting', 'Hello! I\'m Veridity AI Assistant. How can I help you with your identity verification today?'],
      ['proof_generation', 'I can help you generate identity proofs. What type of verification do you need? We support age, citizenship, education, and employment verification.'],
      ['verification_help', 'To verify a proof, you\'ll need the proof ID and verification key. Would you like me to guide you through the process?'],
      ['account_issues', 'I\'m here to help with account issues. Can you describe what problem you\'re experiencing?'],
      ['technical_support', 'For technical issues, I can provide immediate assistance. What specific problem are you facing?'],
      ['pricing_info', 'Our pricing starts at $9.99/month for basic verification. Would you like to see our full pricing plans?'],
      ['security_concerns', 'Security is our top priority. All data is encrypted and we use zero-knowledge proofs. What security question do you have?'],
      ['mobile_app', 'Yes, we have mobile apps for iOS and Android with full verification capabilities. Would you like download links?'],
      ['api_integration', 'Our API supports easy integration. I can provide documentation and code examples. What platform are you using?'],
      ['goodbye', 'Thank you for using Veridity! Feel free to reach out anytime if you need assistance.']
    ]);

    // Nepali knowledge base
    const nepaliKB = new Map([
      ['greeting', 'नमस्ते! म Veridity AI सहायक हुँ। आजको पहिचान प्रमाणीकरणमा म तपाईंलाई कसरी मद्दत गर्न सक्छु?'],
      ['proof_generation', 'म तपाईंलाई पहिचान प्रमाण उत्पन्न गर्न मद्दत गर्न सक्छु। तपाईंलाई कुन प्रकारको प्रमाणीकरण चाहिन्छ?'],
      ['verification_help', 'प्रमाण प्रमाणीकरण गर्न तपाईंलाई प्रमाण ID र प्रमाणीकरण कुञ्जी चाहिन्छ। के म तपाईंलाई प्रक्रियामा मार्गदर्शन गरूं?'],
      ['account_issues', 'म खाता समस्याहरूमा मद्दत गर्न यहाँ छु। तपाईंले अनुभव गरिरहनुभएको समस्या वर्णन गर्न सक्नुहुन्छ?'],
      ['technical_support', 'प्राविधिक समस्याहरूको लागि, म तत्काल सहायता प्रदान गर्न सक्छु। तपाईं कुन समस्याको सामना गर्दै हुनुहुन्छ?'],
      ['pricing_info', 'हाम्रो मूल्य आधारभूत प्रमाणीकरणको लागि $९.९९/महिनाबाट सुरु हुन्छ। के तपाईं हाम्रो पूर्ण मूल्य योजनाहरू हेर्न चाहनुहुन्छ?'],
      ['goodbye', 'Veridity प्रयोग गर्नुभएकोमा धन्यवाद! यदि तपाईंलाई सहायता चाहिन्छ भने जहिले पनि सम्पर्क गर्नुहोस्।']
    ]);

    // Chinese knowledge base
    const chineseKB = new Map([
      ['greeting', '您好！我是Veridity AI助手。今天我可以如何帮助您进行身份验证？'],
      ['proof_generation', '我可以帮助您生成身份证明。您需要什么类型的验证？我们支持年龄、公民身份、教育和就业验证。'],
      ['verification_help', '要验证证明，您需要证明ID和验证密钥。您希望我指导您完成这个过程吗？'],
      ['account_issues', '我在这里帮助解决账户问题。您能描述一下遇到的问题吗？'],
      ['technical_support', '对于技术问题，我可以提供即时帮助。您面临什么具体问题？'],
      ['pricing_info', '我们的定价从基础验证的每月$9.99开始。您想查看我们的完整定价计划吗？'],
      ['goodbye', '感谢您使用Veridity！如果您需要帮助，请随时联系我们。']
    ]);

    // Korean knowledge base
    const koreanKB = new Map([
      ['greeting', '안녕하세요! 저는 Veridity AI 어시스턴트입니다. 오늘 신원 확인에 어떻게 도움을 드릴까요?'],
      ['proof_generation', '신원 증명 생성을 도와드릴 수 있습니다. 어떤 유형의 검증이 필요하신가요? 연령, 시민권, 교육, 고용 검증을 지원합니다.'],
      ['verification_help', '증명을 검증하려면 증명 ID와 검증 키가 필요합니다. 과정을 안내해 드릴까요?'],
      ['account_issues', '계정 문제를 도와드리기 위해 여기 있습니다. 어떤 문제를 겪고 계신지 설명해 주실 수 있나요?'],
      ['technical_support', '기술적 문제에 대해 즉시 지원을 제공할 수 있습니다. 어떤 구체적인 문제를 겪고 계신가요?'],
      ['pricing_info', '기본 검증의 경우 월 $9.99부터 시작합니다. 전체 요금제를 보시겠습니까?'],
      ['goodbye', 'Veridity를 이용해 주셔서 감사합니다! 도움이 필요하시면 언제든지 연락해 주세요.']
    ]);

    // Japanese knowledge base
    const japaneseKB = new Map([
      ['greeting', 'こんにちは！私はVeridity AIアシスタントです。今日、本人確認についてどのようにお手伝いできますか？'],
      ['proof_generation', '身元証明の生成をお手伝いできます。どのような種類の検証が必要ですか？年齢、市民権、教育、雇用の検証をサポートしています。'],
      ['verification_help', '証明を検証するには、証明IDと検証キーが必要です。プロセスをガイドしましょうか？'],
      ['account_issues', 'アカウントの問題をお手伝いするためにここにいます。経験している問題について説明していただけますか？'],
      ['technical_support', '技術的な問題については、すぐにサポートを提供できます。どのような具体的な問題に直面していますか？'],
      ['pricing_info', '基本検証の料金は月額$9.99から始まります。完全な料金プランをご覧になりますか？'],
      ['goodbye', 'Veridityをご利用いただきありがとうございます！サポートが必要な場合は、いつでもお気軽にお問い合わせください。']
    ]);

    this.knowledgeBase.set('en', englishKB);
    this.knowledgeBase.set('ne', nepaliKB);
    this.knowledgeBase.set('zh', chineseKB);
    this.knowledgeBase.set('ko', koreanKB);
    this.knowledgeBase.set('ja', japaneseKB);

    console.log('🤖 Initialized multilingual knowledge base with 5 languages');
  }

  // Start new chat session
  async startChatSession(userId?: string, preferredLanguage: string = 'en'): Promise<string> {
    const sessionId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: ChatSession = {
      id: sessionId,
      userId,
      language: preferredLanguage,
      status: 'active',
      startTime: new Date(),
      messages: [],
      context: {
        userType: userId ? 'customer' : 'guest',
        previousIssues: [],
        preferredLanguage
      }
    };

    this.sessions.set(sessionId, session);

    // Send welcome message
    const welcomeMessage = await this.generateBotResponse('greeting', preferredLanguage, session.context);
    await this.addMessage(sessionId, welcomeMessage.content, 'bot', preferredLanguage);

    console.log(`💬 Started chat session: ${sessionId} (${preferredLanguage})`);
    return sessionId;
  }

  // Process user message
  async processMessage(sessionId: string, content: string, attachments?: MessageAttachment[]): Promise<BotResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Detect language if not specified
    const detectedLanguage = await this.languageDetector.detect(content);
    const language = detectedLanguage || session.language;

    // Add user message
    await this.addMessage(sessionId, content, 'user', language, attachments);

    // Classify intent
    const classification = await this.intentClassifier.classify(content, language);

    // Generate response
    const response = await this.generateBotResponse(classification.intent, language, session.context, classification.entities);

    // Add bot response
    await this.addMessage(sessionId, response.content, 'bot', language);

    // Update session context
    this.updateSessionContext(session, classification);

    return response;
  }

  private async addMessage(
    sessionId: string,
    content: string,
    type: 'user' | 'bot',
    language: string,
    attachments?: MessageAttachment[]
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userId: session.userId,
      content,
      language: language as ChatMessage['language'],
      type,
      timestamp: new Date(),
      attachments
    };

    session.messages.push(message);
  }

  private async generateBotResponse(
    intent: string,
    language: string,
    context: SessionContext,
    entities?: Entity[]
  ): Promise<BotResponse> {
    const kb = this.knowledgeBase.get(language) || this.knowledgeBase.get('en')!;
    let baseResponse = kb.get(intent) || kb.get('greeting')!;

    const suggestions: string[] = [];
    const quickActions: QuickAction[] = [];
    let escalateToHuman = false;

    // Customize response based on intent and entities
    switch (intent) {
      case 'proof_generation':
        suggestions.push('Age Verification', 'Citizenship Proof', 'Education Certificate', 'Employment Verification');
        quickActions.push({
          id: 'start-verification',
          label: 'Start Verification',
          action: 'start_verification'
        });
        break;

      case 'verification_help':
        quickActions.push({
          id: 'verify-proof',
          label: 'Verify Proof',
          action: 'navigate',
          parameters: { page: '/verify' }
        });
        break;

      case 'technical_support':
        if (context.userType === 'enterprise') {
          escalateToHuman = true;
          baseResponse += ' I\'ll connect you with our technical support team for priority assistance.';
        }
        break;

      case 'api_integration':
        quickActions.push({
          id: 'view-docs',
          label: 'API Documentation',
          action: 'navigate',
          parameters: { page: '/docs/api' }
        });
        break;

      case 'mobile_app':
        quickActions.push(
          {
            id: 'ios-download',
            label: 'Download iOS App',
            action: 'download',
            parameters: { platform: 'ios' }
          },
          {
            id: 'android-download',
            label: 'Download Android App',
            action: 'download',
            parameters: { platform: 'android' }
          }
        );
        break;
    }

    // Add context-aware suggestions
    if (context.userType === 'client') {
      suggestions.push('Integration Help', 'API Documentation', 'Webhook Setup');
    }

    return {
      content: baseResponse,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      quickActions: quickActions.length > 0 ? quickActions : undefined,
      escalateToHuman
    };
  }

  private updateSessionContext(session: ChatSession, classification: IntentClassification): void {
    session.context.preferredLanguage = classification.language;

    // Track previous issues for better context
    if (!session.context.previousIssues.includes(classification.intent)) {
      session.context.previousIssues.push(classification.intent);
    }

    // Update user type based on conversation
    const entities = classification.entities;
    const hasApiQuestions = entities.some(e => e.type === 'verification_type' && e.value.includes('api'));
    const hasEnterpriseQuestions = session.context.previousIssues.some(issue => 
      ['api_integration', 'technical_support', 'enterprise_features'].includes(issue)
    );

    if (hasApiQuestions || hasEnterpriseQuestions) {
      session.context.userType = 'client';
    }
  }

  // End chat session
  async endChatSession(sessionId: string, satisfaction?: number): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = 'resolved';
    session.endTime = new Date();
    session.satisfaction = satisfaction;

    console.log(`💬 Ended chat session: ${sessionId} (satisfaction: ${satisfaction || 'N/A'})`);
    return true;
  }

  // Get chat history
  getChatHistory(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    return session?.messages || [];
  }

  // Get active sessions
  getActiveSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  // Analytics
  async getChatAnalytics(): Promise<{
    totalSessions: number;
    activeSessions: number;
    averageSessionLength: number;
    languageDistribution: Record<string, number>;
    topIntents: Array<{ intent: string; count: number }>;
    satisfactionAverage: number;
    escalationRate: number;
  }> {
    const sessions = Array.from(this.sessions.values());
    const completedSessions = sessions.filter(s => s.endTime);

    const averageSessionLength = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.endTime!.getTime() - s.startTime.getTime()), 0) / completedSessions.length / 1000 / 60
      : 0;

    const languageDistribution = sessions.reduce((acc, session) => {
      acc[session.language] = (acc[session.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const satisfactionRatings = sessions.filter(s => s.satisfaction).map(s => s.satisfaction!);
    const satisfactionAverage = satisfactionRatings.length > 0
      ? satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length
      : 0;

    const escalatedSessions = sessions.filter(s => s.status === 'escalated').length;
    const escalationRate = sessions.length > 0 ? escalatedSessions / sessions.length : 0;

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.status === 'active').length,
      averageSessionLength,
      languageDistribution,
      topIntents: [], // Would be populated from intent tracking
      satisfactionAverage,
      escalationRate
    };
  }
}

class IntentClassifier {
  async classify(text: string, language: string): Promise<IntentClassification> {
    // Simplified intent classification based on keywords
    const lowerText = text.toLowerCase();
    
    let intent = 'general_inquiry';
    let confidence = 0.7;
    const entities: Entity[] = [];

    // Intent patterns for different languages
    const patterns = {
      greeting: ['hello', 'hi', 'hey', 'namaste', 'नमस्ते', '你好', '안녕', 'こんにちは'],
      proof_generation: ['generate', 'create', 'proof', 'verification', 'verify', 'प्रमाण', '证明', '증명', '証明'],
      account_issues: ['account', 'login', 'password', 'access', 'खाता', '账户', '계정', 'アカウント'],
      technical_support: ['error', 'bug', 'not working', 'problem', 'issue', 'त्रुटि', '错误', '오류', 'エラー'],
      pricing_info: ['price', 'cost', 'plan', 'subscription', 'मूल्य', '价格', '가격', '価格'],
      api_integration: ['api', 'integration', 'webhook', 'sdk', 'developer'],
      mobile_app: ['mobile', 'app', 'ios', 'android', 'download'],
      goodbye: ['bye', 'goodbye', 'thanks', 'thank you', 'धन्यवाद', '谢谢', '감사', 'ありがとう']
    };

    // Find matching intent
    for (const [intentName, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        intent = intentName;
        confidence = 0.85;
        break;
      }
    }

    // Extract entities
    if (lowerText.includes('age')) {
      entities.push({ type: 'verification_type', value: 'age', confidence: 0.9 });
    }
    if (lowerText.includes('citizenship') || lowerText.includes('passport')) {
      entities.push({ type: 'verification_type', value: 'citizenship', confidence: 0.9 });
    }

    return {
      intent,
      confidence,
      entities,
      language
    };
  }
}

class LanguageDetector {
  async detect(text: string): Promise<string> {
    // Simplified language detection based on character patterns
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    const hasChinese = /[\u4e00-\u9fff]/.test(text);
    const hasKorean = /[\uac00-\ud7af]/.test(text);
    const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(text);

    if (hasDevanagari) return 'ne';
    if (hasChinese) return 'zh';
    if (hasKorean) return 'ko';
    if (hasJapanese) return 'ja';
    return 'en';
  }
}

export const multilingualChatbot = new MultilingualChatbot();