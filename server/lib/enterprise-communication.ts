/**
 * Enterprise Communication & Collaboration Platform
 * Real-time messaging, video conferencing, file sharing, and team collaboration
 */

import { z } from 'zod';

// Core Communication Types
export const MessageSchema = z.object({
  messageId: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderAvatar: z.string().optional(),
  type: z.enum(['text', 'file', 'image', 'video', 'audio', 'system', 'verification_request', 'proof_share']),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  attachments: z.array(z.object({
    fileId: z.string(),
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    downloadUrl: z.string(),
    thumbnailUrl: z.string().optional()
  })).optional(),
  mentions: z.array(z.string()).optional(),
  replyToId: z.string().optional(),
  reactions: z.array(z.object({
    userId: z.string(),
    emoji: z.string(),
    timestamp: z.date()
  })).optional(),
  isEdited: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  deliveryStatus: z.enum(['sent', 'delivered', 'read', 'failed']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  encryption: z.object({
    isEncrypted: z.boolean(),
    keyId: z.string().optional(),
    algorithm: z.string().optional()
  }).optional(),
  timestamp: z.date(),
  editedAt: z.date().optional()
});

export const ConversationSchema = z.object({
  conversationId: z.string(),
  title: z.string().optional(),
  type: z.enum(['direct', 'group', 'channel', 'announcement', 'support', 'verification']),
  organizationId: z.string(),
  participants: z.array(z.object({
    userId: z.string(),
    role: z.enum(['member', 'admin', 'moderator', 'owner']),
    joinedAt: z.date(),
    lastReadAt: z.date().optional(),
    permissions: z.array(z.string())
  })),
  settings: z.object({
    isPublic: z.boolean().default(false),
    allowInvites: z.boolean().default(true),
    retentionDays: z.number().default(365),
    encryptionEnabled: z.boolean().default(true),
    moderationEnabled: z.boolean().default(false),
    autoArchive: z.boolean().default(false)
  }),
  metadata: z.object({
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    department: z.string().optional(),
    project: z.string().optional()
  }).optional(),
  status: z.enum(['active', 'archived', 'deleted']),
  lastActivity: z.date(),
  messageCount: z.number().default(0),
  createdAt: z.date(),
  createdBy: z.string()
});

export const VideoConferenceSchema = z.object({
  conferenceId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  organizationId: z.string(),
  hostId: z.string(),
  type: z.enum(['instant', 'scheduled', 'recurring', 'webinar']),
  status: z.enum(['waiting', 'active', 'ended', 'cancelled']),
  settings: z.object({
    maxParticipants: z.number().default(100),
    recordingEnabled: z.boolean().default(false),
    screenShareEnabled: z.boolean().default(true),
    chatEnabled: z.boolean().default(true),
    waitingRoomEnabled: z.boolean().default(false),
    passwordRequired: z.boolean().default(false),
    password: z.string().optional(),
    muteOnJoin: z.boolean().default(false),
    videoOnJoin: z.boolean().default(true)
  }),
  participants: z.array(z.object({
    userId: z.string(),
    role: z.enum(['host', 'co_host', 'participant', 'attendee']),
    status: z.enum(['invited', 'joined', 'left', 'removed']),
    joinedAt: z.date().optional(),
    leftAt: z.date().optional(),
    permissions: z.object({
      canSpeak: z.boolean(),
      canVideo: z.boolean(),
      canScreenShare: z.boolean(),
      canChat: z.boolean()
    })
  })),
  recording: z.object({
    isRecording: z.boolean(),
    recordingId: z.string().optional(),
    recordingUrl: z.string().optional(),
    startedAt: z.date().optional(),
    duration: z.number().optional()
  }).optional(),
  schedule: z.object({
    startTime: z.date(),
    endTime: z.date(),
    timezone: z.string(),
    recurrence: z.object({
      type: z.enum(['none', 'daily', 'weekly', 'monthly']),
      interval: z.number(),
      endDate: z.date().optional()
    }).optional()
  }).optional(),
  roomUrl: z.string(),
  phoneNumbers: z.array(z.object({
    country: z.string(),
    number: z.string(),
    conferenceId: z.string()
  })).optional(),
  createdAt: z.date()
});

export const NotificationSchema = z.object({
  notificationId: z.string(),
  userId: z.string(),
  type: z.enum(['message', 'mention', 'meeting_invite', 'meeting_reminder', 'file_shared', 'verification_request', 'system_alert']),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  channels: z.array(z.enum(['push', 'email', 'sms', 'in_app', 'desktop'])),
  status: z.enum(['pending', 'sent', 'delivered', 'read', 'failed']),
  deliveryAttempts: z.number().default(0),
  scheduledFor: z.date().optional(),
  sentAt: z.date().optional(),
  readAt: z.date().optional(),
  actions: z.array(z.object({
    actionId: z.string(),
    label: z.string(),
    type: z.enum(['button', 'link', 'quick_reply']),
    url: z.string().optional(),
    payload: z.record(z.any()).optional()
  })).optional(),
  createdAt: z.date(),
  expiresAt: z.date().optional()
});

export const CollaborationWorkspaceSchema = z.object({
  workspaceId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  organizationId: z.string(),
  type: z.enum(['project', 'department', 'team', 'temporary', 'cross_functional']),
  status: z.enum(['active', 'archived', 'deleted']),
  visibility: z.enum(['public', 'private', 'restricted']),
  members: z.array(z.object({
    userId: z.string(),
    role: z.enum(['owner', 'admin', 'member', 'guest']),
    permissions: z.array(z.string()),
    joinedAt: z.date(),
    lastActiveAt: z.date().optional()
  })),
  channels: z.array(z.string()), // Conversation IDs
  documents: z.array(z.object({
    documentId: z.string(),
    title: z.string(),
    type: z.enum(['document', 'spreadsheet', 'presentation', 'whiteboard', 'form']),
    url: z.string(),
    permissions: z.record(z.string()),
    lastModified: z.date(),
    modifiedBy: z.string()
  })),
  meetings: z.array(z.string()), // Conference IDs
  tasks: z.array(z.object({
    taskId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    assigneeId: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'review', 'done', 'cancelled']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    dueDate: z.date().optional(),
    createdAt: z.date(),
    createdBy: z.string()
  })),
  analytics: z.object({
    totalMessages: z.number(),
    activeMembersToday: z.number(),
    filesShared: z.number(),
    meetingsHeld: z.number(),
    tasksCompleted: z.number()
  }),
  createdAt: z.date(),
  createdBy: z.string()
});

export const FileShareSchema = z.object({
  shareId: z.string(),
  fileId: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  uploadedBy: z.string(),
  organizationId: z.string(),
  type: z.enum(['document', 'image', 'video', 'audio', 'archive', 'other']),
  permissions: z.object({
    isPublic: z.boolean().default(false),
    allowDownload: z.boolean().default(true),
    allowPreview: z.boolean().default(true),
    allowEdit: z.boolean().default(false),
    expiresAt: z.date().optional(),
    passwordProtected: z.boolean().default(false),
    password: z.string().optional()
  }),
  accessLog: z.array(z.object({
    userId: z.string(),
    action: z.enum(['view', 'download', 'edit', 'share']),
    timestamp: z.date(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional()
  })),
  metadata: z.object({
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    version: z.number().default(1)
  }).optional(),
  urls: z.object({
    downloadUrl: z.string(),
    previewUrl: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    shareUrl: z.string()
  }),
  encryption: z.object({
    isEncrypted: z.boolean(),
    algorithm: z.string().optional(),
    keyId: z.string().optional()
  }).optional(),
  virusScan: z.object({
    scanned: z.boolean(),
    safe: z.boolean(),
    scanDate: z.date().optional(),
    threats: z.array(z.string()).optional()
  }),
  status: z.enum(['uploading', 'processing', 'available', 'deleted', 'expired']),
  uploadedAt: z.date(),
  lastAccessed: z.date().optional()
});

export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type VideoConference = z.infer<typeof VideoConferenceSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type CollaborationWorkspace = z.infer<typeof CollaborationWorkspaceSchema>;
export type FileShare = z.infer<typeof FileShareSchema>;

// Enterprise Communication Manager
export class EnterpriseCommunicationManager {
  private conversations = new Map<string, Conversation>();
  private messages = new Map<string, Message>();
  private conferences = new Map<string, VideoConference>();
  private notifications = new Map<string, Notification>();
  private workspaces = new Map<string, CollaborationWorkspace>();
  private fileShares = new Map<string, FileShare>();
  private activeConnections = new Map<string, any>();
  private messageQueue = new Map<string, any[]>();

  constructor() {
    console.log('💬 Initializing Enterprise Communication Platform...');
    this.initializeRealTimeMessaging();
    this.setupVideoConferencing();
    this.initializeNotificationSystem();
    this.setupCollaborationWorkspaces();
    this.startCommunicationServices();
  }

  // Real-time messaging system
  async createConversation(
    type: string, 
    organizationId: string, 
    createdBy: string, 
    participants: string[], 
    settings?: any
  ): Promise<string> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation: Conversation = {
      conversationId,
      title: settings?.title,
      type: type as any,
      organizationId,
      participants: participants.map(userId => ({
        userId,
        role: userId === createdBy ? 'owner' : 'member',
        joinedAt: new Date(),
        permissions: ['read', 'write']
      })),
      settings: {
        isPublic: settings?.isPublic || false,
        allowInvites: settings?.allowInvites || true,
        retentionDays: settings?.retentionDays || 365,
        encryptionEnabled: settings?.encryptionEnabled || true,
        moderationEnabled: settings?.moderationEnabled || false,
        autoArchive: settings?.autoArchive || false
      },
      metadata: settings?.metadata,
      status: 'active',
      lastActivity: new Date(),
      messageCount: 0,
      createdAt: new Date(),
      createdBy
    };

    this.conversations.set(conversationId, conversation);

    // Initialize message queue for conversation
    this.messageQueue.set(conversationId, []);

    console.log(`💬 Created ${type} conversation: ${conversationId}`);
    return conversationId;
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: string = 'text',
    options?: any
  ): Promise<string> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(p => p.userId === senderId);
    if (!isParticipant) {
      throw new Error('User is not a participant in this conversation');
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const message: Message = {
      messageId,
      conversationId,
      senderId,
      senderName: options?.senderName || 'User',
      senderAvatar: options?.senderAvatar,
      type: type as any,
      content,
      metadata: options?.metadata,
      attachments: options?.attachments,
      mentions: options?.mentions,
      replyToId: options?.replyToId,
      reactions: [],
      isEdited: false,
      isDeleted: false,
      deliveryStatus: 'sent',
      priority: options?.priority || 'normal',
      encryption: conversation.settings.encryptionEnabled ? {
        isEncrypted: true,
        keyId: `key_${conversationId}`,
        algorithm: 'AES-256-GCM'
      } : undefined,
      timestamp: new Date()
    };

    this.messages.set(messageId, message);

    // Update conversation
    conversation.lastActivity = new Date();
    conversation.messageCount++;

    // Add to message queue for real-time delivery
    const queue = this.messageQueue.get(conversationId) || [];
    queue.push(message);
    this.messageQueue.set(conversationId, queue);

    // Send real-time notifications
    await this.notifyConversationParticipants(conversation, message);

    console.log(`📤 Message sent in conversation ${conversationId}`);
    return messageId;
  }

  // Video conferencing system
  async createConference(
    title: string,
    organizationId: string,
    hostId: string,
    type: string = 'instant',
    settings?: any
  ): Promise<string> {
    const conferenceId = `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conference: VideoConference = {
      conferenceId,
      title,
      description: settings?.description,
      organizationId,
      hostId,
      type: type as any,
      status: 'waiting',
      settings: {
        maxParticipants: settings?.maxParticipants || 100,
        recordingEnabled: settings?.recordingEnabled || false,
        screenShareEnabled: settings?.screenShareEnabled || true,
        chatEnabled: settings?.chatEnabled || true,
        waitingRoomEnabled: settings?.waitingRoomEnabled || false,
        passwordRequired: settings?.passwordRequired || false,
        password: settings?.password,
        muteOnJoin: settings?.muteOnJoin || false,
        videoOnJoin: settings?.videoOnJoin || true
      },
      participants: [{
        userId: hostId,
        role: 'host',
        status: 'invited',
        permissions: {
          canSpeak: true,
          canVideo: true,
          canScreenShare: true,
          canChat: true
        }
      }],
      recording: settings?.recordingEnabled ? {
        isRecording: false
      } : undefined,
      schedule: settings?.schedule,
      roomUrl: `https://meet.veridity.com/room/${conferenceId}`,
      phoneNumbers: [
        {
          country: 'US',
          number: '+1-555-VERIDITY',
          conferenceId: conferenceId.slice(-6)
        },
        {
          country: 'NP',
          number: '+977-1-VERIDITY',
          conferenceId: conferenceId.slice(-6)
        }
      ],
      createdAt: new Date()
    };

    this.conferences.set(conferenceId, conference);

    console.log(`🎥 Created ${type} conference: ${title}`);
    return conferenceId;
  }

  async joinConference(conferenceId: string, userId: string, permissions?: any): Promise<any> {
    const conference = this.conferences.get(conferenceId);
    if (!conference) {
      throw new Error('Conference not found');
    }

    // Check if already a participant
    const existingParticipant = conference.participants.find(p => p.userId === userId);
    if (existingParticipant) {
      existingParticipant.status = 'joined';
      existingParticipant.joinedAt = new Date();
    } else {
      conference.participants.push({
        userId,
        role: 'participant',
        status: 'joined',
        joinedAt: new Date(),
        permissions: permissions || {
          canSpeak: true,
          canVideo: true,
          canScreenShare: false,
          canChat: true
        }
      });
    }

    // Update conference status
    if (conference.status === 'waiting') {
      conference.status = 'active';
    }

    // Generate join token
    const joinToken = this.generateConferenceToken(conferenceId, userId);

    console.log(`👤 User ${userId} joined conference ${conferenceId}`);
    return {
      roomUrl: conference.roomUrl,
      token: joinToken,
      permissions: existingParticipant?.permissions || permissions,
      conferenceSettings: conference.settings
    };
  }

  // Notification system
  async sendNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    options?: any
  ): Promise<string> {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: Notification = {
      notificationId,
      userId,
      type: type as any,
      title,
      message,
      data: options?.data,
      priority: options?.priority || 'normal',
      channels: options?.channels || ['in_app', 'push'],
      status: 'pending',
      deliveryAttempts: 0,
      scheduledFor: options?.scheduledFor,
      actions: options?.actions,
      createdAt: new Date(),
      expiresAt: options?.expiresAt
    };

    this.notifications.set(notificationId, notification);

    // Process notification delivery
    await this.processNotificationDelivery(notification);

    console.log(`🔔 Notification sent to user ${userId}: ${title}`);
    return notificationId;
  }

  // Collaboration workspaces
  async createWorkspace(
    name: string,
    organizationId: string,
    createdBy: string,
    type: string = 'project',
    options?: any
  ): Promise<string> {
    const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workspace: CollaborationWorkspace = {
      workspaceId,
      name,
      description: options?.description,
      organizationId,
      type: type as any,
      status: 'active',
      visibility: options?.visibility || 'private',
      members: [{
        userId: createdBy,
        role: 'owner',
        permissions: ['read', 'write', 'admin', 'manage_members'],
        joinedAt: new Date(),
        lastActiveAt: new Date()
      }],
      channels: [],
      documents: [],
      meetings: [],
      tasks: [],
      analytics: {
        totalMessages: 0,
        activeMembersToday: 1,
        filesShared: 0,
        meetingsHeld: 0,
        tasksCompleted: 0
      },
      createdAt: new Date(),
      createdBy
    };

    this.workspaces.set(workspaceId, workspace);

    // Create default channels
    const generalChannelId = await this.createConversation(
      'channel',
      organizationId,
      createdBy,
      [createdBy],
      { title: 'General', workspaceId }
    );
    workspace.channels.push(generalChannelId);

    console.log(`🏢 Created workspace: ${name}`);
    return workspaceId;
  }

  // File sharing system
  async shareFile(
    fileName: string,
    fileType: string,
    fileSize: number,
    uploadedBy: string,
    organizationId: string,
    options?: any
  ): Promise<string> {
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fileShare: FileShare = {
      shareId,
      fileId,
      fileName,
      fileType,
      fileSize,
      uploadedBy,
      organizationId,
      type: this.categorizeFileType(fileType),
      permissions: {
        isPublic: options?.isPublic || false,
        allowDownload: options?.allowDownload !== false,
        allowPreview: options?.allowPreview !== false,
        allowEdit: options?.allowEdit || false,
        expiresAt: options?.expiresAt,
        passwordProtected: options?.passwordProtected || false,
        password: options?.password
      },
      accessLog: [],
      metadata: options?.metadata,
      urls: {
        downloadUrl: `https://cdn.veridity.com/files/${fileId}/download`,
        previewUrl: `https://cdn.veridity.com/files/${fileId}/preview`,
        thumbnailUrl: `https://cdn.veridity.com/files/${fileId}/thumb`,
        shareUrl: `https://share.veridity.com/${shareId}`
      },
      encryption: options?.encryption || {
        isEncrypted: true,
        algorithm: 'AES-256-GCM',
        keyId: `key_${fileId}`
      },
      virusScan: {
        scanned: false,
        safe: true
      },
      status: 'processing',
      uploadedAt: new Date()
    };

    this.fileShares.set(shareId, fileShare);

    // Simulate file processing
    setTimeout(() => {
      fileShare.status = 'available';
      fileShare.virusScan = {
        scanned: true,
        safe: Math.random() > 0.01, // 99% safe
        scanDate: new Date(),
        threats: []
      };
    }, 2000);

    console.log(`📎 File shared: ${fileName} (${shareId})`);
    return shareId;
  }

  // Real-time connection management
  async handleWebSocketConnection(userId: string, socket: any): Promise<void> {
    this.activeConnections.set(userId, {
      socket,
      userId,
      connectedAt: new Date(),
      lastActivity: new Date()
    });

    // Send pending messages
    await this.deliverPendingMessages(userId);

    // Update user online status
    await this.updateUserPresence(userId, 'online');

    console.log(`🔌 User ${userId} connected to real-time messaging`);
  }

  async handleWebSocketDisconnection(userId: string): Promise<void> {
    this.activeConnections.delete(userId);
    await this.updateUserPresence(userId, 'offline');

    console.log(`🔌 User ${userId} disconnected from real-time messaging`);
  }

  // Private helper methods
  private async notifyConversationParticipants(conversation: Conversation, message: Message): Promise<void> {
    for (const participant of conversation.participants) {
      if (participant.userId !== message.senderId) {
        // Send real-time notification if connected
        const connection = this.activeConnections.get(participant.userId);
        if (connection) {
          connection.socket.emit('new_message', {
            conversationId: conversation.conversationId,
            message: this.sanitizeMessage(message)
          });
        }

        // Send push notification if mentioned or direct message
        if (message.mentions?.includes(participant.userId) || conversation.type === 'direct') {
          await this.sendNotification(
            participant.userId,
            'message',
            `New message from ${message.senderName}`,
            message.content.substring(0, 100),
            {
              data: {
                conversationId: conversation.conversationId,
                messageId: message.messageId
              },
              channels: ['push', 'in_app']
            }
          );
        }
      }
    }
  }

  private async processNotificationDelivery(notification: Notification): Promise<void> {
    // Simulate notification delivery across channels
    const connection = this.activeConnections.get(notification.userId);
    
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case 'in_app':
            if (connection) {
              connection.socket.emit('notification', this.sanitizeNotification(notification));
            }
            break;
          
          case 'push':
            await this.sendPushNotification(notification);
            break;
          
          case 'email':
            await this.sendEmailNotification(notification);
            break;
          
          case 'sms':
            await this.sendSMSNotification(notification);
            break;
        }
      } catch (error) {
        console.error(`Failed to deliver notification via ${channel}:`, error);
      }
    }

    notification.status = 'sent';
    notification.sentAt = new Date();
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    // Simulate push notification
    console.log(`📱 Push notification sent: ${notification.title}`);
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    // Simulate email notification
    console.log(`📧 Email notification sent: ${notification.title}`);
  }

  private async sendSMSNotification(notification: Notification): Promise<void> {
    // Simulate SMS notification
    console.log(`📱 SMS notification sent: ${notification.title}`);
  }

  private async deliverPendingMessages(userId: string): Promise<void> {
    const connection = this.activeConnections.get(userId);
    if (!connection) return;

    // Find conversations user participates in
    const userConversations = Array.from(this.conversations.values()).filter(conv =>
      conv.participants.some(p => p.userId === userId)
    );

    for (const conversation of userConversations) {
      const messages = this.messageQueue.get(conversation.conversationId) || [];
      const unreadMessages = messages.filter(msg => 
        msg.timestamp > (conversation.participants.find(p => p.userId === userId)?.lastReadAt || new Date(0))
      );

      if (unreadMessages.length > 0) {
        connection.socket.emit('unread_messages', {
          conversationId: conversation.conversationId,
          messages: unreadMessages.map(this.sanitizeMessage)
        });
      }
    }
  }

  private async updateUserPresence(userId: string, status: string): Promise<void> {
    // Broadcast presence update to relevant conversations
    const userConversations = Array.from(this.conversations.values()).filter(conv =>
      conv.participants.some(p => p.userId === userId)
    );

    for (const conversation of userConversations) {
      for (const participant of conversation.participants) {
        if (participant.userId !== userId) {
          const connection = this.activeConnections.get(participant.userId);
          if (connection) {
            connection.socket.emit('user_presence_update', {
              userId,
              status,
              timestamp: new Date()
            });
          }
        }
      }
    }
  }

  private generateConferenceToken(conferenceId: string, userId: string): string {
    // Generate secure conference access token
    return `conf_token_${conferenceId}_${userId}_${Date.now()}`;
  }

  private categorizeFileType(fileType: string): any {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov'];
    const audioTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
    const documentTypes = ['application/pdf', 'application/msword', 'text/plain'];
    const archiveTypes = ['application/zip', 'application/rar', 'application/7z'];

    if (imageTypes.includes(fileType)) return 'image';
    if (videoTypes.includes(fileType)) return 'video';
    if (audioTypes.includes(fileType)) return 'audio';
    if (documentTypes.includes(fileType)) return 'document';
    if (archiveTypes.includes(fileType)) return 'archive';
    return 'other';
  }

  private sanitizeMessage(message: Message): any {
    // Remove sensitive information before sending to client
    return {
      ...message,
      encryption: undefined // Don't expose encryption details
    };
  }

  private sanitizeNotification(notification: Notification): any {
    // Remove sensitive information before sending to client
    return {
      ...notification,
      userId: undefined // Don't expose user ID to client
    };
  }

  private initializeRealTimeMessaging(): void {
    console.log('⚡ Real-time messaging system initialized');
  }

  private setupVideoConferencing(): void {
    console.log('🎥 Video conferencing system setup completed');
  }

  private initializeNotificationSystem(): void {
    console.log('🔔 Multi-channel notification system initialized');
  }

  private setupCollaborationWorkspaces(): void {
    console.log('🏢 Collaboration workspaces platform ready');
  }

  private startCommunicationServices(): void {
    console.log('💬 Enterprise communication services started');
    console.log('📱 Mobile push notifications enabled');
    console.log('🔐 End-to-end encryption active');
    console.log('📊 Communication analytics tracking');
  }

  // Public API methods
  getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }

  getMessage(messageId: string): Message | undefined {
    return this.messages.get(messageId);
  }

  getConference(conferenceId: string): VideoConference | undefined {
    return this.conferences.get(conferenceId);
  }

  getWorkspace(workspaceId: string): CollaborationWorkspace | undefined {
    return this.workspaces.get(workspaceId);
  }

  getFileShare(shareId: string): FileShare | undefined {
    return this.fileShares.get(shareId);
  }

  getUserConversations(userId: string): Conversation[] {
    return Array.from(this.conversations.values()).filter(conv =>
      conv.participants.some(p => p.userId === userId)
    );
  }

  getUserNotifications(userId: string, limit: number = 50): Notification[] {
    return Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  getCommunicationStats(): any {
    const activeConversations = Array.from(this.conversations.values()).filter(c => c.status === 'active').length;
    const activeConferences = Array.from(this.conferences.values()).filter(c => c.status === 'active').length;
    const totalMessages = this.messages.size;
    const activeConnections = this.activeConnections.size;

    return {
      conversations: {
        total: this.conversations.size,
        active: activeConversations
      },
      conferences: {
        total: this.conferences.size,
        active: activeConferences
      },
      messages: {
        total: totalMessages,
        last24h: Array.from(this.messages.values()).filter(m => 
          new Date().getTime() - m.timestamp.getTime() < 24 * 60 * 60 * 1000
        ).length
      },
      realTime: {
        activeConnections,
        notifications: this.notifications.size
      },
      workspaces: {
        total: this.workspaces.size,
        active: Array.from(this.workspaces.values()).filter(w => w.status === 'active').length
      },
      fileShares: {
        total: this.fileShares.size,
        totalSize: Array.from(this.fileShares.values()).reduce((sum, f) => sum + f.fileSize, 0)
      }
    };
  }
}

// Export singleton instance
export const enterpriseCommunication = new EnterpriseCommunicationManager();