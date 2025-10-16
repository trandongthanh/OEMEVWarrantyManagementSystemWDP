// Example integration file - Shows how to use chat components

import { useState } from "react";
import { FloatingChatWidget, ChatPanel } from "@/components/chat";

// Example 1: Floating chat widget for staff dashboard
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

// Example 2: Chat panel in modal (recommended for CasesList)
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

// Example 3: Chat tab in details modal
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
