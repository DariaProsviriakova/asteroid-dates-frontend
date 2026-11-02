type IconName = 'orbit' | 'feed' | 'grid' | 'plus' | 'user' | 'arrow' | 'heart' | 'search' | 'chevron' | 'play' | 'image';

const paths: Record<IconName, React.ReactNode> = {
  orbit: <><circle cx="12" cy="12" r="4" /><ellipse cx="12" cy="12" rx="11" ry="4.5" transform="rotate(-35 12 12)" /><circle cx="20" cy="5" r="1.5" fill="currentColor" stroke="none" /></>,
  feed: <><rect x="5" y="3" width="14" height="18" rx="3" /><path d="m10 9 5 3-5 3Z" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  plus: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  chevron: <path d="m9 5 7 7-7 7" />,
  play: <path d="m8 4 13 8-13 8Z" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 6-6 4 4 3-3 5 5" /></>,
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
