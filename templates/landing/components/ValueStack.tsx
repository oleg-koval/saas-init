export default function ValueStack() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need
        </h2>
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚡</span>
              <span className="font-medium">{{feature1}}</span>
            </div>
            <span className="text-sm text-muted-foreground">valued at $49</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔒</span>
              <span className="font-medium">{{feature2}}</span>
            </div>
            <span className="text-sm text-muted-foreground">valued at $79</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <span className="text-xl">📈</span>
              <span className="font-medium">{{feature3}}</span>
            </div>
            <span className="text-sm text-muted-foreground">valued at $99</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <span className="text-xl">🚀</span>
              <span className="font-medium">Production-ready deployment</span>
            </div>
            <span className="text-sm text-muted-foreground">valued at $129</span>
          </div>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50 mb-4">
          <p className="text-muted-foreground">Total value: <span className="font-bold text-foreground">$356</span></p>
        </div>
        <div className="text-center p-6 rounded-lg border-2 border-primary">
          <p className="text-lg font-medium mb-1">Yours today for just</p>
          <p className="text-4xl font-bold mb-4">${{price}}</p>
          <a
            href="#"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get started now
          </a>
        </div>
      </div>
    </section>
  );
}
