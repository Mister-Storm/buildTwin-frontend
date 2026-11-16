"use client";

import { useEffect, useState } from "react";
import {
  describeCapabilityState,
  getCapabilities,
  type CapabilityName,
  type CapabilityNotice,
} from "@/services/capabilities.service";

export function useCapabilityNotice(name: CapabilityName): CapabilityNotice | null {
  const [notice, setNotice] = useState<CapabilityNotice | null>(null);

  useEffect(() => {
    let active = true;
    getCapabilities()
      .then((capabilities) => {
        const capability = capabilities.find((item) => item.name === name);
        if (active) setNotice(capability ? describeCapabilityState(capability) : null);
      })
      .catch(() => {
        if (active) setNotice(null);
      });
    return () => {
      active = false;
    };
  }, [name]);

  return notice;
}
