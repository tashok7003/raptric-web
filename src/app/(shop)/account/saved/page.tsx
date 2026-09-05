import { EmptyState } from "@/components/account/EmptyState";

// 8a — "price/stock deltas as the reason to return." Wishlist
// persistence (the Heart button on ProductCard) isn't wired to an
// account-linked model yet — it's a per-viewer localStorage affordance
// today, same as the compare tray. Promoting it to a synced list is
// small once it's asked for.
export default function SavedPage() {
  return (
    <EmptyState
      title="Nothing saved yet"
      detail="Tap the heart on any model to keep it here, with a note if the price or stock changes."
    />
  );
}
