export const analyticsService = {
  track: (eventName: string, payload?: Record<string, unknown>) => {
    console.log('Analytics event:', eventName, payload);
  },
};
