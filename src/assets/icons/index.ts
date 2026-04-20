import HomeIcon from './home';
import MarketIcon from './market';
import DealsIcon from './deals';
import ProfileIcon from './profile';
import NotificationIcon from './notification';

export const ICONS = {
  home: HomeIcon,
  market: MarketIcon,
  deals: DealsIcon,
  profile: ProfileIcon,
  notification: NotificationIcon,
} as const;

export type IconName = keyof typeof ICONS;
