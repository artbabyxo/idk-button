import { useState, useEffect, useRef } from 'react'
import { sensoryPhrases, releasePhrases, landingTaglines } from './phrases'
import StaticBackground from './StaticBackground'
import './App.css'

const PHASE = { LANDING: 'landing', PHRASE: 'phrase' }
const POOL  = { SENSORY: 'sensory', RELEASE: 'release' }

function randomFrom(arr, exclude = null) {
  const options = exclude ? arr.filter(p => p !== exclude) : arr
  return options[Math.floor(Math.random() * options.length)]
}

// Pink noise generator
function createPinkNoise(ctx) {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886*b0 + white*0.0555179; b1 = 0.99332*b1 + white*0.0750759
    b2 = 0.96900*b2 + white*0.1538520; b3 = 0.86650*b3 + white*0.3104856
    b4 = 0.55000*b4 + white*0.5329522; b5 = -0.7616*b5 - white*0.0168980
    data[i] = (b0+b1+b2+b3+b4+b5+b6 + white*0.5362) * 0.11
    b6 = white * 0.115926
  }
  return buffer
}

export default function App() {
  const [phase, setPhase]               = useState(PHASE.LANDING)
  const [pool, setPool]                 = useState(POOL.RELEASE)
  const [phrase, setPhrase]             = useState('')
  const [tagline, setTagline]           = useState(landingTaglines[0])
  const [taglineVisible, setTaglineVisible] = useState(true)
  const [visible, setVisible]           = useState(true)
  const [audioOn, setAudioOn]           = useState(false)

  const taglineTimer = useRef(null)
  const audioCtx     = useRef(null)
  const noiseSource  = useRef(null)
  const gainNode     = useRef(null)

  // Tagline rotation
  useEffect(() => {
    if (phase !== PHASE.LANDING) return
    let i = 0
    taglineTimer.current = setInterval(() => {
      setTaglineVisible(false)
      setTimeout(() => {
        i = (i + 1) % landingTaglines.length
        setTagline(landingTaglines[i])
        setTaglineVisible(true)
      }, 800)
    }, 4000)
    return () => clearInterval(taglineTimer.current)
  }, [phase])

  // Audio toggle
  const toggleAudio = () => {
    if (!audioOn) {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)()
        gainNode.current = audioCtx.current.createGain()
        gainNode.current.gain.value = 0
        gainNode.current.connect(audioCtx.current.destination)
      }
      const ctx = audioCtx.current
      if (ctx.state === 'suspended') ctx.resume()
      const buffer = createPinkNoise(ctx)
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.connect(gainNode.current)
      source.start()
      noiseSource.current = source
      gainNode.current.gain.setTargetAtTime(0.18, ctx.currentTime, 1.5)
      setAudioOn(true)
    } else {
      if (gainNode.current && audioCtx.current) {
        gainNode.current.gain.setTargetAtTime(0, audioCtx.current.currentTime, 0.8)
        setTimeout(() => {
          noiseSource.current?.stop()
          noiseSource.current = null
        }, 2000)
      }
      setAudioOn(false)
    }
  }

  useEffect(() => {
    return () => { audioCtx.current?.close() }
  }, [])

  const fade = (fn) => {
    setVisible(false)
    setTimeout(() => { fn(); setVisible(true) }, 380)
  }

  const handleTap = () => {
    const p = randomFrom(releasePhrases)
    fade(() => { setPool(POOL.RELEASE); setPhrase(p); setPhase(PHASE.PHRASE) })
  }

  const handleAnother = () => {
    const pool_ = pool === POOL.RELEASE ? releasePhrases : sensoryPhrases
    fade(() => setPhrase(randomFrom(pool_, phrase)))
  }

  const handleSomethingElse = () => {
    const nextPool = pool === POOL.RELEASE ? POOL.SENSORY : POOL.RELEASE
    const nextPhrases = nextPool === POOL.RELEASE ? releasePhrases : sensoryPhrases
    fade(() => { setPool(nextPool); setPhrase(randomFrom(nextPhrases)) })
  }

  const handleGood = () => {
    fade(() => { setPhase(PHASE.LANDING); setPhrase('') })
  }

  return (
    <div className="app">
      <StaticBackground />

      {/* Audio toggle */}
      <button className="audio-toggle" onClick={toggleAudio} aria-label="Toggle audio">
        {audioOn ? '◉' : '○'}
      </button>

      <div className={`screen ${visible ? 'visible' : 'hidden'}`}>

        {phase === PHASE.LANDING && (
          <div className="center-layout">
            <p className={`tagline ${taglineVisible ? 'tagline-in' : 'tagline-out'}`}>
              {tagline}
            </p>
            <button className="idk-button" onClick={handleTap}>
              <span className="button-label">I don&apos;t know</span>
            </button>
          </div>
        )}

        {phase === PHASE.PHRASE && (
          <div className="center-layout">
            <p className="phrase">{phrase}</p>
            <div className="options">
              <button className="option-btn" onClick={handleAnother}>Another</button>
              <button className="option-btn" onClick={handleSomethingElse}>Something else</button>
              <button className="option-btn muted" onClick={handleGood}>I&apos;m good</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
