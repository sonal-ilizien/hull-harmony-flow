import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/table";
import { DynamicFormDialog, FieldConfig } from "@/components/DynamicFormDialog";
import { get, post, put, del } from "@/lib/api";

import { Switch } from "@/components/ui/switch";


interface Privilege {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

interface Module {
  id: number;
  name: string;
  privileges: Privilege[];
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

  // Fetch roles and processes
  useEffect(() => {
    const fetchRoles = async () => {
      const res = await get("/access/user-roles/?page=1&order_by=-name");
      setRoles(res ?? []);
    };

    const fetchProcesses = async () => {
      const res = await get("/access/processes/");
      setProcesses(res ?? []);
    };

    fetchRoles();
    fetchProcesses();
  }, []);

  // Fetch modules whenever a role is selected
// Fetch modules whenever a role OR process is selected
useEffect(() => {
  if (!selectedRole || !selectedProcess) return; // require both

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
  }));

  setModules(mods);
};


  fetchModules();
}, [selectedRole, selectedProcess]); // <- dependency on both


const columns: Column<Module>[] = [
  { header: "Module", accessor: "name" },
  {
    header: "Add",
    accessor: "add",
    render: (row: Module) => {
      // Find or create "Add" privilege
      let priv = row.privileges.find((p) => p.name.toLowerCase() === "add");
      if (!priv) {
        priv = { id: 1, name: "Add", description: "Add access", status: false };
        row.privileges.push(priv);
      }

      return (
        <input
          type="checkbox"
          checked={priv.status}
          onChange={(e) => {
            setModules((prev) =>
              prev.map((m) =>
                m.id === row.id
                  ? {
                      ...m,
                      privileges: m.privileges.map((p) =>
                        p.name.toLowerCase() === "add" ? { ...p, status: e.target.checked } : p
                      ),
                    }
                  : m
              )
            );
          }}
        />
      );
    },
  },
  {
    header: "Privilege",
    accessor: "privilege",
    render: (row: Module) => {
      // Find or create "Privilege" privilege
      let priv = row.privileges.find((p) => p.name.toLowerCase() === "privilege");
      if (!priv) {
        priv = { id: 6, name: "Privilege", description: "Privilege access", status: false };
        row.privileges.push(priv);
      }

      return (
        <input
          type="checkbox"
          checked={priv.status}
          onChange={(e) => {
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
            );
          }}
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
        onCheckedChange={(checked) => {
          setModules((prev) =>
            prev.map((m) =>
              m.id === row.id
                ? { ...m, privileges: m.privileges.map((p) => ({ ...p, status: checked })) }
                : m
            )
          );
        }}
      />
    ),
  },
  {
    header: "Actions",
    accessor: "actions",
    render: (row: Module) => (
      <Button
        size="sm"
        className="bg-indigo-500 hover:bg-indigo-600 text-white"
        onClick={() => {
          setEditModule(row);
          setFormOpen(true);
        }}
      >
        Edit
      </Button>
    ),
  },
];


  const formFields: FieldConfig[] = [
    { name: "name", label: "Module Name", type: "text", required: true },
    { name: "add", label: "Add", type: "checkbox" },
    { name: "privilege", label: "Privilege", type: "checkbox" },
  ];

  const handleFormSubmit = (values: Record<string, any>) => {
    if (!editModule) return;
    setModules((prev) =>
      prev.map((m) => (m.id === editModule.id ? { ...m, ...values } : m))
    );
    setFormOpen(false);
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



        <Button
  className="bg-indigo-600 hover:bg-indigo-700 text-white"
  onClick={async () => {
    if (!selectedRole || !selectedProcess) {
      alert("Please select both a Role and a Process");
      return;
    }

    const payload = {
      role_id: selectedRole,
      process_id: selectedProcess,
      modules: modules.map((m) => ({
        id: m.id,
        privileges: m.privileges.map((p) => ({
          id: p.id,
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
        </div>

        {/* DataTable */}
        {selectedRole ? (
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={modules}
              className="mt-4 rounded-lg border border-gray-200"
            />
          </div>
        ) : (
          <div className="text-center p-10 text-gray-500">
            Select a Role to view privileges
          </div>
        )}
      </div>

      {/* Dynamic Form Dialog */}
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
    </div>
  );
};

export default RoleAccess;
