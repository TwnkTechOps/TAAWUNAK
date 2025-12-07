import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '../../services/prisma.service';

interface MLModel {
  evaluateProposal(proposal: any): Promise<any>;
  predictRisks(project: any): Promise<any>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private mlModel: MLModel | null = null;
  private useML: boolean;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {
    // Check if ML model is configured
    this.useML = this.config.get('AI_USE_ML') === 'true';
    this.initializeMLModel();
  }

  private async initializeMLModel() {
    if (!this.useML) {
      this.logger.log('Using rule-based AI evaluation');
      return;
    }

    try {
      // Try to load ML model (OpenAI, local model, etc.)
      const modelType = this.config.get('AI_MODEL_TYPE') || 'openai';
      
      if (modelType === 'openai') {
        const apiKey = this.config.get('OPENAI_API_KEY');
        if (apiKey) {
          // Initialize OpenAI model
          this.mlModel = await this.createOpenAIModel(apiKey);
          this.logger.log('OpenAI model initialized');
        }
      } else if (modelType === 'local') {
        // Initialize local ML model
        this.mlModel = await this.createLocalModel();
        this.logger.log('Local ML model initialized');
      }
    } catch (error) {
      this.logger.warn('Failed to initialize ML model, falling back to rule-based', error);
      this.mlModel = null;
    }
  }

  private async createOpenAIModel(apiKey: string): Promise<MLModel> {
    // OpenAI integration structure
    return {
      evaluateProposal: async (proposal: any) => {
        try {
          // Use OpenAI API for evaluation
          // const response = await openai.chat.completions.create({...});
          // For now, fallback to rule-based
          return this.ruleBasedEvaluation(proposal);
        } catch (error) {
          this.logger.error('OpenAI evaluation failed', error);
          return this.ruleBasedEvaluation(proposal);
        }
      },
      predictRisks: async (project: any) => {
        try {
          // Use OpenAI API for risk prediction
          // const response = await openai.chat.completions.create({...});
          // For now, fallback to rule-based
          return this.ruleBasedRiskDetection(project);
        } catch (error) {
          this.logger.error('OpenAI risk prediction failed', error);
          return this.ruleBasedRiskDetection(project);
        }
      },
    };
  }

  private async createLocalModel(): Promise<MLModel> {
    // Local ML model integration structure
    return {
      evaluateProposal: async (proposal: any) => {
        // Load and use local ML model
        // For now, fallback to rule-based
        return this.ruleBasedEvaluation(proposal);
      },
      predictRisks: async (project: any) => {
        // Load and use local ML model
        // For now, fallback to rule-based
        return this.ruleBasedRiskDetection(project);
      },
    };
  }

  async evaluateProposal(proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: {id: proposalId},
      include: {project: true}
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Use ML model if available, otherwise use rule-based
    if (this.mlModel) {
      try {
        return await this.mlModel.evaluateProposal(proposal);
      } catch (error) {
        this.logger.warn('ML evaluation failed, using rule-based fallback', error);
      }
    }

    return this.ruleBasedEvaluation(proposal);
  }

  private ruleBasedEvaluation(proposal: any) {
    const contentLength = proposal.content.length;
    const hasKeywords = this.checkKeywords(proposal.content);
    const trlScore = this.evaluateTRL(proposal.trl);

    const completeness = Math.min(100, (contentLength / 2000) * 100);
    const relevance = hasKeywords ? 85 : 60;
    const alignment = trlScore;

    // Enhanced evaluation with quality, innovation, and feasibility scores
    const qualityScore = this.evaluateQuality(proposal);
    const innovationScore = this.evaluateInnovation(proposal);
    const feasibilityScore = this.evaluateFeasibility(proposal);
    const alignmentScore = this.evaluateAlignment(proposal);

    const overallScore = (qualityScore * 0.3 + innovationScore * 0.3 + feasibilityScore * 0.25 + alignmentScore * 0.15);

    return {
      proposalId: proposal.id,
      overallScore: Math.round(overallScore),
      qualityScore: Math.round(qualityScore),
      innovationScore: Math.round(innovationScore),
      feasibilityScore: Math.round(feasibilityScore),
      alignmentScore: Math.round(alignmentScore),
      method: 'rule-based',
      factors: [
        {
          factor: 'quality',
          weight: 0.3,
          value: Math.round(qualityScore),
          description: 'Proposal quality based on completeness, clarity, and methodology'
        },
        {
          factor: 'innovation',
          weight: 0.3,
          value: Math.round(innovationScore),
          description: 'Innovation potential and novelty of the research approach'
        },
        {
          factor: 'feasibility',
          weight: 0.25,
          value: Math.round(feasibilityScore),
          description: 'Feasibility based on resources, timeline, and TRL level'
        },
        {
          factor: 'alignment',
          weight: 0.15,
          value: Math.round(alignmentScore),
          description: hasKeywords
            ? 'Alignment with national priorities and strategic goals'
            : 'Limited alignment with national priorities'
        }
      ],
      suggestions: [
        ...(contentLength < 1000 ? ['Consider expanding proposal content with more details'] : []),
        ...(!hasKeywords ? ['Add keywords related to national priorities (AI, innovation, sustainability)'] : []),
        ...(proposal.trl < 4 ? ['Consider increasing TRL level for better funding eligibility'] : []),
        ...(qualityScore < 70 ? ['Enhance proposal quality with detailed methodology and clear objectives'] : []),
        ...(innovationScore < 70 ? ['Highlight innovative aspects and unique value proposition'] : []),
        ...(feasibilityScore < 70 ? ['Provide detailed resource requirements and risk mitigation strategies'] : [])
      ],
      checklist: {
        hasObjectives: contentLength > 500,
        hasMethodology: proposal.content.toLowerCase().includes('method') || proposal.content.toLowerCase().includes('approach'),
        hasTimeline: proposal.content.toLowerCase().includes('timeline') || proposal.content.toLowerCase().includes('schedule'),
        hasBudget: proposal.content.toLowerCase().includes('budget') || proposal.content.toLowerCase().includes('cost'),
        hasImpact: proposal.content.toLowerCase().includes('impact') || proposal.content.toLowerCase().includes('outcome')
      }
    };
  }

  private evaluateQuality(proposal: any): number {
    const contentLength = proposal.content.length;
    const hasMethodology = proposal.content.toLowerCase().includes('method') || proposal.content.toLowerCase().includes('approach');
    const hasTimeline = proposal.content.toLowerCase().includes('timeline') || proposal.content.toLowerCase().includes('schedule');
    const hasBudget = proposal.content.toLowerCase().includes('budget') || proposal.content.toLowerCase().includes('cost');
    const hasImpact = proposal.content.toLowerCase().includes('impact') || proposal.content.toLowerCase().includes('outcome');

    let score = 50; // Base score

    // Content length (max 30 points)
    score += Math.min((contentLength / 2000) * 30, 30);

    // Required sections (max 20 points)
    if (hasMethodology) score += 5;
    if (hasTimeline) score += 5;
    if (hasBudget) score += 5;
    if (hasImpact) score += 5;

    return Math.min(100, score);
  }

  private evaluateInnovation(proposal: any): number {
    const content = proposal.content.toLowerCase();
    let score = 40; // Base score

    // Innovation keywords
    const innovationKeywords = ['innovative', 'novel', 'breakthrough', 'cutting-edge', 'pioneering', 'revolutionary', 'advanced', 'state-of-the-art'];
    const foundKeywords = innovationKeywords.filter(keyword => content.includes(keyword));
    score += foundKeywords.length * 8;

    // TRL level (higher TRL = more innovative in some contexts)
    if (proposal.trl >= 6) score += 20;
    else if (proposal.trl >= 4) score += 10;

    return Math.min(100, score);
  }

  private evaluateFeasibility(proposal: any): number {
    const content = proposal.content.toLowerCase();
    let score = 50; // Base score

    // TRL level (higher TRL = more feasible)
    score += proposal.trl * 5;

    // Resource mentions
    if (content.includes('resource') || content.includes('budget') || content.includes('funding')) {
      score += 15;
    }

    // Risk mitigation
    if (content.includes('risk') && (content.includes('mitigation') || content.includes('manage'))) {
      score += 15;
    }

    return Math.min(100, score);
  }

  private evaluateAlignment(proposal: any): number {
    const hasKeywords = this.checkKeywords(proposal.content);
    let score = hasKeywords ? 70 : 40;

    // Strategic alignment keywords
    const strategicKeywords = ['vision 2030', 'national', 'strategic', 'priority', 'sustainable', 'digital transformation'];
    const content = proposal.content.toLowerCase();
    const foundKeywords = strategicKeywords.filter(keyword => content.includes(keyword));
    score += foundKeywords.length * 5;

    return Math.min(100, score);
  }

  async detectRisks(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: {id: projectId},
      include: {
        milestones: {
          include: {tasks: true}
        }
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Use ML model if available, otherwise use rule-based
    if (this.mlModel) {
      try {
        const mlRisks = await this.mlModel.predictRisks(project);
        return {
          ...mlRisks,
          method: 'ml',
          projectId,
          detectedAt: new Date().toISOString()
        };
      } catch (error) {
        this.logger.warn('ML risk detection failed, using rule-based fallback', error);
      }
    }

    return this.ruleBasedRiskDetection(project, projectId);
  }

  private ruleBasedRiskDetection(project: any, projectId?: string) {
    const risks = [];
    const pid = projectId || project.id;

    // Check for overdue milestones
    const now = new Date();
    const overdueMilestones = project.milestones.filter(
      (m: any) => m.dueDate && new Date(m.dueDate) < now && m.status !== 'DONE'
    );

    if (overdueMilestones.length > 0) {
      risks.push({
        type: 'DELAY',
        severity: 'HIGH',
        detectedBy: 'AI',
        description: `${overdueMilestones.length} milestone(s) are overdue`,
        suggestedAction: 'Review milestone deadlines and adjust timeline if necessary'
      });
    }

    // Check for incomplete tasks
    const totalTasks = project.milestones.reduce(
      (sum: number, m: any) => sum + ((m as any).tasks?.length ?? 0),
      0
    );
    const completedTasks = project.milestones.reduce(
      (sum: number, m: any) =>
        sum + ((m as any).tasks.filter((t: any) => t.status === 'COMPLETED').length || 0),
      0
    );

    if (totalTasks > 0 && completedTasks / totalTasks < 0.5) {
      risks.push({
        type: 'RESOURCE',
        severity: 'MEDIUM',
        detectedBy: 'AI',
        description: `Only ${Math.round((completedTasks / totalTasks) * 100)}% of tasks completed`,
        suggestedAction: 'Review task assignments and provide additional resources if needed'
      });
    }

    // Check for milestones without tasks
    const milestonesWithoutTasks = project.milestones.filter((m: any) => (m as any).tasks.length === 0);
    if (milestonesWithoutTasks.length > 0) {
      risks.push({
        type: 'QUALITY',
        severity: 'LOW',
        detectedBy: 'AI',
        description: `${milestonesWithoutTasks.length} milestone(s) have no tasks defined`,
        suggestedAction: 'Break down milestones into actionable tasks'
      });
    }

    return {
      projectId: pid,
      risks,
      riskLevel: risks.length > 0 ? (risks.some(r => r.severity === 'HIGH') ? 'HIGH' : 'MEDIUM') : 'LOW',
      method: 'rule-based',
      detectedAt: new Date().toISOString()
    };
  }

  private checkKeywords(content: string): boolean {
    const keywords = ['ai', 'innovation', 'sustainability', 'research', 'development', 'technology', 'digital'];
    const lowerContent = content.toLowerCase();
    return keywords.some(keyword => lowerContent.includes(keyword));
  }

  private evaluateTRL(trl: number): number {
    // TRL 1-3: 40-60, TRL 4-6: 60-80, TRL 7-9: 80-100
    if (trl <= 3) return 50;
    if (trl <= 6) return 70;
    return 90;
  }
}
