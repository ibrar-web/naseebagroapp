import { getSession, saveSession } from './sessionService';

export const updateAccessToken = async (accessToken: string) => {
  const session = await getSession();
  if (!session) return;
  await saveSession({ ...session, accessToken });
};
