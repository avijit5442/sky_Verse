import { useEffect, useRef, useState } from 'react'

type VoicePanelProps = {
  title?: string
  onCommand?: (command: string) => void
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

const commands = [
  'Hey Projector, Switch to AR Mode',
  'Hey Projector, Switch to Ceiling Mode',
  'Hey Projector, Weather Mode',
  'Hey Projector, Educational Mode',
  'Hey Projector, Hide Labels',
  'Hey Projector, Reset View',
  'Hey Projector, What is visible tonight',
]

export function VoicePanel({ title = 'Voice Controls', onCommand }: VoicePanelProps) {
  const [isListening, setIsListening] = useState(false)
  const [lastCommand, setLastCommand] = useState('No command yet')
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => () => {
    recognitionRef.current?.stop()
  }, [])

  const startListening = () => {
    const speechRecognitionCtor = (window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }).SpeechRecognition
      ?? (window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructor
        webkitSpeechRecognition?: SpeechRecognitionConstructor
      }).webkitSpeechRecognition

    if (!speechRecognitionCtor) {
      setLastCommand('Voice recognition is not available in this browser.')
      setIsListening(false)
      return
    }

    const recognition = new speechRecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      const spokenText = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim()

      if (spokenText) {
        setLastCommand(`Heard: ${spokenText}`)
        onCommand?.(spokenText)
      }
    }
    recognition.onerror = (event) => {
      setLastCommand(`Voice error: ${event.error}`)
      setIsListening(false)
    }
    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    setLastCommand('Listening for Hey Projector commands...')
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setLastCommand('Voice capture paused')
  }

  const handleListeningToggle = () => {
    if (isListening) {
      stopListening()
      return
    }

    startListening()
  }

  const handleCommandSelect = (command: string) => {
    setLastCommand(`Activated: ${command}`)
    setIsListening(true)
    onCommand?.(command)
  }

  return (
    <section className="service-card" aria-label="Voice controls">
      <div className="panel-heading">
        <h2>{title}</h2>
        <p>Voice-driven guidance for hands-free navigation.</p>
      </div>

      <button type="button" className="primary-btn" onClick={handleListeningToggle}>
        {isListening ? 'Stop listening' : 'Start listening'}
      </button>

      <p className="mode-hint">{lastCommand}</p>

      <div className="voice-list">
        {commands.map((command) => (
          <button key={command} type="button" className="voice-chip" onClick={() => handleCommandSelect(command)}>
            {command}
          </button>
        ))}
      </div>
    </section>
  )
}
