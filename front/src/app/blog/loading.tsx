export default function BlogLoading() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="mb-12 h-10 w-48 animate-pulse rounded bg-[#001e27]/10" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-lg bg-[#001e27]/5"
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  );
}
