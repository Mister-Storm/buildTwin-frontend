"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { OrthomosaicResolver } from "@/features/domain/resolvers/orthomosaic-resolver";

const OrthomosaicResolverContext = createContext<OrthomosaicResolver | null>(
  null,
);

type OrthomosaicResolverProviderProps = {
  resolver: OrthomosaicResolver;
  children: ReactNode;
};

export function OrthomosaicResolverProvider({
  resolver,
  children,
}: OrthomosaicResolverProviderProps) {
  return (
    <OrthomosaicResolverContext.Provider value={resolver}>
      {children}
    </OrthomosaicResolverContext.Provider>
  );
}

export function useOrthomosaicResolver(): OrthomosaicResolver {
  const resolver = useContext(OrthomosaicResolverContext);
  if (!resolver) {
    throw new Error(
      "useOrthomosaicResolver must be used within OrthomosaicResolverProvider",
    );
  }
  return resolver;
}
