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
import { get } from "@/lib/api";

// ---------------- Types ----------------
export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "dropdown" | "date" | "checkbox";
  placeholder?: string;
  apiEndpoint?: string; // optional: fetch options from API
  options?: { value: string | number; label: string }[]; // static options
  required?: boolean;
}

interface DynamicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  trigger?: React.ReactNode;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
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
    if (open) setFormData(initialValues);
  }, [open, initialValues]);

  // Fetch dropdowns from API
  useEffect(() => {
    fields.forEach(async (field) => {
      if (field.type === "dropdown" && field.apiEndpoint) {
        try {
          const res = await get(field.apiEndpoint);
          // normalize: extract array from API response
          const items = Array.isArray(res) ? res : res.data ?? [];
          setDropdownData((prev) => ({ ...prev, [field.name]: items }));
        } catch (err) {
          console.error("Dropdown fetch failed for", field.apiEndpoint, err);
          setDropdownData((prev) => ({ ...prev, [field.name]: [] }));
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
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="lg:max-w-lg shadow-xl border-0 bg-white p-0 rounded-1xl">
        {/* Header */}
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
              <Label htmlFor={field.name} className="font-medium text-gray-700">
                {field.label} {field.required && "*"}
              </Label>

              {/* Text / Number / Date */}
              {(field.type === "text" || field.type === "number" || field.type === "date") && (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  required={field.required}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 p-2"
                />
              )}

              {/* Textarea */}
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

              {/* Checkbox */}
              {field.type === "checkbox" && (
                <div className="flex items-center">
                  <input
                    id={field.name}
                    type="checkbox"
                    checked={formData[field.name] === "Active" || formData[field.name] === true}
                    onChange={(e) =>
                      handleChange(field.name, e.target.checked ? "Active" : "Inactive")
                    }
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <Label htmlFor={field.name} className="ml-2 text-gray-700">
                    {field.label}
                  </Label>
                </div>
              )}

              {/* Dropdown */}
              {field.type === "dropdown" && (
                <select
                  id={field.name}
                  value={formData[field.name] || ""}
                  required={field.required}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 p-2"
                >
                  <option value="">Select {field.label}</option>
                  {(field.options ?? dropdownData[field.name] ?? []).map((opt: any, idx: number) => (
                    <option key={idx} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
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