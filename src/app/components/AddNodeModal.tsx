import { X } from 'lucide-react';
import type { AddNodePayload } from '@/features/map/types';
import type { SelectedNode, EditingEntity } from '@/features/map/types';
import type { HandlePosition } from '@/features/map/constants';
import { AddNodeForm } from '@/app/components/AddNodeForm';

export interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentNode: SelectedNode | null;
  editingEntity?: EditingEntity | null;
  onAddNode: (payload: AddNodePayload) => void;
  onUpdateNode?: (id: string, payload: AddNodePayload) => void;
  defaultSourceHandle?: HandlePosition;
  defaultTargetHandle?: HandlePosition;
}

function getStepTitle(isEditMode: boolean, showOnlyCustomForm: boolean): { title: string; subtitle: string } {
  if (isEditMode) {
    return { title: 'Edit component', subtitle: 'Update name, icon, status and metadata' };
  }
  if (showOnlyCustomForm) {
    return { title: 'Add component', subtitle: 'Enter a name and choose an icon' };
  }
  return {
    title: 'Select component type',
    subtitle: 'Choose a type for the new component, or pick a preset',
  };
}

export function AddNodeModal({
  isOpen,
  onClose,
  parentNode,
  editingEntity = null,
  onAddNode,
  onUpdateNode,
  defaultSourceHandle,
  defaultTargetHandle,
}: AddNodeModalProps) {
  const isEditMode = Boolean(editingEntity);
  const showOnlyCustomForm = Boolean(parentNode) || isEditMode;

  const stepTitle = getStepTitle(isEditMode, showOnlyCustomForm);

  if (!isOpen || (!parentNode && !editingEntity)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-4 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{stepTitle.title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{stepTitle.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          <AddNodeForm
            parentNode={parentNode}
            editingEntity={editingEntity}
            onClose={onClose}
            onAddNode={onAddNode}
            onUpdateNode={onUpdateNode}
            defaultSourceHandle={defaultSourceHandle}
            defaultTargetHandle={defaultTargetHandle}
          />
        </div>
      </div>
    </div>
  );
}
