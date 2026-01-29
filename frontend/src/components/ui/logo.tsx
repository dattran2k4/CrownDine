

export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center justify-center">
      <img
        src="/logo.png"
        alt="CrownDine Logo"
        // Sử dụng object-contain để ảnh không bị bóp méo
        className={`object-contain ${className}`} 
      />
    </div>
  )
}