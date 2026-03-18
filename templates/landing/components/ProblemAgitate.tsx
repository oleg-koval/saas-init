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
            <p className="font-bold mb-2">{{problem1Title}}</p>
            <p className="text-sm text-muted-foreground">
              {{problem1Body}}
            </p>
          </div>
          <div className="problem-card p-6 rounded-lg bg-background border">
            <span className="text-2xl mb-3 block">▸</span>
            <p className="font-bold mb-2">{{problem2Title}}</p>
            <p className="text-sm text-muted-foreground">
              {{problem2Body}}
            </p>
          </div>
          <div className="problem-card p-6 rounded-lg bg-background border">
            <span className="text-2xl mb-3 block">▸</span>
            <p className="font-bold mb-2">{{problem3Title}}</p>
            <p className="text-sm text-muted-foreground">
              {{problem3Body}}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
