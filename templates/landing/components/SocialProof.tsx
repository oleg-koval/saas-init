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
              &ldquo;{{testimonial1Quote}}&rdquo;
            </blockquote>
            <div>
              <p className="font-semibold text-sm">{{testimonial1Name}}</p>
              <p className="text-xs text-muted-foreground">{{testimonial1Role}}</p>
            </div>
          </div>
          <div className="p-6 rounded-lg bg-background border flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <blockquote className="text-sm text-muted-foreground italic">
              &ldquo;{{testimonial2Quote}}&rdquo;
            </blockquote>
            <div>
              <p className="font-semibold text-sm">{{testimonial2Name}}</p>
              <p className="text-xs text-muted-foreground">{{testimonial2Role}}</p>
            </div>
          </div>
          <div className="p-6 rounded-lg bg-background border flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <blockquote className="text-sm text-muted-foreground italic">
              &ldquo;{{testimonial3Quote}}&rdquo;
            </blockquote>
            <div>
              <p className="font-semibold text-sm">{{testimonial3Name}}</p>
              <p className="text-xs text-muted-foreground">{{testimonial3Role}}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
