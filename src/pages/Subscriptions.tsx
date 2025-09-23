export default function Subscriptions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
      </div>
      
      {/* Empty state - will be populated later */}
      <div className="bg-secondary/30 rounded-lg p-12 text-center">
        <p className="text-muted-foreground">Subscriptions will be displayed here</p>
      </div>
    </div>
  );
}