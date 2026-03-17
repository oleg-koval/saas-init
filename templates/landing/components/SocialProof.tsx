export default function SocialProof() {
  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          What our customers say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-background border flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <blockquote className="text-sm text-muted-foreground italic">
              &ldquo;This saved us weeks of setup time. We shipped our first paying customer in under 48 hours.&rdquo;
            </blockquote>
            <div>
              <p className="font-semibold text-sm">Alex Johnson</p>
              <p className="text-xs text-muted-foreground">Founder, Acme Corp</p>
            </div>
          </div>
          <div className="p-6 rounded-lg bg-background border flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <blockquote className="text-sm text-muted-foreground italic">
              &ldquo;The best investment I made this year. Auth, payments, and emails all working out of the box.&rdquo;
            </blockquote>
            <div>
              <p className="font-semibold text-sm">Sarah Chen</p>
              <p className="text-xs text-muted-foreground">CTO, Startup Inc</p>
            </div>
          </div>
          <div className="p-6 rounded-lg bg-background border flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <blockquote className="text-sm text-muted-foreground italic">
              &ldquo;I&apos;ve tried every boilerplate out there. This one actually ships production-ready code.&rdquo;
            </blockquote>
            <div>
              <p className="font-semibold text-sm">Marcus Williams</p>
              <p className="text-xs text-muted-foreground">Indie Hacker</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
