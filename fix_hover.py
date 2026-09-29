import re

with open('components/home/SuperpowersStrip.tsx', 'r') as f:
    content = f.read()

# 1. Remove useActiveScene hook
content = re.sub(r'function useActiveScene\(\) \{.*?\n\}\n', '', content, flags=re.DOTALL)

# 2. Update default export
content = content.replace('export default function SuperpowersStrip() {\n  const { ref, on } = useActiveScene();', 'export default function SuperpowersStrip() {')
content = content.replace('          ref={ref}\n          data-on={on ? "1" : "0"}', '')

# 3. Replace CSS
new_css = """      <style jsx global>{`
        /* ── 1 · pool ── */
        .sp-coin1-svg, .sp-coin2-svg, .sp-coin3-svg { opacity: 0; transform: translateY(-20px); }
        .group:hover .sp-coin1-svg { animation: sp-coindrop-svg 4s infinite; }
        .group:hover .sp-coin2-svg { animation: sp-coindrop-svg 4s infinite .45s; }
        .group:hover .sp-coin3-svg { animation: sp-coindrop-svg 4s infinite .9s; }
        @keyframes sp-coindrop-svg {
          0%, 4% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(-20px); }
          22% { opacity: 1; transform: translateY(40px); }
          28%, 100% { opacity: 0; transform: translateY(40px); }
        }
        
        .sp-potfill-svg { width: 40px; }
        .group:hover .sp-potfill-svg { animation: sp-potfill-svg 4s infinite; }
        @keyframes sp-potfill-svg {
          0%, 8% { width: 0; } 24% { width: 14px; } 52% { width: 26px; }
          80% { width: 40px; } 100% { width: 0; }
        }
        
        .sp-potgift-svg { transform-origin: 90px 88px; opacity: 1; transform: scale(1.3); }
        .group:hover .sp-potgift-svg { animation: sp-potgift-svg 4s infinite; }
        @keyframes sp-potgift-svg {
          0%, 80% { opacity: 0; transform: scale(.6); }
          88%, 96% { opacity: 1; transform: scale(1.3); }
          100% { opacity: 0; transform: scale(.6); }
        }

        /* ── 2 · hamper ── */
        .sp-hi1, .sp-hi2, .sp-hi3 { opacity: 1; transform: translateY(40px); }
        .group:hover .sp-hi1 { animation: sp-hset-svg 4s infinite; }
        .group:hover .sp-hi2 { animation: sp-hset-svg 4s infinite .5s; }
        .group:hover .sp-hi3 { animation: sp-hset-svg 4s infinite 1s; }
        @keyframes sp-hset-svg {
          0%, 6% { opacity: 0; transform: translateY(-20px); }
          16%, 74% { opacity: 1; transform: translateY(40px); }
          86%, 100% { opacity: 0; transform: translateY(40px); }
        }
        
        .sp-ribbon-v, .sp-ribbon-h, .sp-ribbon-bow { stroke-dasharray: 100; stroke-dashoffset: 0; opacity: 1; }
        .group:hover .sp-ribbon-v, .group:hover .sp-ribbon-h, .group:hover .sp-ribbon-bow { animation: sp-ribbondraw-svg 4s infinite; }
        @keyframes sp-ribbondraw-svg {
          0%, 72% { stroke-dashoffset: 100; opacity: 0; }
          82% { opacity: 1; }
          92%, 96% { stroke-dashoffset: 0; opacity: 1; }
          100% { opacity: 0; }
        }

        /* ── 3 · finder ── */
        .sp-qbubble-svg { transform-origin: center; opacity: 1; transform: translateY(0); }
        .group:hover .sp-qbubble-svg { animation: sp-qb-svg 4s infinite; }
        @keyframes sp-qb-svg {
          0%, 4% { opacity: 0; transform: translateY(10px); }
          12%, 36% { opacity: 1; transform: translateY(0); }
          44%, 100% { opacity: 0; transform: translateY(-10px); }
        }
        
        .sp-chip-svg { transform-origin: 45px 72px; opacity: 1; transform: scale(1); }
        .group:hover .sp-chip-svg { animation: sp-chipin-svg 4s infinite; }
        @keyframes sp-chipin-svg {
          0%, 40% { opacity: 0; transform: scale(.7); }
          48%, 66% { opacity: 1; transform: scale(1); }
          74%, 100% { opacity: 0; transform: scale(.7); }
        }
        
        .sp-result-svg { transform-origin: center; opacity: 1; transform: translateX(0); }
        .group:hover .sp-result-svg { animation: sp-resultin-svg 4s infinite; }
        @keyframes sp-resultin-svg {
          0%, 64% { opacity: 0; transform: translateX(30px); }
          76%, 94% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(30px); }
        }
        
        .sp-rcheck-svg { opacity: 1; }
        .group:hover .sp-rcheck-svg { animation: sp-rcheck-svg 4s infinite; }
        @keyframes sp-rcheck-svg { 0%, 80% { opacity: 0; } 88%, 96% { opacity: 1; } 100% { opacity: 0; } }

        /* ── 4 · anonymous ── */
        .sp-knob-svg { transform: translateX(12px); }
        .group:hover .sp-knob-svg { animation: sp-knobmove-svg 3.2s infinite; }
        @keyframes sp-knobmove-svg { 0%, 15% { transform: translateX(0); } 55%, 100% { transform: translateX(12px); } }
        
        .sp-redact-svg { width: 54px; }
        .group:hover .sp-redact-svg { animation: sp-redact-svg 3.2s infinite; }
        @keyframes sp-redact-svg { 0%, 55% { width: 0; } 75%, 100% { width: 54px; } }
        
        .sp-anongift-svg { opacity: 1; transform: translateY(0); }
        .group:hover .sp-anongift-svg { animation: sp-anonin-svg 3.2s infinite; }
        @keyframes sp-anonin-svg { 0%, 55% { opacity: 0; transform: translateY(10px); } 75%, 100% { opacity: 1; transform: translateY(0); } }

        /* ── 5 · photo proof ── */
        .sp-shutter-svg { transform-origin: 116px 70px; opacity: 0; }
        .group:hover .sp-shutter-svg { animation: sp-shutterpulse-svg 3.6s infinite; }
        @keyframes sp-shutterpulse-svg {
          0%, 22% { opacity: 0; transform: scale(1); }
          30% { opacity: .9; transform: scale(.6); }
          38%, 100% { opacity: 0; transform: scale(1); }
        }
        
        .sp-flash-svg { opacity: 0; }
        .group:hover .sp-flash-svg { animation: sp-flash-svg 3.6s infinite; }
        @keyframes sp-flash-svg { 0%, 28% { opacity: 0; } 32% { opacity: .9; } 40%, 100% { opacity: 0; } }
        
        .sp-notif-svg { opacity: 1; transform: translateY(0); }
        .group:hover .sp-notif-svg { animation: sp-notifup-svg 3.6s infinite; }
        @keyframes sp-notifup-svg {
          0%, 44% { opacity: 0; transform: translateY(30px); }
          58%, 88% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(30px); }
        }

        /* ── 6 · gift cards ── */
        .sp-flip3d-svg { transform-style: preserve-3d; opacity: 1; transform: rotateY(0deg); }
        .group:hover .sp-flip3d-svg { animation: sp-flip-svg 4s infinite; }
        @keyframes sp-flip-svg { 0%, 20% { transform: rotateY(0deg); opacity: 1; } 45%, 100% { transform: rotateY(180deg); opacity: 0; } }
        
        .sp-flipback3d-svg { transform-style: preserve-3d; opacity: 0; transform: rotateY(-180deg); }
        .group:hover .sp-flipback3d-svg { animation: sp-flipback-svg 4s infinite; }
        @keyframes sp-flipback-svg { 0%, 20% { transform: rotateY(-180deg); opacity: 0; } 45%, 100% { transform: rotateY(0deg); opacity: 1; } }
        
        .sp-sendfly-svg { opacity: 0; }
        .group:hover .sp-sendfly-svg { animation: sp-sendfly-svg 4s infinite; }
        @keyframes sp-sendfly-svg { 0%, 50% { opacity: 0; transform: translateX(-20px); } 58% { opacity: 1; } 72%, 100% { opacity: 0; transform: translateX(30px); } }
        
        .sp-pcheck-svg { opacity: 1; }
        .group:hover .sp-pcheck-svg { animation: sp-pcheck-svg 4s infinite; }
        @keyframes sp-pcheck-svg { 0%, 72% { opacity: 0; } 80%, 96% { opacity: 1; } 100% { opacity: 0; } }

        /* ── 7 · subscriptions ── */
        .sp-datepulse-svg { transform-origin: 52px 55px; transform: scale(1); }
        .group:hover .sp-datepulse-svg { animation: sp-datepulse-svg 4s infinite; }
        @keyframes sp-datepulse-svg {
          0%, 45% { transform: scale(1); }
          52% { transform: scale(1.4); }
          60%, 100% { transform: scale(1); }
        }
        
        .sp-autospin-svg { transform-origin: 118px 43px; }
        .group:hover .sp-autospin-svg { animation: sp-autospin-svg 3s linear infinite; }
        @keyframes sp-autospin-svg { to { transform: rotate(360deg); } }
        
        .sp-sub1-svg, .sp-sub2-svg { opacity: 1; transform: translateY(0) scale(1); }
        .group:hover .sp-sub1-svg { animation: sp-submicro-svg 4s infinite; }
        .group:hover .sp-sub2-svg { animation: sp-submicro-svg 4s infinite .6s; }
        @keyframes sp-submicro-svg {
          0%, 45% { opacity: 0; transform: translateY(-10px) scale(.6); }
          55%, 75% { opacity: 1; transform: translateY(0) scale(1); }
          85%, 100% { opacity: 0; transform: translateY(10px) scale(.6); }
        }

        /* ── 8 · rewards ── */
        .sp-linkfill-svg { width: 80px; }
        .group:hover .sp-linkfill-svg { animation: sp-linkfill-svg 4s infinite; }
        @keyframes sp-linkfill-svg { 0%, 10% { width: 0; } 55%, 100% { width: 80px; } }
        
        .sp-plane-svg { opacity: 0; }
        .group:hover .sp-plane-svg { animation: sp-plane-svg 4s infinite; }
        @keyframes sp-plane-svg {
          0%, 10% { opacity: 0; transform: translateX(0); }
          20% { opacity: 1; }
          55% { opacity: 1; transform: translateX(65px); }
          62%, 100% { opacity: 0; transform: translateX(65px); }
        }
        
        .sp-pts1-svg, .sp-pts2-svg { opacity: 1; transform: translateY(0); }
        .group:hover .sp-pts1-svg { animation: sp-pts1-svg 4s infinite; }
        .group:hover .sp-pts2-svg { animation: sp-pts2-svg 4s infinite; }
        @keyframes sp-pts1-svg {
          0%, 58% { opacity: 0; transform: translateY(10px); }
          68%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes sp-pts2-svg {
          0%, 60% { opacity: 0; transform: translateY(10px); }
          70%, 92% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }

        /* the "go" affordance is brand-coloured, so lift it in dark */
        .sp-go { color: #9B1B5A; }
        [data-theme="dark"] .sp-go { color: #F9A8C8; }
        [data-theme="dark"] .sp-go svg { stroke: #F9A8C8; }

        @media (prefers-reduced-motion: reduce) {
          .sp * { animation: none !important; }
        }
      `}</style>"""

start_css = content.find('      <style jsx global>{`')
end_css = content.find('    </section>')
if start_css != -1 and end_css != -1:
    content = content[:start_css] + new_css + "\n" + content[end_css:]

with open('components/home/SuperpowersStrip.tsx', 'w') as f:
    f.write(content)

print("Updated hover successfully")
