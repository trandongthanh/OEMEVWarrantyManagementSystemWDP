// Example integration file - Shows how to use chat components

import { useState } from "react";
import {
  FloatingChatWidget,
  ChatPanel,
  GuestChatWidget,
  StaffChatDashboard,
} from "@/components/chat";

// Example 1: Guest Chat Widget for Homepage (Anonymous Users)
export function HomepageWithGuestChat() {
  return (
    <div>
      {/* Your homepage content */}
      <h1>Welcome to Our Service</h1>

      {/* Add guest chat widget - floats on bottom right */}
      <GuestChatWidget serviceCenterId="your-service-center-id" />
    </div>
  );
}

// Example 2: Staff Chat Dashboard (Full Screen)
export function StaffChatPage() {
  return (
    <div className="h-screen p-6 bg-gray-100">
      <div className="h-full max-w-7xl mx-auto">
        <StaffChatDashboard serviceCenterId="your-service-center-id" />
      </div>
    </div>
  );
}

// Example 3: Staff Chat Dashboard in Modal
export function DashboardWithChatModal() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div>
      {/* Your dashboard content */}
      <button
        onClick={() => setShowChat(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Open Chat Support
      </button>

      {/* Chat modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-6xl h-[80vh] bg-white rounded-2xl overflow-hidden">
            <StaffChatDashboard
              serviceCenterId="your-service-center-id"
              onClose={() => setShowChat(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Example 4: Floating chat widget for staff dashboard
export function StaffDashboardWithChat() {
  return (
    <div>
      {/* Your existing dashboard content */}

      {/* Add floating chat widget */}
      <FloatingChatWidget
        customerName="John Doe"
        vin="VF8EcoNEW013"
        recordId="record-123"
      />
    </div>
  );
}

// Example 5: Chat panel in modal (recommended for CasesList)
export function CasesListWithChatModal() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div>
      {/* Your case details modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl h-[600px] bg-white rounded-2xl">
            <ChatPanel
              customerName="John Doe"
              vin="VF8EcoNEW013"
              recordId="record-123"
              onClose={() => setShowChat(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Example 6: Chat tab in details modal
export function DetailModalWithChatTab() {
  const [activeTab, setActiveTab] = useState<"details" | "chat">("details");

  return (
    <div className="h-full flex flex-col">
      {/* Tab buttons */}
      <div className="flex gap-2 p-4 border-b">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "details"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "chat"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Chat
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "details" ? (
          <div className="p-6">{/* Your existing details content */}</div>
        ) : (
          <ChatPanel
            customerName="John Doe"
            vin="VF8EcoNEW013"
            recordId="record-123"
          />
        )}
      </div>
    </div>
  );
}
