import re

# 1. Update StorytellingHome.tsx
with open("components/home/StorytellingHome.tsx", "r") as f:
    content = f.read()

# Problem Section Cards - Asymmetrical Shape + Italics
content = content.replace("p-5 md:p-6 rounded-[1.5rem]", "p-6 md:p-8 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-xl rounded-bl-xl")
content = content.replace("text-2xl font-display font-bold mb-3", "text-2xl font-display font-bold mb-2")
content = content.replace("text-brand-muted leading-relaxed", "text-brand-muted leading-relaxed font-light italic")

# Problem Section Heading - Elegant italic
content = content.replace("The Gifting Dilemma", "The Gifting Dilemma") # already uppercase

# Solution Section (Bento Grid) - Asymmetrical 
content = content.replace("rounded-[2rem] p-6 md:p-8 text-left border border-white/10", "rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-2xl rounded-bl-2xl p-6 md:p-8 text-left border border-white/10")
content = content.replace("font-display text-xl md:text-2xl font-bold text-white mb-3", "font-display text-xl md:text-2xl font-bold text-white mb-3 italic")

# How It Works - Leaf shape
content = content.replace("rounded-[2rem] p-5 md:p-6 border border-white/10", "rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-xl rounded-br-xl p-6 md:p-8 border border-white/10")
content = content.replace("font-display text-2xl font-bold text-white mb-3", "font-display text-2xl font-bold text-white mb-3 italic tracking-wide")

# Social Proof - Stats 
content = content.replace("rounded-[1.5rem] p-6 bg-white/80", "rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-lg rounded-bl-lg p-6 bg-white/80")
content = content.replace("text-brand-muted text-sm font-medium", "text-brand-muted text-sm font-medium italic")

# Occasions Grid - Soft asymmetrical
content = content.replace("rounded-2xl p-6 text-center", "rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md p-6 text-center")
content = content.replace("font-semibold text-sm", "font-semibold text-sm tracking-wide")

# Final CTA
content = content.replace("font-display display-heading font-bold text-brand-deep mb-8", "font-display display-heading font-bold text-brand-deep mb-8 italic")
content = content.replace("text-lg md:text-xl text-brand-muted max-w-2xl mx-auto mb-12 leading-relaxed", "text-lg md:text-xl text-brand-muted max-w-2xl mx-auto mb-12 leading-relaxed font-light italic")


with open("components/home/StorytellingHome.tsx", "w") as f:
    f.write(content)
print("Updated StorytellingHome.tsx")

# 2. Update SuperpowersStrip.tsx
with open("components/home/SuperpowersStrip.tsx", "r") as f:
    content = f.read()

content = content.replace("rounded-[2rem] p-6 md:p-8 border border-brand/5", "rounded-tr-[4rem] rounded-bl-[4rem] rounded-tl-2xl rounded-br-2xl p-8 md:p-10 border border-brand/5")
content = content.replace("text-brand-muted leading-relaxed max-w-sm", "text-brand-muted leading-relaxed max-w-sm font-light italic")
content = content.replace("font-display text-2xl md:text-3xl font-bold text-brand-deep leading-tight", "font-display text-2xl md:text-3xl font-bold text-brand-deep leading-tight italic")
content = content.replace("font-display text-xl md:text-2xl font-bold text-brand-deep mb-2", "font-display text-xl md:text-2xl font-bold text-brand-deep mb-2 italic")

with open("components/home/SuperpowersStrip.tsx", "w") as f:
    f.write(content)
print("Updated SuperpowersStrip.tsx")
