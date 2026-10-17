/** Re-mounts on every navigation, giving each page a soft CSS entrance (no JS needed to become visible). */
export default function PortalTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
