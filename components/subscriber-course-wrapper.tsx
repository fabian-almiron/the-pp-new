"use client";

import { SubscriberGate } from "./subscriber-gate";

interface SubscriberCourseWrapperProps {
  children: React.ReactNode;
}

export function SubscriberCourseWrapper({ children }: SubscriberCourseWrapperProps) {
  return <SubscriberGate>{children}</SubscriberGate>;
}

