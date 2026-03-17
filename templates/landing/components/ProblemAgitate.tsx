export default function ProblemAgitate() {
  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          You&apos;re probably dealing with…
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="problem-card p-6 rounded-lg bg-background border">
            <span className="text-2xl mb-3 block">▸</span>
            <p className="font-bold mb-2">Wasted time on setup</p>
            <p className="text-sm text-muted-foreground">
              Every new project means hours of boilerplate — auth, payments, emails — before you can build the actual thing.
            </p>
          </div>
          <div className="problem-card p-6 rounded-lg bg-background border">
            <span className="text-2xl mb-3 block">▸</span>
            <p className="font-bold mb-2">Inconsistent foundations</p>
            <p className="text-sm text-muted-foreground">
              Without a standard stack, every project diverges, making maintenance and onboarding harder than it should be.
            </p>
          </div>
          <div className="problem-card p-6 rounded-lg bg-background border">
            <span className="text-2xl mb-3 block">▸</span>
            <p className="font-bold mb-2">Slow time to first user</p>
            <p className="text-sm text-muted-foreground">
              The longer it takes to get live, the longer you wait for real feedback — and the more runway you burn.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
