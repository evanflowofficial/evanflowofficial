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
    url: 'https://open.spotify.com/artist/15ibQwVmk0M3XUkUPEDdyI' 
  },
  { 
    name: 'Apple Music', 
    icon: '/icons/apple-music.png', 
    url: 'https://music.apple.com/us/artist/ev-an-flow/1649311774' 
  },
  { 
    name: 'SoundCloud', 
    icon: '/icons/soundcloud.png', 
    url: 'https://soundcloud.com/ev-an-flow' 
  },
  { 
    name: 'YouTube', 
    icon: '/icons/youtube.png', 
    url: 'https://youtube.com/@evanflowofficial?si=hIlvoHLdSYlCeyDb' 
  },
  { 
    name: 'TikTok', 
    icon: '/icons/tiktok.png', 
    url: 'https://tiktok.com/@evanflowmusic' 
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
          {/* Profile Picture */}
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
            <Image
              src="/icons/profile_pic.PNG"
              alt="Evan Flow Profile Picture"
              width={88}
              height={88}
              className="w-full h-full object-cover rounded-full"
            />
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
