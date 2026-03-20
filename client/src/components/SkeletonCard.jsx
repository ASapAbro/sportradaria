export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-12 bg-gray-200 rounded" />
      </div>
      <div className="h-5 w-4/5 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-2/5 bg-gray-200 rounded mb-4" />
      <div className="h-3 w-3/5 bg-gray-200 rounded mb-4" />
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </div>
      <div className="h-9 w-full bg-gray-200 rounded-lg" />
    </div>
  )
}
