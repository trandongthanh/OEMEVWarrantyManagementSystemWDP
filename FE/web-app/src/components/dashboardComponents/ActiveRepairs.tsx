"use client";

export default function ActiveRepairs() {
  return (
    <div
      className="
        p-6 rounded-xl
        bg-gradient-to-br from-white/5 to-black/10
        border border-gray-600/30
        hover:border-gray-500/50
        hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
        backdrop-blur-2xl
        transition-all duration-200
      "
    >
      {/* Header */}
      <h2 className="text-xl font-semibold text-white mb-1">Active Repairs</h2>
      <p className="text-sm text-gray-300 mb-6">
        Track repair progress and technician assignments
      </p>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Parts */}
        <div
          className="
            p-4 rounded-xl
            bg-gradient-to-br from-white/8 to-black/15
            border border-gray-600/40
            hover:border-gray-500/60
            hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]
            backdrop-blur-xl
            transition-all duration-200 transform hover:scale-[1.02]
          "
        >
          <h3 className="font-medium text-gray-200 mb-2">Pending Parts</h3>
          <p className="text-gray-400">5 repairs waiting for parts delivery</p>
        </div>

        {/* In Progress */}
        <div
          className="
            p-4 rounded-xl
            bg-gradient-to-br from-white/8 to-black/15
            border border-gray-600/40
            hover:border-gray-500/60
            hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]
            backdrop-blur-xl
            transition-all duration-200 transform hover:scale-[1.02]
          "
        >
          <h3 className="font-medium text-gray-200 mb-2">In Progress</h3>
          <p className="text-gray-400">7 vehicles currently being repaired</p>
        </div>

        {/* Ready for Handover */}
        <div
          className="
            p-4 rounded-xl
            bg-gradient-to-br from-white/8 to-black/15
            border border-gray-600/40
            hover:border-gray-500/60
            hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]
            backdrop-blur-xl
            transition-all duration-200 transform hover:scale-[1.02]
          "
        >
          <h3 className="font-medium text-gray-200 mb-2">Ready for Handover</h3>
          <p className="text-gray-400">3 repairs completed and ready</p>
        </div>
      </div>
    </div>
  );
}
