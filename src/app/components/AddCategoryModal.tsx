import { X } from 'lucide-react';
import {
  ENTITY_TYPES,
  CATEGORY_ICON,
  type EntityType,
} from '@/features/map/constants';
import { Button } from '@/app/components/ui/button';

const TYPE_LABELS: Record<string, string> = {
  service: 'Services',
  database: 'Databases',
  infra: 'Infrastructure',
  team: 'Teams',
  roadmap: 'Roadmap',
  cost: 'Costs',
  metric: 'Observability',
};

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCategoryTypes: EntityType[];
  onAddCategory: (type: EntityType) => void;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  existingCategoryTypes,
  onAddCategory,
}: AddCategoryModalProps) {
  if (!isOpen) return null;

  const existingSet = new Set(existingCategoryTypes);
  const availableTypes = ENTITY_TYPES.filter((t) => !existingSet.has(t));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Add category
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Choose a category type to add to the map. You can then add components under it.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ENTITY_TYPES.map((t) => {
              const isAdded = existingSet.has(t);
              const ico = CATEGORY_ICON[t] ?? 'server';
              return (
                <button
                  key={t}
                  type="button"
                  disabled={isAdded}
                  onClick={() => !isAdded && onAddCategory(t)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                    isAdded
                      ? 'cursor-not-allowed border-border bg-muted/30 opacity-60'
                      : 'border-border bg-muted/50 hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <span className="text-xl opacity-80">{ico}</span>
                  <span className="text-sm font-medium text-foreground">
                    {TYPE_LABELS[t] ?? t}
                  </span>
                  {isAdded && (
                    <span className="text-[10px] text-muted-foreground">Added</span>
                  )}
                </button>
              );
            })}
          </div>
          {availableTypes.length === 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              All categories are already on the map.
            </p>
          )}
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
