import { defineStore } from 'pinia';

interface Proof {
  id: number;
  email: string;
  filename: string;
  date: string;
  status: string;
}

export const useProofStore = defineStore('proof', {
  state: () => ({
    proofs: [] as Proof[]
  }),
  actions: {
    addProof(email: string, files: File[]) {
      const now = new Date().toISOString().split('T')[0];
      files.forEach(file => {
        this.proofs.push({
          id: Date.now() + Math.random(),
          email,
          filename: file.name,
          date: now,
          status: '审核中'
        });
      });
    }
  }
});
