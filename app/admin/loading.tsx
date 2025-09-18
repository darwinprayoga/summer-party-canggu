export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-teal/10 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal/20 border-t-teal rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-charcoal/70">Loading admin portal...</p>
      </div>
    </div>
  );
}
