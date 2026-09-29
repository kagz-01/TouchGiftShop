import re

with open('components/home/SuperpowersStrip.tsx', 'r') as f:
    content = f.read()

missing_code = """function useActiveScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, on };
}

function FeatureCard({
  title, desc, cta, href, delay, children,
}: { title: string; desc: string; cta: string; href: string; delay: number; children: React.ReactNode }) {
  return (
    <div className="h-full">
      <Link
        href={href}
        style={{ transitionDelay: `${delay}ms` }}
        className="sp-card card-theme shape-premium-card group flex h-full flex-col gap-3 p-4 pb-5 overflow-hidden transition-transform duration-500 hover:-translate-y-1.5"
      >
        {children}
        <h3 className="font-display text-[17px] font-semibold leading-snug text-theme-heading">
          {title}
        </h3>
        <p className="text-[12.5px] leading-relaxed text-theme-body">{desc}</p>
        <span className="sp-go mt-auto inline-flex items-center gap-1.5 text-[11.5px] font-semibold">
          {cta} <Arrow />
        </span>
      </Link>
    </div>
  );
}

/* 1 — Pool a Gift */"""

# Replace the first comment to inject the missing code before it
content = content.replace("/* 1 — Pool a Gift */", missing_code)

with open('components/home/SuperpowersStrip.tsx', 'w') as f:
    f.write(content)

print("Fixed successfully")
