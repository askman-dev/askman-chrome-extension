import { QuoteAgent } from './quote';

export interface BaseAgent {}

export class AgentManager {
  private static instance: AgentManager;
  private baseAgentList: BaseAgent[] = [];
  private constructor() {}
  public static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
      AgentManager.instance.addAgent(new QuoteAgent());
    }
    return AgentManager.instance;
  }

  public addAgent(agent: BaseAgent) {
    this.baseAgentList.push(agent);
  }
}
