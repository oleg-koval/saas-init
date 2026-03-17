export default function Transformation() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">
          Your journey with {{name}}
        </h2>
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="flex-1 rounded-lg border bg-card p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">①</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Day 1</div>
            <h3 className="text-lg font-semibold mb-2">Quick Win</h3>
            <p className="text-sm text-muted-foreground">
              You get your first win immediately. Setup takes minutes, results come the same day.
            </p>
          </div>
          <div className="hidden md:flex items-center self-center text-muted-foreground text-2xl">→</div>
          <div className="flex-1 rounded-lg border bg-card p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">②</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Week 1</div>
            <h3 className="text-lg font-semibold mb-2">Compound</h3>
            <p className="text-sm text-muted-foreground">
              Each day builds on the last. Your results compound and momentum grows steadily.
            </p>
          </div>
          <div className="hidden md:flex items-center self-center text-muted-foreground text-2xl">→</div>
          <div className="flex-1 rounded-lg border bg-card p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">③</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Month 1</div>
            <h3 className="text-lg font-semibold mb-2">Advantage</h3>
            <p className="text-sm text-muted-foreground">
              You now have a clear competitive advantage. The gap between you and others widens.
            </p>
          </div>
          <div className="hidden md:flex items-center self-center text-muted-foreground text-2xl">→</div>
          <div className="flex-1 rounded-lg border bg-card p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">④</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Month 3+</div>
            <h3 className="text-lg font-semibold mb-2">10x</h3>
            <p className="text-sm text-muted-foreground">
              You are operating at 10x your previous capacity. Results that used to take months happen in days.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
