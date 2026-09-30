export const api = {
  askAssistant: async (question: string, context: any) => {
    return new Promise<{ response: string }>((resolve) => {
      setTimeout(() => {
        resolve({ response: `I am an AI assistant. You asked: ${question} with context ${JSON.stringify(context)}` });
      }, 1000);
    });
  },
  whatIf: async (inputs: any) => {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({
          shelfLife: 21,
          deltaPercentage: 50
        });
      }, 500);
    });
  }
};
