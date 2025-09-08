import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/table";
import { DynamicFormDialog, FieldConfig } from "@/components/DynamicFormDialog";
import { get, post } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp, Plus, Edit, Trash2 } from "lucide-react";

interface Privilege {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

interface SubModule {
  id: number;
  name: string;
}

interface Module {
  id: number;
  name: string;
  privileges: Privilege[];
  sub_modules?: SubModule[];
}

interface Process {
  id: number;
  name: string;
}

const RoleAccess = () => {
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<number | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editModule, setEditModule] = useState<Module | null>(null);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [subModuleFormOpen, setSubModuleFormOpen] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  const [parentMenus, setParentMenus] = useState<{ id: number; name: string }[]>([]);

  // Fetch roles, processes, and parent menus
  useEffect(() => {
    const fetchRoles = async () => {
      const res = await get("/access/user-roles/?page=1&order_by=-name");
      setRoles(res ?? []);
    };
    const fetchProcesses = async () => {
      const res = await get("/access/processes/");
      setProcesses(res ?? []);
    };
    const fetchParentMenus = async () => {
      const res = await get("/access/menus/");
      setParentMenus(res ?? []);
    };
    fetchRoles();
    fetchProcesses();
    fetchParentMenus();
  }, []);

  // Fetch modules for selected role + process
  useEffect(() => {
    if (!selectedRole || !selectedProcess) return;
    const fetchModules = async () => {
      const res = await get(
        `/access/role-menu-mappings/?role_id=${selectedRole}&process_id=${selectedProcess}`
      );
      const mods = res.map((m: any) => ({
        id: m.id,
        name: m.name,
        privileges: m.privileges.length
          ? m.privileges
          : [
              { id: 1, name: "Add", description: "Add access", status: false },
              { id: 6, name: "Privilege", description: "Privilege access", status: false },
            ],
        sub_modules: m.sub_modules || [],
      }));
      setModules(mods);
    };
    fetchModules();
  }, [selectedRole, selectedProcess]);

  const toggleExpand = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  // Columns for the table
  const columns: Column<Module>[] = [
    {
      header: "",
      accessor: "expand",
      render: (row) => (
        <Button variant="ghost" size="icon" onClick={() => toggleExpand(row.id)}>
          {expandedModules.includes(row.id) ? <ChevronUp /> : <ChevronDown />}
        </Button>
      ),
    },
    { header: "Module", accessor: "name" },
    {
      header: "Add",
      accessor: "add",
      render: (row: Module) => {
        let priv = row.privileges.find((p) => p.name.toLowerCase() === "add");
        if (!priv) {
          priv = { id: 1, name: "Add", description: "Add access", status: false };
          row.privileges.push(priv);
        }
        return (
          <input
            type="checkbox"
            checked={priv.status}
            onChange={(e) =>
              setModules((prev) =>
                prev.map((m) =>
                  m.id === row.id
                    ? {
                        ...m,
                        privileges: m.privileges.map((p) =>
                          p.name.toLowerCase() === "add"
                            ? { ...p, status: e.target.checked }
                            : p
                        ),
                      }
                    : m
                )
              )
            }
          />
        );
      },
    },
    {
      header: "Privilege",
      accessor: "privilege",
      render: (row: Module) => {
        let priv = row.privileges.find((p) => p.name.toLowerCase() === "privilege");
        if (!priv) {
          priv = { id: 6, name: "Privilege", description: "Privilege access", status: false };
          row.privileges.push(priv);
        }
        return (
          <input
            type="checkbox"
            checked={priv.status}
            onChange={(e) =>
              setModules((prev) =>
                prev.map((m) =>
                  m.id === row.id
                    ? {
                        ...m,
                        privileges: m.privileges.map((p) =>
                          p.name.toLowerCase() === "privilege"
                            ? { ...p, status: e.target.checked }
                            : p
                        ),
                      }
                    : m
                )
              )
            }
          />
        );
      },
    },
    {
      header: "Enabled",
      accessor: "enabled",
      render: (row: Module) => (
        <Switch
          checked={row.privileges.some((p) => p.status)}
          onCheckedChange={(checked) =>
            setModules((prev) =>
              prev.map((m) =>
                m.id === row.id
                  ? { ...m, privileges: m.privileges.map((p) => ({ ...p, status: checked })) }
                  : m
              )
            )
          }
        />
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: Module) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCurrentModuleId(row.id);
              setSubModuleFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditModule(row);
              setFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setModules((prev) => prev.filter((m) => m.id !== row.id));
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Add/Edit Module form fields
  const formFields: FieldConfig[] = [
    { name: "name", label: "Module Name", type: "text", required: true },
    { name: "icon", label: "Icon", type: "text" },
    { name: "url", label: "URL", type: "text" },
  ];

  // Add Sub Module form fields
  const subModuleFields: FieldConfig[] = [
    { name: "name", label: "Module Name", type: "text", required: true },
    { name: "icon", label: "Icon", type: "text" },
    { name: "url", label: "URL", type: "text" },
    {
      name: "parent_menu",
      label: "Parent Menu",
      type: "dropdown",
      required: true,
      options: parentMenus.map((m) => ({ label: m.name, value: m.id })),
    },
  ];

  // Add/Edit Module API submit
  const handleFormSubmit = async (values: Record<string, any>) => {
    try {
      let res;
      if (editModule && editModule.id) {
        // Update existing module
        res = await post(
          `/access/menus/${editModule.id}/`,
          values
        );
        setModules((prev) =>
          prev.map((m) => (m.id === editModule.id ? { ...m, name: res.name } : m))
        );
      } else {
        // Add new module
        res = await post("/access/menus/", values);
        setModules((prev) => [
          ...prev,
          { id: res.id, name: res.name, privileges: [], sub_modules: [] },
        ]);
      }
      setFormOpen(false);
      alert("Module saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save module");
    }
  };

  // Add Sub Module API submit
  const handleAddSubModule = async (values: Record<string, any>) => {
    if (!currentModuleId) return;
    try {
      const payload = {
        name: values.name,
        url: values.url,
        icon: values.icon,
        parent_menu: { id: values.parent_menu },
      };
      const res = await post("/access/menus/", payload);
      alert("Sub Module added successfully!");
      setModules((prev) =>
        prev.map((m) =>
          m.id === currentModuleId
            ? {
                ...m,
                sub_modules: [...(m.sub_modules || []), { id: res.id, name: res.name }],
              }
            : m
        )
      );
      setSubModuleFormOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add sub module");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
        {/* Role & Process Selection */}
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex flex-col w-60">
            <label className="font-medium text-gray-700">Select Process</label>
            <select
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedProcess ?? ""}
              onChange={(e) => setSelectedProcess(Number(e.target.value))}
            >
              <option value="">Select Process</option>
              {processes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-60">
            <label className="font-medium text-gray-700">Select Role</label>
            <select
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedRole ?? ""}
              onChange={(e) => setSelectedRole(Number(e.target.value))}
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={async () => {
                if (!selectedRole || !selectedProcess) {
                  alert("Please select both a Role and a Process");
                  return;
                }
                const payload = {
                  role: { id: selectedRole },
                  process: { id: selectedProcess },
                  menu_access: modules.map((m) => ({
                    // id: m.id,
                    name: m.name,
                    url: "/",
                    icon: "icon",
                    sub_menus: m.sub_modules || [],
                    privileges: m.privileges.map((p) => ({
                      id: p.id,
                      name: p.name,
                      description: p.description,
                      status: p.status,
                    })),
                  })),
                };
                try {
                  const res = await post("/access/role-menu-mappings/", payload);
                  alert("Role access saved successfully!");
                  console.log("Save response:", res);
                } catch (err) {
                  console.error("Error saving role access:", err);
                  alert("Failed to save role access");
                }
              }}
            >
              Save Changes
            </Button>

            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setEditModule({
                  id: Date.now(),
                  name: "",
                  privileges: [
                    { id: 1, name: "Add", description: "Add access", status: false },
                    { id: 6, name: "Privilege", description: "Privilege access", status: false },
                  ],
                  sub_modules: [],
                });
                setFormOpen(true);
              }}
            >
              Add Module
            </Button>
          </div>
        </div>

        {/* Data Table */}
        {selectedRole ? (
          <div className="overflow-x-auto mt-4">
            <DataTable
              columns={columns}
              data={modules}
              className="rounded-lg border border-gray-200"
              renderSubRow={(row) =>
                expandedModules.includes(row.id) && row.sub_modules && row.sub_modules.length ? (
                  <div className="bg-gray-100 p-4 rounded mb-4">
                    <h3 className="font-semibold mb-2">Sub Modules</h3>
                    <ul className="space-y-1">
                      {row.sub_modules.map((sub) => (
                        <li key={sub.id} className="flex justify-between items-center">
                          <span>{sub.name}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              setModules((prev) =>
                                prev.map((m) =>
                                  m.id === row.id
                                    ? {
                                        ...m,
                                        sub_modules: m.sub_modules!.filter((s) => s.id !== sub.id),
                                      }
                                    : m
                                )
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="text-center p-10 text-gray-500">
            Select a Role to view privileges
          </div>
        )}
      </div>

      {/* Add/Edit Module Dialog */}
      {editModule && (
        <DynamicFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          title="Edit Module"
          fields={formFields}
          initialValues={editModule}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Add Sub Module Dialog */}
      <DynamicFormDialog
        open={subModuleFormOpen}
        onOpenChange={setSubModuleFormOpen}
        title="Add Sub Module"
        fields={subModuleFields}
        initialValues={{ name: "" }}
        onSubmit={handleAddSubModule}
      />
    </div>
  );
};

export default RoleAccess;
