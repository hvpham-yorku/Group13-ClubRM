import React, { createContext, useContext, useState } from "react";

export type Role =
  | "President"
  | "VP Internal"
  | "VP Finance"
  | "VP Events"
  | "VP External"
  | "Marketing"
  | "Executive"
  | "Administrator";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(() => {
    const saved = localStorage.getItem("clubrm-demo-role") as Role;
    return saved || "President";
  });

  const handleSetRole = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem("clubrm-demo-role", newRole);
  };

  return (
    <RoleContext.Provider value={{ role, setRole: handleSetRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
