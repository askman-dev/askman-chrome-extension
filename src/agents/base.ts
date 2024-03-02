export interface BaseAgent {}

export class AgentManager {
  private baseAgentList: BaseAgent[] = [];
  public constructor() {}

  public addAgent(agent: BaseAgent) {
    this.baseAgentList.push(agent);
  }
}
