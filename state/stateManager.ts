export interface PendingRequest {
  type: 'SEND_SOL' | 'SEND_TOKEN' | 'IMPORT_WALLET';
  amount?: number;
  to?: string;
}

export class StateManager {
  private pendingRequests: Record<string, PendingRequest> = {};

  setPendingRequest(userId: number, request: PendingRequest): void {
    this.pendingRequests[userId] = request;
  }

  getPendingRequest(userId: number): PendingRequest | undefined {
    return this.pendingRequests[userId];
  }

  updatePendingRequest(userId: number, updates: Partial<PendingRequest>): void {
    if (this.pendingRequests[userId]) {
      this.pendingRequests[userId] = {
        ...this.pendingRequests[userId],
        ...updates,
      };
    }
  }

  clearPendingRequest(userId: number): void {
    delete this.pendingRequests[userId];
  }

  hasPendingRequest(userId: number): boolean {
    return userId in this.pendingRequests;
  }
}

export const stateManager = new StateManager();