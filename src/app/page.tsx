import Image from 'next/image'
import LinkButton from '@/components/LinkButton'

const platforms = [
  { 
    name: 'Instagram', 
    icon: '/icons/instagram.png', 
    url: 'https://instagram.com/evanflowmusic' 
  },
  { 
    name: 'Spotify', 
    icon: '/icons/spotify.png', 
    url: 'https://open.spotify.com/artist/evanflow' 
  },
  { 
    name: 'Apple Music', 
    icon: '/icons/apple-music.png', 
    url: 'https://music.apple.com/artist/evanflow' 
  },
  { 
    name: 'SoundCloud', 
    icon: '/icons/soundcloud.png', 
    url: 'https://soundcloud.com/evanflow' 
  },
  { 
    name: 'YouTube', 
    icon: '/icons/youtube.png', 
    url: 'https://youtube.com/@evanflow' 
  },
  { 
    name: 'TikTok', 
    icon: '/icons/tiktok.png', 
    url: 'https://tiktok.com/@evanflow' 
  },
  { 
    name: 'Substack', 
    icon: '/icons/substack.png', 
    url: 'https://evanflow.substack.com' 
  }
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-orange-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Profile Section */}
        <div className="text-center mb-8">
          {/* Profile Picture Placeholder */}
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-lg">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-xs">Photo</span>
            </div>
          </div>
          
          {/* Artist Name */}
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            Evan Flow
          </h1>
          
          {/* Genre */}
          <p className="text-white/90 text-lg drop-shadow-md">
            Jazz / Funk / Hip Hop
          </p>
        </div>

        {/* Links Section */}
        <div className="space-y-4">
          {platforms.map((platform) => (
            <LinkButton
              key={platform.name}
              name={platform.name}
              icon={platform.icon}
              url={platform.url}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
