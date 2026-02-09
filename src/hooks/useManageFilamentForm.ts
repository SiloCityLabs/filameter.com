import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSync } from '@/hooks/useSync';
import { save, deleteRow } from '@silocitypages/data-access';
import { filamentSchema } from '@/helpers/database/filament/migrateFilamentDB';
import { Filament, UsageLog } from '@/types/Filament';
import PouchDB from 'pouchdb';

const defaultValue: Filament = {
  filament: '',
  material: '',
  brand: '',
  color: '',
  price: 0,
  used_weight: 0,
  total_weight: 1000,
  location: '',
  comments: '',
  usage_history: [],
};

export const useManageFilamentForm = (
  data: Filament | undefined,
  db: PouchDB.Database | undefined | null
) => {
  const router = useRouter();
  const { updateLastModified } = useSync('');

  // --- State ---
  const [isEdit, setIsEdit] = useState(false);
  const [hideMultiple, setHideMultiple] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Alert State
  const [alert, setAlert] = useState<{ show: boolean; variant: string; message: string }>({
    show: false,
    variant: 'success',
    message: '',
  });

  // Form Data
  const [formData, setFormData] = useState<Filament & Record<string, unknown>>(
    (data && Object.keys(data).length > 0
      ? { ...defaultValue, ...data }
      : defaultValue) as Filament & Record<string, unknown>
  );

  // Bulk Create State
  const [createMultiple, setCreateMultiple] = useState(false);
  const [numberOfRows, setNumberOfRows] = useState(2);

  // --- Effects ---
  useEffect(() => {
    if (data?._id) {
      setHideMultiple(true);
      if (data?._rev) {
        setIsEdit(true);
      }
    }
  }, [data?._id, data?._rev]);

  // --- Validation Helpers ---
  const validateColor = (color: string): boolean => {
    if (!color) return true;
    const hexRegex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
    return hexRegex.test(color);
  };

  const validateId = (id: string): boolean => {
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const qrRegex = /^[a-zA-Z0-9]{8}$/;
    return uuidRegex.test(id) || qrRegex.test(id);
  };

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number = value;

    // Force numeric types for weight and price fields to prevent string concatenation bugs
    if (
      type === 'number' ||
      name === 'used_weight' ||
      name === 'total_weight' ||
      name === 'price'
    ) {
      finalValue = value === '' ? 0 : parseFloat(value);
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleTypeaheadChange = (field: keyof Filament, selected: any[]) => {
    const value = selected.length > 0 ? selected[0] : '';
    const textValue = typeof value === 'object' && 'label' in value ? value.label : value;
    setFormData((prev) => ({ ...prev, [field]: textValue as string }));
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, color: e.target.value }));
  };

  // --- Log Handlers ---
  const handleLogAdd = (log: UsageLog) => {
    setFormData((prev) => ({
      ...prev,
      // Explicitly cast prev.used_weight to Number() to ensure arithmetic addition
      used_weight: (Number(prev.used_weight) || 0) + log.weight,
      usage_history: [...(prev.usage_history || []), log],
    }));
  };

  const handleLogUpdate = (updatedLog: UsageLog) => {
    setFormData((prev) => {
      const oldLog = prev.usage_history?.find((l) => l.id === updatedLog.id);
      if (!oldLog) return prev;

      const weightDiff = updatedLog.weight - oldLog.weight;
      const updatedHistory = prev.usage_history?.map((l) =>
        l.id === updatedLog.id ? updatedLog : l
      );

      return {
        ...prev,
        // Explicitly cast prev.used_weight to Number()
        used_weight: (Number(prev.used_weight) || 0) + weightDiff,
        usage_history: updatedHistory,
      };
    });
  };

  const handleLogDelete = (logId: string) => {
    setFormData((prev) => {
      const logToDelete = prev.usage_history?.find((l) => l.id === logId);
      if (!logToDelete) return prev;

      return {
        ...prev,
        // Explicitly cast prev.used_weight to Number()
        used_weight: Math.max(0, (Number(prev.used_weight) || 0) - logToDelete.weight),
        usage_history: prev.usage_history?.filter((l) => l.id !== logId),
      };
    });
  };

  const handleDelete = async () => {
    if (!db || !formData._id) return;
    if (!window.confirm('Are you sure you want to delete this filament? This cannot be undone.'))
      return;

    setIsDeleting(true);
    try {
      const result = await deleteRow(db, formData._id, 'filament');
      if (result) {
        await updateLastModified();
        router.push(`/spools?alert_msg=${encodeURIComponent('Filament deleted successfully')}`);
      } else {
        throw new Error('Failed to delete row');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setAlert({ show: true, variant: 'danger', message: 'Failed to delete filament.' });
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      setAlert({ show: true, variant: 'danger', message: 'Database not initialized.' });
      return;
    }

    if (formData._id && !validateId(formData._id)) {
      setAlert({
        show: true,
        variant: 'danger',
        message: 'Invalid ID Format. Must be UUID or 8-char alphanumeric.',
      });
      return;
    }

    if (formData.color && !validateColor(formData.color as string)) {
      setAlert({
        show: true,
        variant: 'danger',
        message: 'Invalid Color Format. Use Hex (e.g., #FF0000).',
      });
      return;
    }

    setIsSaving(true);
    const isIdChanged = data?._id && formData._id !== data._id;
    const finalOperationIsEdit = isEdit && !isIdChanged;

    try {
      let finalResult;
      const count = createMultiple && !finalOperationIsEdit ? numberOfRows : 1;

      for (let x = 0; x < count; x++) {
        let dataToSave = { ...formData };
        if (createMultiple && !finalOperationIsEdit) {
          dataToSave = { ...formData, _id: undefined, _rev: undefined };
        } else if (isIdChanged) {
          dataToSave = { ...formData, _rev: undefined };
        }

        // Sanitize
        const sanitizedData = {
          ...dataToSave,
          brand: (dataToSave.brand as string) || '',
          color: (dataToSave.color as string) || '',
          location: (dataToSave.location as string) || '',
          comments: (dataToSave.comments as string) || '',
          price: Number(dataToSave.price) || 0,
          used_weight: Number(dataToSave.used_weight),
          total_weight: Number(dataToSave.total_weight),
          usage_history: Array.isArray(dataToSave.usage_history) ? dataToSave.usage_history : [],
        };

        finalResult = await save(db, sanitizedData, filamentSchema, 'filament');
        if (!finalResult.success) throw new Error(JSON.stringify(finalResult.error));
      }

      if (isIdChanged && data?._id && finalResult?.success) {
        await deleteRow(db, data._id, 'filament');
      }

      if (finalResult?.success) await updateLastModified();

      const msg = finalOperationIsEdit
        ? 'Filament updated successfully'
        : createMultiple
          ? `${numberOfRows} filaments added successfully`
          : 'Filament added successfully';

      router.push(`/spools?alert_msg=${encodeURIComponent(msg)}`);
    } catch (error: any) {
      console.error('Save error:', error);
      let message = 'An unexpected error occurred.';
      // Simple error parsing logic
      if (typeof error.message === 'string') {
        message = error.message.includes('conflict')
          ? `ID "${formData._id}" already exists.`
          : error.message;
      }
      setAlert({ show: true, variant: 'danger', message });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    isEdit,
    isSaving,
    isDeleting,
    hideMultiple,
    createMultiple,
    numberOfRows,
    alert,
    setAlert,
    setCreateMultiple,
    setNumberOfRows,
    handleInputChange,
    handleTypeaheadChange,
    handleColorPickerChange,
    handleDelete,
    handleSubmit,
    validateColor,
    handleLogAdd,
    handleLogUpdate,
    handleLogDelete,
  };
};
