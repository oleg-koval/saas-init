export default function SecondaryCTA() {
  return (
    <section className="py-24 px-4 bg-muted/50">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-6">
        <div className="flex -space-x-3">
          <div className="w-12 h-12 rounded-full bg-muted border-2 border-background" />
          <div className="w-12 h-12 rounded-full bg-muted border-2 border-background" />
          <div className="w-12 h-12 rounded-full bg-muted border-2 border-background" />
        </div>
        <p className="text-2xl font-semibold">Ready to join them?</p>
        <a
          href="#"
          className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Yes — get started with {{name}}
        </a>
      </div>
    </section>
  );
}
