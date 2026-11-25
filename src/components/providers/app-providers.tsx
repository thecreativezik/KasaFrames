"use client";

import * as React from "react";
import { CartProvider } from "@/context/cart-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
