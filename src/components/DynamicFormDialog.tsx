import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { get } from "@/lib/api"; // ✅ reuse your API service

// ---------------- Types ----------------
export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "dropdown" | "date";
  placeholder?: string;
  apiEndpoint?: string; // only used if dropdown needs API
  options?: { value: string | number; label: string }[]; // static options
  required?: boolean;
}

export interface Column<T> {
  header: string;
  accessor: keyof T | "actions"; // allow "actions"
}

interface DynamicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  trigger?: React.ReactNode; // ✅ Added trigger prop
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowsPerPage?: number;
}

// ---------------- Component ----------------
export function DynamicFormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialValues = {},
  trigger,
  onSubmit,
}: DynamicFormDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [dropdownData, setDropdownData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData(initialValues);
    }
  }, [open, initialValues]);

  // Fetch dropdown data from APIs
  useEffect(() => {
    fields.forEach(async (field) => {
      if (field.type === "dropdown" && field.apiEndpoint) {
        try {
          const data = await get(field.apiEndpoint);
          setDropdownData((prev) => ({
            ...prev,
            [field.name]: data.results || data, // adapt to API structure
          }));
        } catch (err) {
          console.error("Dropdown fetch failed for", field.apiEndpoint, err);
        }
      }
    });
  }, [fields]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (err) {
      console.error("Form submit failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ✅ If trigger is passed, wrap it in DialogTrigger */}
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="lg:max-w-lg shadow-xl border-0 bg-white p-0 rounded-1xl">
        {/* Header with navy blue gradient */}
        <DialogHeader className="bg-gradient-to-r from-[#1a2746] to-[#223366] p-4 text-white">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm opacity-90 text-white">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Form Body */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label
                htmlFor={field.name}
                className="font-medium text-gray-700"
              >
                {field.label} {field.required && "*"}
              </Label>

              {/* Inputs */}
              {(field.type === "text" ||
                field.type === "number" ||
                field.type === "date") && (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  required={field.required}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  required={field.required}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 p-2"
                />
              )}

              {field.type === "dropdown" && (
                <select
                  id={field.name}
                  value={formData[field.name] || ""}
                  required={field.required}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 p-2"
                >
                  <option value="">Select {field.label}</option>
                  {(field.options || dropdownData[field.name] || []).map(
                    (opt: any, idx) => (
                      <option
                        key={idx}
                        value={opt.value || opt.id || opt.code}
                      >
                        {opt.label || opt.name}
                      </option>
                    )
                  )}
                </select>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-end gap-3 p-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}