import Image from 'next/image'

interface LinkButtonProps {
  name: string
  icon: string
  url: string
}

export default function LinkButton({ name, icon, url }: LinkButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-105 transition-all duration-200 rounded-2xl p-4 shadow-lg hover:shadow-xl border border-white/20"
    >
      <div className="flex items-center space-x-4">
        {/* Icon */}
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
          <Image
            src={icon}
            alt={`${name} icon`}
            width={32}
            height={32}
            className="rounded-md"
          />
        </div>
        
        {/* Platform Name */}
        <span className="text-lg font-semibold text-gray-800 flex-grow text-center">
          {name}
        </span>
        
        {/* Spacer for centering */}
        <div className="w-8 h-8 flex-shrink-0"></div>
      </div>
    </a>
  )
}
