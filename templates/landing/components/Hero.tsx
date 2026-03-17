export default function Hero() {
  return (
    <section className="flex flex-col items-center text-center py-24 px-4">
      <span className="inline-block mb-4 px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary">
        {{name}}
      </span>
      <h1 className="text-5xl font-bold tracking-tight mb-4">
        {{name}} — {{tagline}}
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mb-8">
        {{problemStatement}}
      </p>
      <a
        href="#"
        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Get started
      </a>
      <div className="flex items-center gap-3 mt-8 text-sm text-muted-foreground">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background" />
          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background" />
          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background" />
        </div>
        <span>Trusted by companies like yours</span>
      </div>
    </section>
  );
}
