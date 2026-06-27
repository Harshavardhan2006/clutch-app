import { Zap, User } from 'lucide-react'

function renderText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-white/90">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-clutch-accent font-mono text-xs border border-white/5">$1</code>')
    .replace(/\n/g, '<br />')
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-4 animate-slide-up px-2 py-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 shadow-lg ${
        isUser
          ? 'bg-white/10 backdrop-blur-md border border-white/10 text-clutch-textPrimary'
          : 'bg-gradient-to-br from-clutch-accent to-clutch-accentHover border border-white/20 text-white'
      }`}>
        {isUser ? <User size={14} /> : <Zap size={14} fill="white" />}
      </div>

      <div className={`max-w-[75%] px-5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-xl backdrop-blur-md border ${
        isUser
          ? 'bg-gradient-to-br from-clutch-accent/90 to-clutch-accentHover/90 text-white rounded-tr-sm border-white/10'
          : 'bg-clutch-surface/60 text-clutch-textPrimary rounded-tl-sm border-white/5'
      }`}>
        <p
          dangerouslySetInnerHTML={{ __html: renderText(message.text) }}
          className="font-body"
        />
      </div>
    </div>
  )
}
