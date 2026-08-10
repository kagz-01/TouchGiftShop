export default function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full mx-auto px-4 md:px-8 ${className}`}>{children}</div>
  );
}
